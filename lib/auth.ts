import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import { bootstrapAdminUserIfNeeded, getAdminUserByEmail, verifyPassword } from "@/lib/admin-users";

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

function getAdminPassword() {
  return (process.env.ADMIN_PASSWORD || "").trim();
}

function getAuthSecret() {
  return (process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD || "").trim();
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
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
  secret: getAuthSecret(),
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

        const bootstrappedUser = await bootstrapAdminUserIfNeeded({ email, password });
        const adminUser = bootstrappedUser ?? (await getAdminUserByEmail(email));

        if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
          return null;
        }

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
  return token?.role === "admin";
}
