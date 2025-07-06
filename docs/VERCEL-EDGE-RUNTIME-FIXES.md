# Vercel Edge Runtime + NextAuth v5 + Neon Deployment Fixes

## Issues Resolved

This document outlines the specific fixes implemented to resolve Vercel Edge Runtime compatibility issues with NextAuth v5 and Neon PostgreSQL deployment.

## Key Changes Made

### 1. Implemented Edge-Compatible Password Hashing with Web Crypto API
**File:** `src/lib/crypto.ts`
- **Issue:** bcryptjs uses Node.js APIs not supported in Edge Runtime
- **Fix:** Implemented PBKDF2 password hashing using Web Crypto API
```typescript
// Before: Using bcryptjs which is not Edge compatible
// After: Using Web Crypto API with PBKDF2 for Edge compatibility
export async function hashPassword(password: string): Promise<string> {
  // Implementation using crypto.subtle.deriveBits with PBKDF2
  return `${HASH_FORMAT}:${ITERATIONS}:${saltBase64}:${hashBase64}`;
}
```

### 2. Updated User Registration to Use Edge-Compatible Password Hashing
**File:** `src/app/api/users/route.ts`
- **Issue:** Using bcryptjs directly for password hashing
- **Fix:** Switched to Web Crypto API implementation
```typescript
// Before: const passwordHash = await bcrypt.hash(password, 10);
// After: const passwordHash = await hashPassword(password);
```

### 3. Updated Authentication to Use Edge-Compatible Password Verification
**File:** `auth.ts`
- **Issue:** Using bcryptjs directly for password verification
- **Fix:** Switched to Web Crypto API implementation
```typescript
// Before: if (!(await compare(password, hash))) {
// After: if (!(await comparePasswords(password, hash))) {
```

### 4. Fixed Client-Side Import of Server-Side Database Code
**Files:** `src/lib/utils/refresh.ts`, `src/lib/auth/auth-client.ts`
- **Issue:** Client components were importing server-side database code
- **Fix:** Created proper client/server separation
```typescript
// Before: Client components imported auth.ts which imported neon.ts
// After: Created client-side auth utilities that don't import database code
import { getSession, signIn as nextAuthSignIn } from 'next-auth/react';
```

### 5. Added Environment Variable Validation in Neon Connection
**File:** `src/lib/neon.ts`
- **Issue:** Missing DATABASE_URL environment variable caused runtime errors
- **Fix:** Added proper validation and error handling
```typescript
// Before: export const sql = neon(process.env.DATABASE_URL!);
// After:
const DATABASE_URL = process.env.DATABASE_URL;
if (typeof DATABASE_URL !== 'string') {
  throw new Error('DATABASE_URL environment variable is not defined');
}
export const sql = neon(DATABASE_URL);
```

### 6. Configured Neon Database for Development and Production
**File:** `.env` and `.env.production.local`
- **Issue:** Local PostgreSQL connection string not compatible with Neon driver
- **Fix:** Used Neon connection string in both environments
```
# Before: DATABASE_URL="postgresql://ignition:ixp123@postgres-db:5432/brain_log_db"
# After: DATABASE_URL="postgres://neondb_owner:password@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require"
```

### 7. Updated NextAuth v5 TypeScript Import Issues
**File:** `auth.ts`
- **Issue:** TypeScript errors with NextAuth v5 beta import
- **Fix:** Added `@ts-expect-error` to handle NextAuth v5 beta type issues
```typescript
// Before: export const { auth, handlers, signIn, signOut } = NextAuth({
// After: // @ts-expect-error - NextAuth v5 beta has type issues
//        export const { auth, handlers, signIn, signOut } = NextAuth({
```

### 8. Updated Middleware for NextAuth v5 Edge Runtime
**File:** `src/middleware.ts`
- **Issue:** Using deprecated NextAuth v4 pattern
- **Fix:** Updated to NextAuth v5 Edge Runtime compatible pattern
```typescript
// Before: import NextAuth from "next-auth"; export default NextAuth(authConfig).auth
// After: import { auth } from "@auth"; export default auth
```

### 9. Hybrid Database Approach: Prisma + Neon
**Files:** `auth.ts`, `src/lib/prisma.ts`
- **Issue:** Prisma not compatible with Edge Runtime, but still preferred for API routes
- **Fix:** Created a hybrid approach:
  1. Use Neon serverless SQL for Edge Runtime code (auth.ts)
  2. Keep Prisma for all other database access, but connect to Neon cloud database

```typescript
// In auth.ts (Edge Runtime) - Direct Neon serverless SQL:
const users = await sql`SELECT id, username, "passwordHash", "displayName", timezone, theme FROM "User" WHERE username = ${username}`;

// In API routes (Node.js Runtime) - Still using Prisma:
import prisma from '@/lib/prisma';
const user = await prisma.user.findUnique({ where: { username } });
```

This hybrid approach gives us the best of both worlds:
- Edge Runtime compatibility where needed
- Prisma's type safety and convenience for most database operations
- No dependency on local PostgreSQL (everything uses Neon cloud database)

### 10. Enhanced Next.js Configuration for Edge Runtime
**File:** `next.config.mjs`
- **Issue:** Need to exclude bcryptjs from Edge Runtime bundling
- **Fix:** Simplified serverExternalPackages configuration
```javascript
// Configure external packages for server components
// This works with both Webpack and Turbopack automatically
serverExternalPackages: ['@prisma/client'],
```

## Client-Server Architecture Improvements

### Proper Separation of Client and Server Code
- **Issue:** Server-side database code was being imported in client components
- **Fix:** Created clear separation between client and server code

#### Server-Side Files (Not for Client Import)
- `src/lib/neon.ts` - Database connection (server-only)
- `auth.ts` - NextAuth configuration with database access (server-only)

#### Client-Side Files (Safe for Client Import)
- `src/lib/auth/auth-client.ts` - Client-side auth utilities
- `src/lib/utils/refresh.ts` - Session refresh utilities (client-side)

### Client-Side Authentication Pattern
```typescript
// Client components should use:
import { signIn, signOut } from 'next-auth/react';
// NOT import from auth.ts which contains server-side code
```

## Environment Setup

### Development Environment
- Using Neon PostgreSQL for development (same as production)
- Environment variables in `.env`:
```
DATABASE_URL="postgres://neondb_owner:password@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Production Environment
- Using Neon PostgreSQL for production
- Environment variables in Vercel:
```
DATABASE_URL="postgres://neondb_owner:password@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

## Lessons Learned

1. **Client-Server Separation is Critical**: Never import server-side code (especially database code) in client components.

2. **Environment Variables in Edge Runtime**: Environment variables must be properly validated and handled in Edge Runtime.

3. **Database Compatibility**: Use the same database technology in development and production to avoid surprises.

4. **NextAuth v5 Edge Compatibility**: NextAuth v5 requires careful separation of Edge-compatible config from Node.js dependencies.

5. **Web Crypto API for Edge**: Use Web Crypto API (PBKDF2) instead of bcrypt for password hashing in Edge Runtime.

## Testing and Verification

1. ✅ Local development with Neon database
2. ✅ Edge Runtime compatibility
3. ✅ Authentication flow working in both development and production
4. ✅ Password hashing and verification working with Web Crypto API
5. ✅ Client components no longer importing server-side database code

## Architecture Overview

### Edge Runtime Compatibility
- **Middleware:** Uses `auth.config.ts` (Edge Runtime compatible)
- **API Routes:** Uses `auth.ts` (Node.js runtime with database access)
- **Database:** Neon serverless driver (`@neondatabase/serverless`) for Edge compatibility
- **Authentication:** Web Crypto API for password operations

### File Structure
```
├── auth.config.ts          # Edge Runtime compatible config
├── auth.ts                 # Node.js runtime config with providers
├── src/lib/neon.ts         # Neon database connection (server-only)
├── src/lib/crypto.ts       # Edge-compatible password hashing
├── src/lib/auth/auth-client.ts # Client-side auth utilities
├── src/middleware.ts       # Edge Runtime middleware
└── src/types/next-auth.d.ts # TypeScript type extensions
```

## Environment Variables Required

Ensure these environment variables are set in both development and production:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Your app URL (different for dev/prod)

## Key Insights

1. **Client-Server Separation**: Never import server-side code in client components
2. **NextAuth v5 Pattern**: Separates Edge-compatible config from Node.js dependencies
3. **Neon Serverless**: Edge-compatible database access
4. **Web Crypto API**: Edge-compatible password hashing with PBKDF2
5. **Environment Consistency**: Use the same database technology in all environments

## References

- [NextAuth v5 Documentation](https://authjs.dev)
- [Neon Serverless Documentation](https://neon.tech/docs/serverless)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-runtime)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
