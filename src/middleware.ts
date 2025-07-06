import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

// Create a separate Auth.js instance for middleware without database access
// This follows the recommended approach from the Auth.js Edge Compatibility guide
// @ts-expect-error - NextAuth v5 beta has type issues
export const { auth } = NextAuth(authConfig);
 
export default auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
