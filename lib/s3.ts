import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.S3_REGION?.trim();
const bucket = process.env.S3_BUCKET?.trim();
const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
const endpoint = process.env.S3_ENDPOINT?.trim();

let s3Client: S3Client | undefined;

function assertS3Config() {
  if (!region) throw new Error("S3_REGION is missing.");
  if (!bucket) throw new Error("S3_BUCKET is missing.");
  if (!accessKeyId) throw new Error("S3_ACCESS_KEY_ID is missing.");
  if (!secretAccessKey) throw new Error("S3_SECRET_ACCESS_KEY is missing.");
}

export function getS3BucketName() {
  assertS3Config();
  return bucket as string;
}

function getS3Client() {
  assertS3Config();
  if (s3Client) return s3Client;

  const hasCustomEndpoint = Boolean(endpoint) && !endpoint!.includes("amazonaws.com");

  s3Client = new S3Client({
    region,
    endpoint: hasCustomEndpoint ? endpoint : undefined,
    forcePathStyle: hasCustomEndpoint,
    credentials: {
      accessKeyId: accessKeyId as string,
      secretAccessKey: secretAccessKey as string
    },
    // Prevent SDK v3 from injecting x-amz-checksum-mode=ENABLED into presigned
    // URLs — browsers can't satisfy that header and S3 rejects the request.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED"
  });

  return s3Client;
}

export function buildStorageKey(filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `media/${Date.now()}-${safeName}`;
}

export function buildSlotStorageKey(slotId: string) {
  const safeSlotId = slotId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `media/slots/${safeSlotId}`;
}

export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const client = getS3Client();
  const bucketName = getS3BucketName();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType
  });

  return client.send(command);
}

export async function deleteFromS3(key: string) {
  const client = getS3Client();
  const bucketName = getS3BucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  await client.send(command);
}

type CachedUrl = { url: string; expiresAt: number };
const presignedReadUrlCache = new Map<string, CachedUrl>();
// Cache TTL kept well below the 1-hour presigned URL expiry so we never serve
// a link that's about to expire.
const PRESIGNED_CACHE_TTL_MS = 50 * 60 * 1000;

export async function getSignedReadUrl(key: string, expiresInSeconds = 3600) {
  const now = Date.now();
  const cached = presignedReadUrlCache.get(key);
  if (cached && cached.expiresAt > now) return cached.url;

  const client = getS3Client();
  const bucketName = getS3BucketName();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  presignedReadUrlCache.set(key, { url, expiresAt: now + PRESIGNED_CACHE_TTL_MS });
  return url;
}

// NOTE: Direct browser-to-S3 uploads via this URL require the bucket to have a CORS rule
// allowing PUT from the site's origin with the Content-Type and Cache-Control headers allowed.
export async function getPresignedPutUrl(params: {
  key: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;
}) {
  const client = getS3Client();
  const bucketName = getS3BucketName();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: params.key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
    // Stored on the S3 object so browsers cache it for the presigned URL lifetime.
    CacheControl: "public, max-age=3600"
  });

  return getSignedUrl(client, command, { expiresIn: params.expiresInSeconds ?? 900 });
}

export async function headObject(key: string): Promise<{ size: number; contentType: string } | null> {
  const client = getS3Client();
  const bucketName = getS3BucketName();

  try {
    const result = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return {
      size: result.ContentLength ?? 0,
      contentType: result.ContentType ?? "application/octet-stream"
    };
  } catch {
    return null;
  }
}
