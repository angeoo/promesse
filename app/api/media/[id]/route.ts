import { NextResponse } from "next/server";
import { getMediaAssetById } from "@/lib/media";
import { getSignedReadUrl } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
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
