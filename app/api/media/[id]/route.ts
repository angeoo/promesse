import { NextRequest, NextResponse } from "next/server";
import { getMediaAssetById } from "@/lib/media";
import { getSignedReadUrl } from "@/lib/s3";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";

function asPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const PUBLIC_MEDIA_MAX_ATTEMPTS = asPositiveInt(process.env.PUBLIC_MEDIA_MAX_ATTEMPTS, 180);
const PUBLIC_MEDIA_WINDOW_MS = asPositiveInt(process.env.PUBLIC_MEDIA_WINDOW_MS, 60 * 1000);
const PUBLIC_MEDIA_BLOCK_MS = asPositiveInt(process.env.PUBLIC_MEDIA_BLOCK_MS, 5 * 60 * 1000);

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const mediaLimit = consumeRateLimit({
      key: `public-media:${getClientIp(request)}`,
      maxAttempts: PUBLIC_MEDIA_MAX_ATTEMPTS,
      windowMs: PUBLIC_MEDIA_WINDOW_MS,
      blockMs: PUBLIC_MEDIA_BLOCK_MS
    });
    if (!mediaLimit.allowed) {
      const retryAfter = mediaLimit.retryAfterSeconds ?? 60;
      return new NextResponse(`Trop de requêtes. Réessayez dans ${retryAfter} secondes.`, {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() }
      });
    }

    const { id } = await context.params;
    const media = await getMediaAssetById(id);

    if (!media) {
      return new NextResponse("Média introuvable", { status: 404 });
    }

    const signedUrl = await getSignedReadUrl(media.storageKey);
    return NextResponse.redirect(signedUrl, 307);
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
