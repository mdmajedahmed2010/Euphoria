/**
 * Euphoria — NextAuth.js v5 Configuration
 * SOP §৪A — Authentication & Authorization
 *
 * Strategy: JWT in HttpOnly Secure Cookies
 * Password: Bcrypt (salt rounds: 12)
 * Roles: CUSTOMER, STAFF, MANAGER, ADMIN, SUPER_ADMIN
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { loginSchema } from "./validators/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "benarasikuthi-demo-secret-key-2026-mirpur-benaroshi-polli",
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("[AUTH] Zod validation failed:", parsed.error.issues);
          return null;
        }

        const { email, password } = parsed.data;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            passwordHash: true,
            role: true,
            image: true,
            emailVerified: true,
          },
        });

        if (!user) {
          console.error("[AUTH] User not found for email:", email.toLowerCase());
          return null;
        }

        if (!user.passwordHash) {
          console.error("[AUTH] User has no password (OAuth-only account):", email);
          return null;
        }

        // Verify password (bcrypt)
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          console.error("[AUTH] Password mismatch for:", email);
          return null;
        }

        console.log("[AUTH] Login successful for:", email);
        // Return user (without password hash)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Facebook({...}),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials" && user.email) {
        try {
          const emailLower = user.email.toLowerCase();
          const dbUser = await prisma.user.upsert({
            where: { email: emailLower },
            update: {
              name: user.name || undefined,
              image: user.image || undefined,
            },
            create: {
              name: user.name || "OAuth User",
              email: emailLower,
              image: user.image,
              role: "CUSTOMER",
              emailVerified: new Date(),
            },
          });
          if (dbUser.deletedAt) {
            console.warn(`[AUTH] Blocked sign-in attempt for soft-deleted user: ${emailLower}`);
            return false;
          }
          user.id = dbUser.id;
          (user as { role?: string }).role = dbUser.role;
        } catch (error) {
          console.error("[AUTH] Error syncing OAuth user to database:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role || "CUSTOMER";
        token.phone = (user as { phone: string | null }).phone || null;
      }
      const lookupEmail = token.email ? token.email.toLowerCase() : undefined;
      const lookupId = typeof token.id === "string" ? token.id : undefined;
      if (lookupId || lookupEmail) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(lookupId ? [{ id: lookupId }] : []),
              ...(lookupEmail ? [{ email: lookupEmail }] : []),
            ],
            deletedAt: null,
          },
          select: { id: true, role: true, phone: true },
        });
        if (!dbUser) {
          token.role = "CUSTOMER";
          return token;
        }
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.phone = dbUser.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string; phone: string | null }).role = token.role as string;
        (session.user as unknown as { role: string; phone: string | null }).phone = token.phone as string | null;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as { role?: string })?.role;
        const adminRoles = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];
        return adminRoles.includes(role || "");
      }

      return true;
    },
  },
});
