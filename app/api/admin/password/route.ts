import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getAdminUserByEmail, updateAdminPassword, verifyPassword } from "@/lib/admin-users";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const PASSWORD_CHANGE_MAX_ATTEMPTS = 10;
const PASSWORD_CHANGE_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_CHANGE_BLOCK_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const limit = consumeRateLimit({
    key: `admin-password:${getClientIp(request)}`,
    maxAttempts: PASSWORD_CHANGE_MAX_ATTEMPTS,
    windowMs: PASSWORD_CHANGE_WINDOW_MS,
    blockMs: PASSWORD_CHANGE_BLOCK_MS
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
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const currentPassword = body.currentPassword?.trim() || "";
    const newPassword = body.newPassword?.trim() || "";
    const confirmPassword = body.confirmPassword?.trim() || "";

    if (!currentPassword || !newPassword || !confirmPassword) {
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

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l’ancien." },
        { status: 400 }
      );
    }

    const adminUser = await getAdminUserByEmail(session.user.email);
    if (!adminUser || !verifyPassword(currentPassword, adminUser.passwordHash)) {
      return NextResponse.json({ error: "Mot de passe actuel invalide." }, { status: 401 });
    }

    await updateAdminPassword(adminUser.email, newPassword);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
