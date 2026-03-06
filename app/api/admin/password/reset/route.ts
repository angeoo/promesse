import { NextRequest, NextResponse } from "next/server";
import { consumePasswordResetToken } from "@/lib/admin-password-resets";
import { updateAdminPassword } from "@/lib/admin-users";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const PASSWORD_RESET_MAX_ATTEMPTS = 10;
const PASSWORD_RESET_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_RESET_BLOCK_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request: NextRequest) {
  const limit = consumeRateLimit({
    key: `admin-password-reset:${getClientIp(request)}`,
    maxAttempts: PASSWORD_RESET_MAX_ATTEMPTS,
    windowMs: PASSWORD_RESET_WINDOW_MS,
    blockMs: PASSWORD_RESET_BLOCK_MS
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
    const body = (await request.json()) as {
      token?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const token = body.token?.trim() || "";
    const newPassword = body.newPassword?.trim() || "";
    const confirmPassword = body.confirmPassword?.trim() || "";

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "La confirmation ne correspond pas." }, { status: 400 });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Le nouveau mot de passe doit contenir entre ${MIN_PASSWORD_LENGTH} et ${MAX_PASSWORD_LENGTH} caractères.` },
        { status: 400 }
      );
    }

    const resetEntry = await consumePasswordResetToken(token);
    if (!resetEntry) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré." },
        { status: 400 }
      );
    }

    await updateAdminPassword(resetEntry.email, newPassword);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
