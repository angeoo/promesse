import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { clearRateLimitStore } from "@/lib/rate-limit";
import { createPasswordResetToken, consumePasswordResetToken } from "@/lib/admin-password-resets";
import { getAdminUserByEmail, updateAdminPassword } from "@/lib/admin-users";
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

vi.mock("@/lib/admin-password-resets", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin-password-resets")>(
    "@/lib/admin-password-resets"
  );
  return {
    ...actual,
    createPasswordResetToken: vi.fn(),
    consumePasswordResetToken: vi.fn()
  };
});

vi.mock("@/lib/admin-users", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin-users")>("@/lib/admin-users");
  return {
    ...actual,
    getAdminUserByEmail: vi.fn(),
    updateAdminPassword: vi.fn()
  };
});

vi.mock("@/lib/email", async () => {
  const actual = await vi.importActual<typeof import("@/lib/email")>("@/lib/email");
  return {
    ...actual,
    isPasswordResetEmailConfigured: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  };
});

describe("admin password reset routes", () => {
  beforeEach(() => {
    clearRateLimitStore();
    process.env.NEXT_PUBLIC_SITE_URL = "https://promesse.example";
    vi.mocked(isPasswordResetEmailConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a generic success response for forgot password", async () => {
    vi.mocked(getAdminUserByEmail).mockResolvedValue({
      _id: new ObjectId(),
      email: "admin@example.com",
      passwordHash: "stored-hash",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.mocked(createPasswordResetToken).mockResolvedValue({
      token: "reset-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    const route = await import("@/app/api/admin/password/forgot/route");
    const response = await route.POST(
      new NextRequest("http://localhost/api/admin/password/forgot", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.6"
        },
        body: JSON.stringify({
          email: "admin@example.com"
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toMatch(/si un compte existe/i);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({
      to: "admin@example.com",
      resetUrl: "https://promesse.example/admin/reset-password?token=reset-token"
    });
  });

  it("does not reveal whether the admin email exists", async () => {
    vi.mocked(getAdminUserByEmail).mockResolvedValue(null);

    const route = await import("@/app/api/admin/password/forgot/route");
    const response = await route.POST(
      new NextRequest("http://localhost/api/admin/password/forgot", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.7"
        },
        body: JSON.stringify({
          email: "unknown@example.com"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("updates the password when the reset token is valid", async () => {
    vi.mocked(consumePasswordResetToken).mockResolvedValue({
      _id: new ObjectId(),
      email: "admin@example.com",
      tokenHash: "hashed",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000)
    });

    const route = await import("@/app/api/admin/password/reset/route");
    const response = await route.POST(
      new NextRequest("http://localhost/api/admin/password/reset", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.8"
        },
        body: JSON.stringify({
          token: "reset-token",
          newPassword: "very-secure-password",
          confirmPassword: "very-secure-password"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(updateAdminPassword).toHaveBeenCalledWith("admin@example.com", "very-secure-password");
  });

  it("rejects an invalid reset token", async () => {
    vi.mocked(consumePasswordResetToken).mockResolvedValue(null);

    const route = await import("@/app/api/admin/password/reset/route");
    const response = await route.POST(
      new NextRequest("http://localhost/api/admin/password/reset", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.9"
        },
        body: JSON.stringify({
          token: "invalid-token",
          newPassword: "very-secure-password",
          confirmPassword: "very-secure-password"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(updateAdminPassword).not.toHaveBeenCalled();
  });
});
