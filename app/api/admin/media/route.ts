import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMediaAssetById, listMediaAssets, MEDIA_COLLECTION, type MediaKind } from "@/lib/media";
import { buildStorageKey, deleteFromS3, getS3BucketName, uploadToS3 } from "@/lib/s3";
import { isAdminAuthenticatedRequest } from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

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

function inferKind(contentType: string): MediaKind | null {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthenticatedRequest(request)) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const media = await listMediaAssets({
      limit: 100,
      publishedOnly: false,
      includeSignedUrl: true,
      signedUrlExpiresInSeconds: 60 * 60 * 6
    });
    return NextResponse.json({ media });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthenticatedRequest(request)) {
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

    const db = await getDb();
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

      if (killSwitch.maxAssets && totalAssets >= killSwitch.maxAssets) {
        return NextResponse.json(
          {
            error: `Kill switch actif: quota atteint (${totalAssets}/${killSwitch.maxAssets} médias).`
          },
          { status: 403 }
        );
      }

      if (killSwitch.maxTotalBytes && totalBytes + file.size > killSwitch.maxTotalBytes) {
        const currentMb = Math.ceil(totalBytes / (1024 * 1024));
        const maxMb = Math.floor(killSwitch.maxTotalBytes / (1024 * 1024));
        return NextResponse.json(
          {
            error: `Kill switch actif: quota stockage atteint (${currentMb} MB/${maxMb} MB).`
          },
          { status: 403 }
        );
      }
    }

    const contentType = file.type || "application/octet-stream";
    const kind = inferKind(contentType);

    if (!kind) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Envoyez une image ou une vidéo." },
        { status: 400 }
      );
    }

    const title =
      typeof rawTitle === "string" && rawTitle.trim().length > 0 ? rawTitle.trim() : file.name;
    const description =
      typeof rawDescription === "string" && rawDescription.trim().length > 0
        ? rawDescription.trim()
        : undefined;
    const published = rawPublished === "true";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const storageKey = buildStorageKey(file.name);
    const storageBucket = getS3BucketName();

    await uploadToS3({
      key: storageKey,
      body: buffer,
      contentType
    });

    const now = new Date();
    const doc = {
      title,
      description,
      kind,
      storageKey,
      storageBucket,
      filename: file.name,
      contentType,
      size: file.size,
      published,
      createdAt: now,
      updatedAt: now
    };

    const insertResult = await db.collection(MEDIA_COLLECTION).insertOne(doc);
    const id = insertResult.insertedId.toHexString();

    return NextResponse.json(
      {
        media: {
          id,
          title: doc.title,
          description: doc.description,
          kind: doc.kind,
          filename: doc.filename,
          contentType: doc.contentType,
          size: doc.size,
          published: doc.published,
          createdAt: doc.createdAt.toISOString(),
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
    if (!isAdminAuthenticatedRequest(request)) {
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
