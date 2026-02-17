import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "promesse_admin_session";

function getSecret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function getSessionValue() {
  const payload = "admin-session-v1";
  return `${payload}.${signPayload(payload)}`;
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

export function isAdminAuthenticatedRequest(request: NextRequest) {
  const expected = getSessionValue();
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) return false;
  return safeEqual(cookieValue, expected);
}

export function isValidAdminPassword(input: string) {
  const configuredPassword = getPassword();
  if (!configuredPassword) return false;
  return safeEqual(input, configuredPassword);
}

