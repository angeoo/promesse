import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSignedReadUrl } from "@/lib/s3";

export type MediaKind = "image" | "video";

export type MediaAsset = {
  _id: ObjectId;
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
  title: string;
  description?: string;
  kind: MediaKind;
  filename: string;
  contentType: string;
  size: number;
  published: boolean;
  createdAt: string;
  url: string;
};

export const MEDIA_COLLECTION = "mediaAssets";

async function toMediaAssetDTO(
  asset: MediaAsset,
  options?: { includeSignedUrl?: boolean; signedUrlExpiresInSeconds?: number }
): Promise<MediaAssetDTO> {
  const id = asset._id.toHexString();
  let url = `/api/media/${id}`;

  if (options?.includeSignedUrl) {
    try {
      url = await getSignedReadUrl(asset.storageKey, options.signedUrlExpiresInSeconds ?? 3600);
    } catch {
      url = `/api/media/${id}`;
    }
  }

  return {
    id,
    title: asset.title,
    description: asset.description,
    kind: asset.kind,
    filename: asset.filename,
    contentType: asset.contentType,
    size: asset.size,
    published: asset.published,
    createdAt: asset.createdAt.toISOString(),
    url
  };
}

export async function listMediaAssets(options?: {
  limit?: number;
  publishedOnly?: boolean;
  includeSignedUrl?: boolean;
  signedUrlExpiresInSeconds?: number;
}): Promise<MediaAssetDTO[]> {
  const db = await getDb();
  const limit = options?.limit ?? 50;
  const publishedOnly = options?.publishedOnly ?? false;

  const filter = publishedOnly ? { published: true } : {};

  const docs = await db
    .collection<MediaAsset>(MEDIA_COLLECTION)
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

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
