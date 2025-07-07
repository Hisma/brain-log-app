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
        sameSite: "lax",
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
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user && token.id) {
        // Convert the string ID from the token to a number for Prisma compatibility
        session.user.id = parseInt(String(token.id), 10);
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive as boolean;
        session.user.timezone = token.timezone || "America/New_York";
        session.user.theme = token.theme;
      }
      
      return session;
    },
    authorized({ auth, request }: { auth: Session | null; request: { nextUrl: URL } }) {
      const user = auth?.user;
      const { pathname } = request.nextUrl;
      
      // Public routes (always allowed)
      if (pathname.startsWith('/api/auth') || 
          pathname.startsWith('/_next') || 
          pathname.startsWith('/favicon')) {
        return true;
      }
      
      // Authentication required routes
      const protectedRoutes = ['/', '/daily-log', '/insights', '/profile', '/weekly-reflection', '/weekly-insights'];
      const adminRoutes = ['/admin'];
      const publicRoutes = ['/login', '/register'];
      
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
      
      // Admin routes require ADMIN role and active status
      if (isAdminRoute) {
        return user?.role === 'ADMIN' && user?.isActive === true;
      }
      
      // Protected routes require USER or ADMIN role and active status
      if (isProtectedRoute) {
        if (user?.role === 'PENDING') {
          return Response.redirect(new URL('/pending', request.nextUrl));
        }
        return (user?.role === 'USER' || user?.role === 'ADMIN') && user?.isActive === true;
      }
      
      // Pending status page
      if (pathname === '/pending') {
        return user?.role === 'PENDING';
      }
      
      // Public routes - redirect authenticated users
      if (isPublicRoute && user?.isActive) {
        if (user.role === 'PENDING') {
          return Response.redirect(new URL('/pending', request.nextUrl));
        }
        return Response.redirect(new URL('/', request.nextUrl));
      }
      
      // Allow public routes for unauthenticated users
      if (isPublicRoute) {
        return true;
      }
      
      // Default: redirect to login
      return false;
    },
  },
  providers: [], // Add providers in auth.ts
};
