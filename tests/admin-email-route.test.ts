import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { clearRateLimitStore } from "@/lib/rate-limit";
import { getServerAuthSession } from "@/lib/auth";
import { getAdminUserByEmail, updateAdminEmail, verifyPassword } from "@/lib/admin-users";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    getServerAuthSession: vi.fn()
  };
});

vi.mock("@/lib/admin-users", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin-users")>("@/lib/admin-users");
  return {
    ...actual,
    getAdminUserByEmail: vi.fn(),
    updateAdminEmail: vi.fn(),
    verifyPassword: vi.fn()
  };
});

describe("admin email route", () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.mocked(getServerAuthSession).mockResolvedValue({
      user: {
        email: "admin@example.com"
      }
    } as Awaited<ReturnType<typeof getServerAuthSession>>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates the email when the current password is valid", async () => {
    vi.mocked(getAdminUserByEmail)
      .mockResolvedValueOnce({
        _id: new ObjectId(),
        email: "admin@example.com",
        passwordHash: "stored-hash",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .mockResolvedValueOnce(null);
    vi.mocked(verifyPassword).mockReturnValue(true);
    vi.mocked(updateAdminEmail).mockResolvedValue({
      _id: new ObjectId(),
      email: "nouveau@example.com",
      passwordHash: "stored-hash",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const route = await import("@/app/api/admin/email/route");
    const response = await route.POST(
      new NextRequest("http://localhost/api/admin/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.4"
        },
        body: JSON.stringify({
          currentPassword: "very-secure-password",
          newEmail: "nouveau@example.com",
          confirmEmail: "nouveau@example.com"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(updateAdminEmail).toHaveBeenCalledWith("admin@example.com", "nouveau@example.com");
  });

  it("rejects the email change when the target email already exists", async () => {
    vi.mocked(getAdminUserByEmail)
      .mockResolvedValueOnce({
        _id: new ObjectId(),
        email: "admin@example.com",
        passwordHash: "stored-hash",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .mockResolvedValueOnce({
        _id: new ObjectId(),
        email: "nouveau@example.com",
        passwordHash: "other-hash",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    vi.mocked(verifyPassword).mockReturnValue(true);

    const route = await import("@/app/api/admin/email/route");
    const response = await route.POST(
      new NextRequest("http://localhost/api/admin/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.5"
        },
        body: JSON.stringify({
          currentPassword: "very-secure-password",
          newEmail: "nouveau@example.com",
          confirmEmail: "nouveau@example.com"
        })
      })
    );

    expect(response.status).toBe(409);
    expect(updateAdminEmail).not.toHaveBeenCalled();
  });
});
