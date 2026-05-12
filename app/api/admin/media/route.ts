import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMediaAssetById, listMediaAssets, MEDIA_COLLECTION, type MediaAsset } from "@/lib/media";
import { buildSlotStorageKey, deleteFromS3, getS3BucketName, headObject } from "@/lib/s3";
import { isAdminAuthenticatedRequest } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { getMediaSlotById, listMediaSlots, type MediaAspectRatio } from "@/lib/media-slots";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  inferKind,
  validateTextField
} from "@/lib/admin-media-validation";

export const runtime = "nodejs";

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
    const media = await listMediaAssets({ limit: 100, publishedOnly: false });
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

// Confirm/register endpoint: called after the browser has uploaded the file
// directly to S3 via a presigned URL from /api/admin/media/presign.
// Receives JSON metadata (no file body), verifies the S3 object exists, then
// upserts the DB record.
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticatedRequest(request))) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const writeLimit = consumeRateLimit({
      key: `admin-media:confirm:${getClientIp(request)}`,
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

    const body = (await request.json()) as {
      slotId?: string;
      slotAspect?: string;
      storageKey?: string;
      contentType?: string;
      filename?: string;
      size?: number;
      title?: string;
      description?: string;
      published?: boolean;
    };

    const slotId = typeof body.slotId === "string" ? body.slotId.trim() : "";
    if (!slotId) {
      return NextResponse.json({ error: "Emplacement média manquant." }, { status: 400 });
    }
    const slot = getMediaSlotById(slotId);
    if (!slot) {
      return NextResponse.json({ error: "Emplacement média invalide." }, { status: 400 });
    }

    // storageKey must match the expected deterministic key for this slot —
    // prevents a client from registering an arbitrary S3 path.
    const expectedStorageKey = buildSlotStorageKey(slotId);
    if (body.storageKey !== expectedStorageKey) {
      return NextResponse.json({ error: "Clé de stockage invalide." }, { status: 400 });
    }

    const contentType = typeof body.contentType === "string" ? body.contentType.trim() : "";
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Type de fichier non supporté." }, { status: 400 });
    }

    const kind = inferKind(contentType);
    if (!kind || !slot.acceptedKinds.includes(kind)) {
      return NextResponse.json(
        { error: "Type de fichier incompatible avec cet emplacement." },
        { status: 400 }
      );
    }

    const rawSlotAspect = body.slotAspect;
    const slotAspect: MediaAspectRatio =
      rawSlotAspect === "16/9" || rawSlotAspect === "4/3" || rawSlotAspect === "1/1"
        ? rawSlotAspect
        : slot.recommendedAspect;

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

    // Verify the file was actually uploaded to S3 before writing the DB record.
    const s3Head = await headObject(expectedStorageKey);
    if (!s3Head) {
      return NextResponse.json(
        { error: "Le fichier n'a pas été trouvé en stockage. Réessayez l'upload." },
        { status: 400 }
      );
    }

    const title = titleValidation.value ?? slot.name;
    const description = descriptionValidation.value;
    const filename = typeof body.filename === "string" ? body.filename.trim() : "";
    const size = typeof body.size === "number" && body.size > 0 ? body.size : s3Head.size;
    const published = body.published === true;
    const storageBucket = getS3BucketName();

    const db = await getDb();
    const existingForSlot = await db.collection<MediaAsset>(MEDIA_COLLECTION).findOne({ slotId });
    const now = new Date();

    const upsertResult = await db.collection<MediaAsset>(MEDIA_COLLECTION).findOneAndUpdate(
      { slotId },
      {
        $set: {
          slotId,
          slotName: slot.name,
          slotAspect,
          title,
          description,
          kind,
          storageKey: expectedStorageKey,
          storageBucket,
          filename,
          contentType,
          size,
          published,
          updatedAt: now
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true, returnDocument: "after" }
    );

    const saved = upsertResult;
    if (!saved?._id) {
      return NextResponse.json({ error: "Impossible de sauvegarder le média." }, { status: 500 });
    }

    if (existingForSlot && existingForSlot.storageKey !== expectedStorageKey) {
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
          updatedAt: saved.updatedAt.toISOString(),
          url: `/api/media/${id}?v=${saved.updatedAt.getTime()}`
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
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
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
