import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.S3_REGION;
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const endpoint = process.env.S3_ENDPOINT;

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

  s3Client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: !!endpoint,
    credentials: {
      accessKeyId: accessKeyId as string,
      secretAccessKey: secretAccessKey as string
    }
  });

  return s3Client;
}

export function buildStorageKey(filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `media/${Date.now()}-${safeName}`;
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

export async function getSignedReadUrl(key: string, expiresInSeconds = 3600) {
  const client = getS3Client();
  const bucketName = getS3BucketName();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

