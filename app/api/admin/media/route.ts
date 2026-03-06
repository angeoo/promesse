import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMediaAssetById, listMediaAssets, MEDIA_COLLECTION, type MediaAsset, type MediaKind } from "@/lib/media";
import { buildSlotStorageKey, deleteFromS3, getS3BucketName, uploadToS3 } from "@/lib/s3";
import { isAdminAuthenticatedRequest } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { getMediaSlotById, listMediaSlots, type MediaAspectRatio } from "@/lib/media-slots";
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

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const slots = listMediaSlots();

  try {
    const media = await listMediaAssets({
      limit: 100,
      publishedOnly: false,
      includeSignedUrl: true,
      signedUrlExpiresInSeconds: 60 * 60 * 6
    });
    const mediaBySlot = new Map(media.map((item) => [item.slotId, item]));
    const slotStatus = slots.map((slot) => ({
      ...slot,
      currentMedia: mediaBySlot.get(slot.id) ?? null,
      available: !mediaBySlot.has(slot.id)
    }));

    return NextResponse.json({
      media,
      slots: slotStatus,
      summary: {
        totalSlots: slotStatus.length,
        availableSlots: slotStatus.filter((slot) => slot.available).length
      }
    });
  } catch (error) {
    const fallbackSlots = slots.map((slot) => ({
      ...slot,
      currentMedia: null,
      available: true
    }));
    return NextResponse.json({
      media: [],
      slots: fallbackSlots,
      warning: "Médias indisponibles temporairement. Vérifiez la connexion MongoDB.",
      details: error instanceof Error ? error.message : "Erreur serveur."
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const writeLimit = consumeRateLimit({
      key: `admin-media:post:${getClientIp(request)}`,
      maxAttempts: ADMIN_WRITE_MAX_ATTEMPTS,
      windowMs: ADMIN_WRITE_WINDOW_MS,
      blockMs: ADMIN_WRITE_BLOCK_MS
    });
    if (!writeLimit.allowed) {
      const retryAfter = writeLimit.retryAfterSeconds ?? 60;
      return NextResponse.json(
        { error: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.` },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const rawTitle = formData.get("title");
    const rawDescription = formData.get("description");
    const rawPublished = formData.get("published");
    const rawSlotId = formData.get("slotId");
    const rawSlotAspect = formData.get("slotAspect");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Le fichier est vide." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse 50 Mo. Réduisez sa taille avant upload." },
        { status: 400 }
      );
    }

    const slotId = typeof rawSlotId === "string" ? rawSlotId.trim() : "";
    if (!slotId) {
      return NextResponse.json({ error: "Veuillez sélectionner un emplacement média." }, { status: 400 });
    }
    const slot = getMediaSlotById(slotId);
    if (!slot) {
      return NextResponse.json({ error: "Emplacement média invalide." }, { status: 400 });
    }

    const titleValidation = validateTextField({
      value: rawTitle,
      fieldName: "titre",
      maxLength: MAX_TITLE_LENGTH
    });
    if (!titleValidation.ok) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 });
    }

    const descriptionValidation = validateTextField({
      value: rawDescription,
      fieldName: "description",
      maxLength: MAX_DESCRIPTION_LENGTH
    });
    if (!descriptionValidation.ok) {
      return NextResponse.json({ error: descriptionValidation.error }, { status: 400 });
    }

    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non supporté. Formats autorisés: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV."
        },
        { status: 400 }
      );
    }

    const kind = inferKind(contentType);
    if (!kind) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Envoyez une image ou une vidéo." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existingForSlot = await db.collection<MediaAsset>(MEDIA_COLLECTION).findOne({ slotId });
    const killSwitch = getKillSwitchConfig();
    if (killSwitch.enabled) {
      const usage = await db
        .collection(MEDIA_COLLECTION)
        .aggregate<{ totalAssets: number; totalBytes: number }>([
          {
            $group: {
              _id: null,
              totalAssets: { $sum: 1 },
              totalBytes: { $sum: "$size" }
            }
          }
        ])
        .next();

      const totalAssets = usage?.totalAssets ?? 0;
      const totalBytes = usage?.totalBytes ?? 0;
      const existingSize = existingForSlot?.size ?? 0;
      const projectedTotalBytes = totalBytes - existingSize + file.size;

      if (
        killSwitch.maxAssets &&
        totalAssets >= killSwitch.maxAssets &&
        !existingForSlot
      ) {
        return NextResponse.json(
          {
            error: `Kill switch actif: quota atteint (${totalAssets}/${killSwitch.maxAssets} médias).`
          },
          { status: 403 }
        );
      }

      if (killSwitch.maxTotalBytes && projectedTotalBytes > killSwitch.maxTotalBytes) {
        const currentMb = Math.ceil(projectedTotalBytes / (1024 * 1024));
        const maxMb = Math.floor(killSwitch.maxTotalBytes / (1024 * 1024));
        return NextResponse.json(
          {
            error: `Kill switch actif: quota stockage atteint (${currentMb} MB/${maxMb} MB).`
          },
          { status: 403 }
        );
      }
    }

    if (!slot.acceptedKinds.includes(kind)) {
      return NextResponse.json(
        {
          error: `Ce slot accepte: ${slot.acceptedKinds.join(" / ")}. Fichier actuel: ${kind}.`
        },
        { status: 400 }
      );
    }

    const title = titleValidation.value ?? slot.name;
    const description = descriptionValidation.value;
    const published = rawPublished === "true";
    const slotAspect: MediaAspectRatio =
      rawSlotAspect === "16/9" || rawSlotAspect === "4/3" || rawSlotAspect === "1/1"
        ? rawSlotAspect
        : slot.recommendedAspect;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const storageKey = buildSlotStorageKey(slotId);
    const storageBucket = getS3BucketName();

    await uploadToS3({
      key: storageKey,
      body: buffer,
      contentType
    });

    const now = new Date();
    const baseDoc = {
      slotId,
      slotName: slot.name,
      slotAspect,
      title,
      description,
      kind,
      storageKey,
      storageBucket,
      filename: file.name,
      contentType,
      size: file.size,
      published
    };

    const upsertResult = await db.collection<MediaAsset>(MEDIA_COLLECTION).findOneAndUpdate(
      { slotId },
      {
        $set: {
          ...baseDoc,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    const saved = upsertResult;
    if (!saved?._id) {
      return NextResponse.json({ error: "Impossible de sauvegarder le média." }, { status: 500 });
    }
    if (existingForSlot && existingForSlot.storageKey !== storageKey) {
      await deleteFromS3(existingForSlot.storageKey);
    }
    const id = saved._id.toHexString();

    return NextResponse.json(
      {
        media: {
          id,
          slotId: saved.slotId,
          slotName: saved.slotName,
          slotAspect: saved.slotAspect,
          title: saved.title,
          description: saved.description,
          kind: saved.kind,
          filename: saved.filename,
          contentType: saved.contentType,
          size: saved.size,
          published: saved.published,
          createdAt: saved.createdAt.toISOString(),
          url: `/api/media/${id}`
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const writeLimit = consumeRateLimit({
      key: `admin-media:delete:${getClientIp(request)}`,
      maxAttempts: ADMIN_WRITE_MAX_ATTEMPTS,
      windowMs: ADMIN_WRITE_WINDOW_MS,
      blockMs: ADMIN_WRITE_BLOCK_MS
    });
    if (!writeLimit.allowed) {
      const retryAfter = writeLimit.retryAfterSeconds ?? 60;
      return NextResponse.json(
        { error: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.` },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() }
        }
      );
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    }

    const media = await getMediaAssetById(id);
    if (!media) {
      return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
    }

    const db = await getDb();
    await deleteFromS3(media.storageKey);
    await db.collection(MEDIA_COLLECTION).deleteOne({ _id: media._id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}
