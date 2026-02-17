import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getSessionValue, isValidAdminPassword } from "@/lib/admin-auth";
import { checkRateLimit, registerFailure, resetRateLimitKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

function asPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const LOGIN_MAX_ATTEMPTS = asPositiveInt(process.env.ADMIN_LOGIN_MAX_ATTEMPTS, 5);
const LOGIN_WINDOW_MS = asPositiveInt(process.env.ADMIN_LOGIN_WINDOW_MS, 15 * 60 * 1000);
const LOGIN_BLOCK_MS = asPositiveInt(process.env.ADMIN_LOGIN_BLOCK_MS, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = `admin-login:${getClientIp(request)}`;
    const limit = checkRateLimit({
      key: rateLimitKey,
      maxAttempts: LOGIN_MAX_ATTEMPTS,
      windowMs: LOGIN_WINDOW_MS,
      blockMs: LOGIN_BLOCK_MS
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessayez dans ${limit.retryAfterSeconds ?? 60} secondes.`
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() || "";

    if (!isValidAdminPassword(password)) {
      registerFailure({ key: rateLimitKey, windowMs: LOGIN_WINDOW_MS });
      return NextResponse.json({ error: "Mot de passe invalide." }, { status: 401 });
    }

    resetRateLimitKey(rateLimitKey);

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: getSessionValue(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
