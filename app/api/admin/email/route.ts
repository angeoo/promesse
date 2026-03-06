import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getAdminUserByEmail, updateAdminEmail, verifyPassword } from "@/lib/admin-users";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const EMAIL_CHANGE_MAX_ATTEMPTS = 5;
const EMAIL_CHANGE_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_CHANGE_BLOCK_MS = 15 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const limit = consumeRateLimit({
    key: `admin-email:${getClientIp(request)}`,
    maxAttempts: EMAIL_CHANGE_MAX_ATTEMPTS,
    windowMs: EMAIL_CHANGE_WINDOW_MS,
    blockMs: EMAIL_CHANGE_BLOCK_MS
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
      newEmail?: string;
      confirmEmail?: string;
    };

    const currentPassword = body.currentPassword?.trim() || "";
    const newEmail = body.newEmail?.trim().toLowerCase() || "";
    const confirmEmail = body.confirmEmail?.trim().toLowerCase() || "";

    if (!currentPassword || !newEmail || !confirmEmail) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    if (newEmail !== confirmEmail) {
      return NextResponse.json({ error: "La confirmation de l’email ne correspond pas." }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(newEmail)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (newEmail === session.user.email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "Le nouvel email doit être différent de l’actuel." },
        { status: 400 }
      );
    }

    const adminUser = await getAdminUserByEmail(session.user.email);
    if (!adminUser || !verifyPassword(currentPassword, adminUser.passwordHash)) {
      return NextResponse.json({ error: "Mot de passe actuel invalide." }, { status: 401 });
    }

    const existingAdmin = await getAdminUserByEmail(newEmail);
    if (existingAdmin) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    await updateAdminEmail(adminUser.email, newEmail);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
