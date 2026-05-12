import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MEDIA_COLLECTION, type MediaAsset } from "@/lib/media";
import { buildSlotStorageKey, getPresignedPutUrl } from "@/lib/s3";
import { isAdminAuthenticatedRequest } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { getMediaSlotById } from "@/lib/media-slots";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE,
  MAX_TITLE_LENGTH,
  inferKind,
  validateTextField
} from "@/lib/admin-media-validation";

export const runtime = "nodejs";

type KillSwitchConfig = {
  enabled: boolean;
  maxAssets: number | null;
  maxTotalBytes: number | null;
};

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function getKillSwitchConfig(): KillSwitchConfig {
  const enabled = process.env.MEDIA_KILL_SWITCH_ENABLED === "true";
  const maxAssets = parsePositiveInt(process.env.MEDIA_MAX_ASSETS);
  const maxTotalBytesMb = parsePositiveInt(process.env.MEDIA_MAX_TOTAL_MB);
  return {
    enabled,
    maxAssets,
    maxTotalBytes: maxTotalBytesMb ? maxTotalBytesMb * 1024 * 1024 : null
  };
}

function asPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const ADMIN_WRITE_MAX_ATTEMPTS = asPositiveInt(process.env.ADMIN_MEDIA_WRITE_MAX_ATTEMPTS, 30);
const ADMIN_WRITE_WINDOW_MS = asPositiveInt(process.env.ADMIN_MEDIA_WRITE_WINDOW_MS, 15 * 60 * 1000);
const ADMIN_WRITE_BLOCK_MS = asPositiveInt(process.env.ADMIN_MEDIA_WRITE_BLOCK_MS, 15 * 60 * 1000);

// Fallback MIME detection from file extension for browsers that don't report it
// correctly (e.g. .mov reported as empty on Firefox/Windows).
const EXT_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  pdf: "application/pdf"
};

function resolveMimeType(contentType: string, filename: string): string {
  if (contentType && contentType !== "application/octet-stream" && ALLOWED_CONTENT_TYPES.has(contentType)) {
    return contentType;
  }
  const ext = (filename.split(".").pop() ?? "").toLowerCase();
  return EXT_MIME_MAP[ext] ?? contentType ?? "application/octet-stream";
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const writeLimit = consumeRateLimit({
    key: `admin-media:presign:${getClientIp(request)}`,
    maxAttempts: ADMIN_WRITE_MAX_ATTEMPTS,
    windowMs: ADMIN_WRITE_WINDOW_MS,
    blockMs: ADMIN_WRITE_BLOCK_MS
  });
  if (!writeLimit.allowed) {
    const retryAfter = writeLimit.retryAfterSeconds ?? 60;
    return NextResponse.json(
      { error: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.` },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  try {
    const body = (await request.json()) as {
      slotId?: string;
      slotAspect?: string;
      contentType?: string;
      filename?: string;
      size?: number;
      title?: string;
      description?: string;
      published?: boolean;
    };

    const slotId = typeof body.slotId === "string" ? body.slotId.trim() : "";
    if (!slotId) {
      return NextResponse.json({ error: "Veuillez sélectionner un emplacement média." }, { status: 400 });
    }
    const slot = getMediaSlotById(slotId);
    if (!slot) {
      return NextResponse.json({ error: "Emplacement média invalide." }, { status: 400 });
    }

    const filename = typeof body.filename === "string" ? body.filename.trim() : "";
    if (!filename) {
      return NextResponse.json({ error: "Nom de fichier requis." }, { status: 400 });
    }

    const rawContentType = typeof body.contentType === "string" ? body.contentType.trim() : "";
    const contentType = resolveMimeType(rawContentType, filename);
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Formats autorisés: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, PDF." },
        { status: 400 }
      );
    }

    const kind = inferKind(contentType);
    if (!kind) {
      return NextResponse.json({ error: "Type de fichier non supporté." }, { status: 400 });
    }

    if (!slot.acceptedKinds.includes(kind)) {
      return NextResponse.json(
        { error: `Ce slot accepte: ${slot.acceptedKinds.join(" / ")}. Fichier actuel: ${kind}.` },
        { status: 400 }
      );
    }

    const size = typeof body.size === "number" ? body.size : 0;
    if (size <= 0) {
      return NextResponse.json({ error: "Le fichier est vide." }, { status: 400 });
    }
    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse 50 Mo. Réduisez sa taille avant upload." },
        { status: 400 }
      );
    }

    const titleValidation = validateTextField({
      value: typeof body.title === "string" ? body.title : null,
      fieldName: "titre",
      maxLength: MAX_TITLE_LENGTH
    });
    if (!titleValidation.ok) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 });
    }

    const descriptionValidation = validateTextField({
      value: typeof body.description === "string" ? body.description : null,
      fieldName: "description",
      maxLength: MAX_DESCRIPTION_LENGTH
    });
    if (!descriptionValidation.ok) {
      return NextResponse.json({ error: descriptionValidation.error }, { status: 400 });
    }

    const db = await getDb();
    const existingForSlot = await db.collection<MediaAsset>(MEDIA_COLLECTION).findOne({ slotId });

    const killSwitch = getKillSwitchConfig();
    if (killSwitch.enabled) {
      const usage = await db
        .collection(MEDIA_COLLECTION)
        .aggregate<{ totalAssets: number; totalBytes: number }>([
          { $group: { _id: null, totalAssets: { $sum: 1 }, totalBytes: { $sum: "$size" } } }
        ])
        .next();

      const totalAssets = usage?.totalAssets ?? 0;
      const totalBytes = usage?.totalBytes ?? 0;
      const existingSize = existingForSlot?.size ?? 0;
      const projectedTotalBytes = totalBytes - existingSize + size;

      if (killSwitch.maxAssets && totalAssets >= killSwitch.maxAssets && !existingForSlot) {
        return NextResponse.json(
          { error: `Kill switch actif: quota atteint (${totalAssets}/${killSwitch.maxAssets} médias).` },
          { status: 403 }
        );
      }
      if (killSwitch.maxTotalBytes && projectedTotalBytes > killSwitch.maxTotalBytes) {
        const currentMb = Math.ceil(projectedTotalBytes / (1024 * 1024));
        const maxMb = Math.floor(killSwitch.maxTotalBytes / (1024 * 1024));
        return NextResponse.json(
          { error: `Kill switch actif: quota stockage atteint (${currentMb} MB/${maxMb} MB).` },
          { status: 403 }
        );
      }
    }

    const storageKey = buildSlotStorageKey(slotId);
    const uploadUrl = await getPresignedPutUrl({
      key: storageKey,
      contentType,
      contentLength: size,
      expiresInSeconds: 900
    });

    return NextResponse.json({ uploadUrl, storageKey, resolvedContentType: contentType });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}
