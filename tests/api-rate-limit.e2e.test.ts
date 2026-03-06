import { NextRequest } from "next/server";
import { clearRateLimitStore } from "@/lib/rate-limit";
import { getMediaAssetById } from "@/lib/media";
import { getSignedReadUrl } from "@/lib/s3";
import { isAdminAuthenticatedRequest } from "@/lib/auth";

vi.mock("@/lib/media", async () => {
  const actual = await vi.importActual<typeof import("@/lib/media")>("@/lib/media");
  return {
    ...actual,
    getMediaAssetById: vi.fn()
  };
});

vi.mock("@/lib/s3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/s3")>("@/lib/s3");
  return {
    ...actual,
    getSignedReadUrl: vi.fn()
  };
});

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    isAdminAuthenticatedRequest: vi.fn()
  };
});

describe("API rate limit (E2E simulated)", () => {
  beforeEach(() => {
    clearRateLimitStore();
    process.env.ADMIN_PASSWORD = "secret";
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.NEXTAUTH_SECRET = "secret-signature";
    vi.mocked(isAdminAuthenticatedRequest).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("limits public media endpoint after threshold", async () => {
    process.env.PUBLIC_MEDIA_MAX_ATTEMPTS = "1";
    process.env.PUBLIC_MEDIA_WINDOW_MS = "60000";
    process.env.PUBLIC_MEDIA_BLOCK_MS = "60000";

    vi.mocked(getMediaAssetById).mockResolvedValue({
      _id: { toHexString: () => "abc" } as never,
      slotId: "home.hero_visual",
      slotName: "Accueil - Hero visuel",
      slotAspect: "16/9",
      title: "media",
      kind: "image",
      storageKey: "media/key",
      storageBucket: "bucket",
      filename: "x.jpg",
      contentType: "image/jpeg",
      size: 42,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(getSignedReadUrl).mockResolvedValue("https://signed.example.test/object");

    const route = await import("@/app/api/media/[id]/route");

    const first = await route.GET(
      new NextRequest("http://localhost/api/media/abc", {
        headers: { "x-forwarded-for": "10.0.0.1" }
      }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(first.status).toBe(307);

    const second = await route.GET(
      new NextRequest("http://localhost/api/media/abc", {
        headers: { "x-forwarded-for": "10.0.0.1" }
      }),
      { params: Promise.resolve({ id: "abc" }) }
    );
    expect(second.status).toBe(429);
  });

  it("limits admin media delete after threshold", async () => {
    process.env.ADMIN_MEDIA_WRITE_MAX_ATTEMPTS = "1";
    process.env.ADMIN_MEDIA_WRITE_WINDOW_MS = "60000";
    process.env.ADMIN_MEDIA_WRITE_BLOCK_MS = "60000";

    const route = await import("@/app/api/admin/media/route");

    const first = await route.DELETE(
      new NextRequest("http://localhost/api/admin/media", {
        method: "DELETE",
        headers: {
          "x-forwarded-for": "10.0.0.2"
        }
      })
    );
    expect(first.status).toBe(400);

    const second = await route.DELETE(
      new NextRequest("http://localhost/api/admin/media", {
        method: "DELETE",
        headers: {
          "x-forwarded-for": "10.0.0.2"
        }
      })
    );
    expect(second.status).toBe(429);
  });

  it("limits admin media upload after threshold", async () => {
    process.env.ADMIN_MEDIA_WRITE_MAX_ATTEMPTS = "1";
    process.env.ADMIN_MEDIA_WRITE_WINDOW_MS = "60000";
    process.env.ADMIN_MEDIA_WRITE_BLOCK_MS = "60000";

    const route = await import("@/app/api/admin/media/route");
    const first = await route.POST(
      new NextRequest("http://localhost/api/admin/media", {
        method: "POST",
        body: new FormData(),
        headers: {
          "x-forwarded-for": "10.0.0.3"
        }
      })
    );
    expect(first.status).not.toBe(429);

    const second = await route.POST(
      new NextRequest("http://localhost/api/admin/media", {
        method: "POST",
        body: new FormData(),
        headers: {
          "x-forwarded-for": "10.0.0.3"
        }
      })
    );
    expect(second.status).toBe(429);
  });
});
