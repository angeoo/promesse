import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { Collection, WithId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const ADMIN_USERS_COLLECTION = "adminUsers";
const SCRYPT_KEY_LENGTH = 64;

export type AdminUser = {
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
};

function getCollection(): Promise<Collection<AdminUser>> {
  return getDb().then((db) => db.collection<AdminUser>(ADMIN_USERS_COLLECTION));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");

  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export async function countAdminUsers() {
  const collection = await getCollection();
  return collection.countDocuments();
}

export async function getAdminUserByEmail(email: string) {
  const collection = await getCollection();
  return collection.findOne({ email: normalizeEmail(email) });
}

export async function createAdminUser(params: { email: string; password: string }) {
  const collection = await getCollection();
  const now = new Date();
  const email = normalizeEmail(params.email);
  const passwordHash = hashPassword(params.password);

  await collection.updateOne(
    { email },
    {
      $setOnInsert: {
        email,
        role: "admin",
        createdAt: now
      },
      $set: {
        passwordHash,
        updatedAt: now
      }
    },
    { upsert: true }
  );

  return getAdminUserByEmail(email);
}

export async function updateAdminPassword(email: string, newPassword: string) {
  const collection = await getCollection();
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = hashPassword(newPassword);
  const now = new Date();

  await collection.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        passwordHash,
        updatedAt: now
      }
    }
  );

  return getAdminUserByEmail(normalizedEmail);
}

export async function updateAdminEmail(currentEmail: string, newEmail: string) {
  const collection = await getCollection();
  const normalizedCurrentEmail = normalizeEmail(currentEmail);
  const normalizedNewEmail = normalizeEmail(newEmail);
  const now = new Date();

  if (normalizedCurrentEmail === normalizedNewEmail) {
    return getAdminUserByEmail(normalizedCurrentEmail);
  }

  await collection.updateOne(
    { email: normalizedCurrentEmail },
    {
      $set: {
        email: normalizedNewEmail,
        updatedAt: now
      }
    }
  );

  return getAdminUserByEmail(normalizedNewEmail);
}

export async function bootstrapAdminUserIfNeeded(params: { email: string; password: string }) {
  const bootstrapEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const bootstrapPassword = (process.env.ADMIN_PASSWORD || "").trim();

  if (!bootstrapEmail || !bootstrapPassword) return null;

  const requestedEmail = normalizeEmail(params.email);
  const requestedPassword = params.password.trim();

  if (!safeEqual(requestedEmail, bootstrapEmail) || !safeEqual(requestedPassword, bootstrapPassword)) {
    return null;
  }

  const existingCount = await countAdminUsers();
  if (existingCount > 0) {
    return getAdminUserByEmail(requestedEmail);
  }

  return createAdminUser({
    email: bootstrapEmail,
    password: bootstrapPassword
  });
}

export type StoredAdminUser = WithId<AdminUser>;
