import { NextRequest, NextResponse } from "next/server";
import { getAdminUserByEmail } from "@/lib/admin-users";
import { createPasswordResetToken, getPasswordResetTtlMs } from "@/lib/admin-password-resets";
import { sendPasswordResetEmail, isPasswordResetEmailConfigured } from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { getSiteUrl } from "@/lib/site-url";

const PASSWORD_FORGOT_MAX_ATTEMPTS = 5;
const PASSWORD_FORGOT_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_FORGOT_BLOCK_MS = 15 * 60 * 1000;

const GENERIC_SUCCESS_MESSAGE =
  "Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé.";

export async function POST(request: NextRequest) {
  if (!isPasswordResetEmailConfigured()) {
    return NextResponse.json(
      { error: "Réinitialisation par email non configurée." },
      { status: 503 }
    );
  }

  const limit = consumeRateLimit({
    key: `admin-password-forgot:${getClientIp(request)}`,
    maxAttempts: PASSWORD_FORGOT_MAX_ATTEMPTS,
    windowMs: PASSWORD_FORGOT_WINDOW_MS,
    blockMs: PASSWORD_FORGOT_BLOCK_MS
  });

  if (!limit.allowed) {
    const retryAfter = limit.retryAfterSeconds ?? 60;
    return NextResponse.json(
      { error: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.` },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() }
      }
    );
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() || "";

    if (!email) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const adminUser = await getAdminUserByEmail(email);
    if (adminUser) {
      const { token } = await createPasswordResetToken(adminUser.email);
      const resetUrl = `${getSiteUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail({
        to: adminUser.email,
        resetUrl
      });
    }

    return NextResponse.json({
      ok: true,
      message: GENERIC_SUCCESS_MESSAGE,
      expiresInMinutes: Math.round(getPasswordResetTtlMs() / 60000)
    });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
