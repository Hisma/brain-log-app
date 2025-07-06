import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

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
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // If user is defined, this is the first sign in
      if (user) {
        // Store the ID as a string in the token
        token.id = user.id;
        token.timezone = user.timezone || "America/New_York";
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user && token.id) {
        // Convert the string ID from the token to a number for Prisma compatibility
        session.user.id = parseInt(String(token.id), 10);
        session.user.timezone = token.timezone || "America/New_York";
      }
      
      return session;
    },
    authorized({ auth, request }: { auth: Session | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith('/');
      const isOnLogin = request.nextUrl.pathname.startsWith('/login');
      const isOnRegister = request.nextUrl.pathname.startsWith('/register');
      const isOnApi = request.nextUrl.pathname.startsWith('/api');
      
      // Allow API routes and auth routes
      if (isOnApi || isOnLogin || isOnRegister) {
        return true;
      }
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', request.nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Add providers in auth.ts
};
