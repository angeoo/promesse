import { ObjectId } from "mongodb";
import { unstable_noStore as noStore } from "next/cache";
import { getDb } from "@/lib/mongodb";
import { getSignedReadUrl } from "@/lib/s3";
import type { MediaAspectRatio } from "@/lib/media-slots";

export type MediaKind = "image" | "video";

export type MediaAsset = {
  _id: ObjectId;
  slotId: string;
  slotName: string;
  slotAspect: MediaAspectRatio;
  title: string;
  description?: string;
  kind: MediaKind;
  storageKey: string;
  storageBucket: string;
  filename: string;
  contentType: string;
  size: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaAssetDTO = {
  id: string;
  slotId: string;
  slotName: string;
  slotAspect: MediaAspectRatio;
  title: string;
  description?: string;
  kind: MediaKind;
  filename: string;
  contentType: string;
  size: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
};

export const MEDIA_COLLECTION = "mediaAssets";
const PUBLIC_MEDIA_QUERY_TIMEOUT_MS = 2000;
const ADMIN_MEDIA_QUERY_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}

async function toMediaAssetDTO(
  asset: MediaAsset,
  options?: { includeSignedUrl?: boolean; signedUrlExpiresInSeconds?: number }
): Promise<MediaAssetDTO> {
  const id = asset._id.toHexString();
  const slotId = asset.slotId || `legacy-${id}`;
  let url = `/api/media/${id}?v=${asset.updatedAt.getTime()}`;

  if (options?.includeSignedUrl) {
    try {
      url = await getSignedReadUrl(asset.storageKey, options.signedUrlExpiresInSeconds ?? 3600);
    } catch {
      url = `/api/media/${id}`;
    }
  }

  return {
    id,
    slotId,
    slotName: asset.slotName || slotId,
    slotAspect: asset.slotAspect || "16/9",
    title: asset.title,
    description: asset.description,
    kind: asset.kind,
    filename: asset.filename,
    contentType: asset.contentType,
    size: asset.size,
    published: asset.published,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    url
  };
}

export async function listMediaAssets(options?: {
  limit?: number;
  publishedOnly?: boolean;
  includeSignedUrl?: boolean;
  signedUrlExpiresInSeconds?: number;
}): Promise<MediaAssetDTO[]> {
  const limit = options?.limit ?? 50;
  const publishedOnly = options?.publishedOnly ?? false;

  const filter = publishedOnly ? { published: true } : {};

  const docs = await withTimeout(
    (async () => {
      const db = await getDb();
      return db
        .collection<MediaAsset>(MEDIA_COLLECTION)
        .find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(limit)
        .toArray();
    })(),
    ADMIN_MEDIA_QUERY_TIMEOUT_MS,
    "Admin media query timed out."
  );

  return Promise.all(
    docs.map((doc) =>
      toMediaAssetDTO(doc, {
        includeSignedUrl: options?.includeSignedUrl,
        signedUrlExpiresInSeconds: options?.signedUrlExpiresInSeconds
      })
    )
  );
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  return db.collection<MediaAsset>(MEDIA_COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function listPublishedMediaBySlotIds(
  slotIds: string[],
  options?: { includeSignedUrl?: boolean; signedUrlExpiresInSeconds?: number }
): Promise<Record<string, MediaAssetDTO>> {
  noStore();
  if (slotIds.length === 0) return {};
  try {
    const docs = await withTimeout(
      (async () => {
        const db = await getDb();
        return db
          .collection<MediaAsset>(MEDIA_COLLECTION)
          .find({
            published: true,
            slotId: { $in: slotIds }
          })
          .toArray();
      })(),
      PUBLIC_MEDIA_QUERY_TIMEOUT_MS,
      "Media query timed out."
    );

    const dtoList = await Promise.all(
      docs.map((doc) =>
        toMediaAssetDTO(doc, {
          includeSignedUrl: options?.includeSignedUrl,
          signedUrlExpiresInSeconds: options?.signedUrlExpiresInSeconds
        })
      )
    );

    return dtoList.reduce<Record<string, MediaAssetDTO>>((acc, item) => {
      acc[item.slotId] = item;
      return acc;
    }, {});
  } catch {
    return {};
  }
}
