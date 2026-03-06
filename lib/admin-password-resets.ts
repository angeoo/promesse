import { createHash, randomBytes } from "crypto";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";

const ADMIN_PASSWORD_RESETS_COLLECTION = "adminPasswordResets";
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

type AdminPasswordResetToken = {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
};

function getCollection(): Promise<Collection<AdminPasswordResetToken>> {
  return getDb().then((db) =>
    db.collection<AdminPasswordResetToken>(ADMIN_PASSWORD_RESETS_COLLECTION)
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetTtlMs() {
  return PASSWORD_RESET_TTL_MS;
}

export async function createPasswordResetToken(email: string) {
  const collection = await getCollection();
  const normalizedEmail = normalizeEmail(email);
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MS);

  await collection.deleteMany({ email: normalizedEmail });
  await collection.insertOne({
    email: normalizedEmail,
    tokenHash,
    createdAt: now,
    expiresAt
  });

  return {
    token: rawToken,
    expiresAt
  };
}

export async function consumePasswordResetToken(token: string) {
  const collection = await getCollection();
  const now = new Date();
  const tokenHash = hashToken(token);

  const result = await collection.findOneAndUpdate(
    {
      tokenHash,
      expiresAt: { $gt: now },
      usedAt: { $exists: false }
    },
    {
      $set: {
        usedAt: now
      }
    },
    {
      returnDocument: "before"
    }
  );

  return result;
}
