import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Define UserRole to match Prisma schema for Edge Runtime compatibility
type UserRole = "PENDING" | "USER" | "ADMIN";

/**
 * Auth.js configuration that can be used in Edge Runtime
 * This file should NOT import any Node.js dependencies like bcrypt or Prisma
 */
export const authConfig = {
  // Trust the NEXTAUTH_URL and any URLs in the VERCEL_URL env var
  trustHost: true,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  // Improve cookie handling for Edge Runtime
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: string; session?: any }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.isActive = user.isActive;
        token.timezone = user.timezone || "America/New_York";
        token.theme = user.theme;
      }
      
      // Handle session updates (role changes, etc.)
      if (trigger === "update" && session) {
        token.role = session.role;
        token.isActive = session.isActive;
        token.theme = session.theme;
        token.username = session.username;
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user && token.id) {
        // Convert the string ID from the token to a number for Prisma compatibility
        session.user.id = parseInt(String(token.id), 10);
        session.user.username = token.username as string;
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive as boolean;
        session.user.timezone = token.timezone || "America/New_York";
        session.user.theme = token.theme;
      }
      
      return session;
    },
  },
  providers: [], // Add providers in auth.ts
};
