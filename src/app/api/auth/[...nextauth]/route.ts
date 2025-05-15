import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * This file sets up the NextAuth.js API routes
 * It handles all authentication-related requests
 * The [...nextauth] in the filename creates a catch-all route
 * that handles all auth endpoints like /api/auth/signin, /api/auth/session, etc.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
