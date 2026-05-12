import { createHmac } from "crypto";
import type { NextRequest } from "next/server";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import { bootstrapAdminUserIfNeeded, getAdminUserByEmail, verifyPassword } from "@/lib/admin-users";
import { checkRateLimit, registerFailure, resetRateLimitKey } from "@/lib/rate-limit";

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

// NEXTAUTH_SECRET is required. Falling back to ADMIN_PASSWORD would mean the
// JWT signing key equals the admin password — a credential leak exposes tokens.
function getAuthSecret() {
  return (process.env.NEXTAUTH_SECRET || "").trim();
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim()) && getAuthSecret().length > 0;
}

function buildAdminUser() {
  return {
    id: createHmac("sha256", getAuthSecret()).update(getAdminEmail()).digest("hex"),
    email: getAdminEmail(),
    role: "admin" as const,
    name: "Admin Promesse"
  };
}

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret() || undefined,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin"
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!isAdminAuthConfigured()) return null;

        const email = credentials?.email?.trim().toLowerCase() || "";
        const password = credentials?.password?.trim() || "";
        if (!email || !password) return null;

        // Rate-limit by email: 5 failed attempts per 15 min, then block for 15 min.
        // Only failed attempts count — success resets the counter.
        const rateLimitKey = `admin-login:${email}`;
        const check = checkRateLimit({
          key: rateLimitKey,
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
          blockMs: 15 * 60 * 1000
        });
        if (!check.allowed) return null;

        const bootstrappedUser = await bootstrapAdminUserIfNeeded({ email, password });
        const adminUser = bootstrappedUser ?? (await getAdminUserByEmail(email));

        if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
          registerFailure({ key: rateLimitKey, windowMs: 15 * 60 * 1000 });
          return null;
        }

        resetRateLimitKey(rateLimitKey);
        return {
          ...buildAdminUser(),
          email: adminUser.email
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.email = user.email;
        // Bind the session to the user's current state. If the account is updated
        // (password or email change), updatedAt advances and the stored value here
        // becomes stale — isAdminAuthenticatedRequest will reject the token.
        const adminUser = await getAdminUserByEmail(user.email ?? "");
        token.sessionBoundAt = adminUser?.updatedAt.getTime() ?? Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = typeof token.email === "string" ? token.email : session.user.email;
        (session.user as typeof session.user & { role?: string }).role =
          typeof token.role === "string" ? token.role : undefined;
      }
      return session;
    }
  }
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}

export async function isAdminAuthenticatedRequest(request: NextRequest) {
  const token = await getToken({ req: request, secret: getAuthSecret() });
  if (token?.role !== "admin") return false;

  // Reject tokens issued before the last account update (password/email change).
  const sessionBoundAt = token.sessionBoundAt as number | undefined;
  if (sessionBoundAt !== undefined) {
    const adminUser = await getAdminUserByEmail(token.email as string);
    if (!adminUser || adminUser.updatedAt.getTime() > sessionBoundAt) return false;
  }

  return true;
}
