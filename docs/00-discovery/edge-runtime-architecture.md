---
title: Edge Runtime Architecture Analysis
description: Detailed analysis of Edge Runtime implementation in the Brain Log App and its architectural implications
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: draft
---

# Edge Runtime Architecture Analysis

## Overview
This document provides a comprehensive analysis of the Edge Runtime implementation in the Brain Log App, examining the hybrid architecture pattern that combines Edge Runtime for low-latency operations with Node.js Runtime for full-featured API functionality.

## Edge Runtime vs Node.js Runtime Breakdown

### Edge Runtime Components

#### Middleware (`src/middleware.ts`)
**Runtime**: Edge Runtime (default for Next.js middleware)
**Purpose**: Global authentication checks and request routing
**Key Features**:
- Runs at CDN edge locations globally
- Near-instantaneous cold starts
- Low latency for authentication decisions
- Uses Edge-compatible NextAuth configuration

```typescript
import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

// Edge-compatible NextAuth instance
export const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### Authentication Configuration (`auth.config.ts`)
**Runtime**: Edge Runtime compatible
**Purpose**: Edge-safe authentication configuration
**Constraints**:
- No Node.js dependencies allowed
- No database imports
- Web APIs only
- No Prisma or bcrypt imports

```typescript
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
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
  // ... callbacks and providers array (empty - defined in auth.ts)
};
```

#### Cryptographic Utilities (`src/lib/crypto.ts`)
**Runtime**: Edge Runtime compatible
**Purpose**: Password hashing and verification using Web Crypto API
**Implementation**: PBKDF2 with 100,000 iterations

```typescript
export async function hashPassword(password: string): Promise<string> {
  // Uses crypto.subtle.deriveBits with PBKDF2
  // Returns: PBKDF2:100000:base64salt:base64hash
}

export async function comparePasswords(password: string, hashString: string): Promise<boolean> {
  // Uses crypto.subtle.deriveBits for comparison
  // Edge Runtime compatible
}
```

#### Database Access for Edge (`src/lib/neon.ts`)
**Runtime**: Edge Runtime compatible
**Purpose**: Direct SQL database access for Edge components
**Features**:
- Serverless PostgreSQL driver
- No connection pooling overhead
- Lightweight queries only

```typescript
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (typeof DATABASE_URL !== 'string') {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const sql = neon(DATABASE_URL);
```

### Node.js Runtime Components

#### API Routes (`src/app/api/*/route.ts`)
**Runtime**: Node.js Runtime (default for API routes)
**Purpose**: Full-featured backend functionality
**Key Features**:
- Full Node.js API access
- Prisma ORM with connection pooling
- Complex business logic
- External service integrations

**API Endpoints**:
- `/api/auth/[...nextauth]` - NextAuth.js handlers
- `/api/auth/session-check` - Session validation
- `/api/daily-logs` - Daily log CRUD operations
- `/api/weekly-reflections` - Weekly reflection operations
- `/api/weekly-insights` - AI insights generation
- `/api/insights` - AI insights CRUD
- `/api/users` - User management
- `/api/users/[id]` - Individual user operations
- `/api/users/timezone` - Timezone management
- `/api/cleanup` - Data cleanup operations

#### Full Authentication Configuration (`auth.ts`)
**Runtime**: Node.js Runtime only
**Purpose**: Complete authentication setup with database access
**Features**:
- Database user lookup
- Password verification
- User object creation
- Provider configuration

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { sql } from "@/lib/neon";
import { comparePasswords } from "@/lib/crypto";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      // Database user lookup and password verification
      async authorize(credentials) {
        const users = await sql`
          SELECT id, username, "passwordHash", "displayName", timezone, theme 
          FROM "User" 
          WHERE username = ${username}
        `;
        // Password comparison and user object creation
      },
    }),
  ],
});
```

#### Database ORM (`src/lib/prisma.ts`)
**Runtime**: Node.js Runtime only
**Purpose**: Type-safe database operations with full ORM features
**Features**:
- Connection pooling
- Complex queries and transactions
- Relationship management
- Migration support

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())
```

#### Service Layer (`src/lib/services/`)
**Runtime**: Node.js Runtime only
**Purpose**: Business logic and complex database operations
**Components**:
- `api.ts` - Base API utilities
- `userService.ts` - User management
- `dailyLogService.ts` - Daily log operations
- `weeklyReflectionService.ts` - Weekly reflections
- `openaiService.ts` - AI integration

## Hybrid Architecture Pattern

### Database Access Strategy
The application uses a sophisticated dual-database access pattern:

#### Edge Runtime Database Access
- **Driver**: `@neondatabase/serverless`
- **Use Cases**: Authentication, simple queries
- **Benefits**: Zero connection overhead, Edge-compatible
- **Limitations**: Raw SQL only, no ORM features

#### Node.js Runtime Database Access
- **ORM**: Prisma with Accelerate extension
- **Use Cases**: Complex business logic, CRUD operations
- **Benefits**: Type safety, relationships, transactions
- **Features**: Connection pooling, migration management

### Authentication Flow Architecture

#### 1. Initial Request (Edge Runtime)
```
User Request → Edge Middleware → auth.config.ts → JWT Verification
```
- Runs at CDN edge globally
- Uses JWT-only authentication
- No database queries
- Redirects based on authentication state

#### 2. API Authentication (Node.js Runtime)
```
API Request → auth.ts → Database User Lookup → Session Creation
```
- Full database access via Neon SQL
- Password verification with Web Crypto API
- User object creation and session management

#### 3. Protected Routes (Hybrid)
```
Page Request → Edge Middleware Check → Server Component → Prisma Queries
```
- Edge checks authentication status
- Server components perform data fetching
- API routes handle mutations

### Client-Server-Edge Separation

#### Client-Side Code
**Files**: `src/lib/auth/auth-client.ts`, `src/lib/utils/refresh.ts`
**Runtime**: Browser
**Purpose**: Client-side authentication utilities
**Restrictions**: Cannot import server-side database code

```typescript
// Client-safe authentication utilities
import { signIn, signOut, getSession } from 'next-auth/react';
```

#### Server-Side Code (Node.js Runtime)
**Files**: `src/lib/prisma.ts`, API routes, service layers
**Runtime**: Node.js Runtime
**Purpose**: Full-featured backend operations
**Features**: Database access, external APIs, complex logic

#### Edge-Compatible Code
**Files**: `src/lib/crypto.ts`, `src/lib/neon.ts`, `auth.config.ts`
**Runtime**: Edge Runtime compatible
**Purpose**: Lightweight operations at CDN edge
**Restrictions**: Web APIs only, no Node.js dependencies

## Performance Implications

### Latency Benefits
- **Edge Middleware**: ~10-50ms authentication checks globally
- **CDN Distribution**: Code runs close to users worldwide
- **Cold Start Performance**: Edge functions start instantly
- **Reduced Origin Load**: Authentication decisions at edge reduce origin server requests

### Scalability Advantages
- **Automatic Scaling**: Edge functions scale to zero and up automatically
- **Global Distribution**: Authentication logic runs in multiple regions
- **Resource Efficiency**: Lightweight Edge functions reduce infrastructure costs
- **Connection Pooling**: Node.js API routes maintain efficient database connections

### Trade-offs
- **Code Complexity**: Requires maintaining Edge-compatible and Node.js versions
- **Debugging Complexity**: Different runtimes require different debugging approaches
- **Dependency Management**: Must ensure Edge compatibility for shared code
- **Development Overhead**: Need to understand both runtime environments

## Security Architecture

### Edge Runtime Security
- **JWT Verification**: Stateless authentication at edge
- **Request Filtering**: Malicious requests blocked at edge
- **CSRF Protection**: Built into NextAuth.js configuration
- **Environment Isolation**: Edge runtime has limited API surface

### Node.js Runtime Security
- **Database Security**: Parameterized queries prevent SQL injection
- **Password Security**: PBKDF2 with 100,000 iterations
- **Session Management**: Secure cookie configuration
- **API Protection**: All routes require authentication

### Cross-Runtime Security
- **Shared Secrets**: Environment variables across both runtimes
- **Consistent Policies**: Same security policies enforced everywhere
- **Token Validation**: JWT tokens validated consistently

## Development Considerations

### Edge Runtime Limitations
- **No Node.js APIs**: Cannot use `fs`, `path`, `crypto` (Node.js version), etc.
- **No npm Packages**: Many npm packages use Node.js APIs
- **Bundle Size**: Edge functions have size limitations
- **Debugging**: Limited debugging tools compared to Node.js

### Best Practices
1. **Separation of Concerns**: Keep Edge code minimal and focused
2. **Shared Utilities**: Create Edge-compatible versions of common utilities
3. **Environment Testing**: Test in both runtimes during development
4. **Error Handling**: Implement proper error boundaries for both runtimes
5. **Monitoring**: Monitor performance and errors in both environments

### Development Workflow
1. **Local Development**: Uses Next.js dev server (simulates both runtimes)
2. **Edge Testing**: Middleware runs in simulated Edge environment
3. **API Testing**: API routes run in Node.js environment
4. **Production Deployment**: Vercel automatically routes to appropriate runtime

## Deployment Architecture

### Vercel Edge Network
- **Middleware Deployment**: Automatically deployed to Edge Runtime
- **API Route Deployment**: Deployed to Node.js Runtime
- **Global Distribution**: Edge functions distributed worldwide
- **Automatic Routing**: Vercel handles runtime routing automatically

### Environment Configuration
```
# Shared across both runtimes
DATABASE_URL=postgres://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...
OPENAI_API_KEY=...
```

### Build Process
- **Edge Bundle**: Middleware and Edge-compatible code bundled separately
- **Node.js Bundle**: API routes and server components bundled for Node.js
- **Automatic Detection**: Next.js detects runtime requirements automatically
- **Optimization**: Each runtime optimized for its specific use case

## Configuration Analysis

### Next.js Configuration (`next.config.mjs`)
```javascript
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client'], // Node.js runtime only
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL, 'brain-log-app.vercel.app'] 
        : ['localhost:3000', '172.18.0.2:3000', '0.0.0.0:3000', '192.168.0.227:3003'],
    },
  },
};
```

### Runtime Detection
- **No explicit runtime declarations**: API routes default to Node.js Runtime
- **Middleware defaults**: Automatically uses Edge Runtime
- **Automatic optimization**: Next.js optimizes bundles for each runtime

## Migration History

### Pre-Edge Runtime Architecture
- **bcrypt**: Used Node.js-only bcrypt for password hashing
- **Single Runtime**: Everything ran in Node.js Runtime
- **Monolithic Auth**: Single authentication configuration

### Edge Runtime Migration Changes
1. **Password Hashing**: Migrated from bcrypt to Web Crypto API (PBKDF2)
2. **Authentication Split**: Separated Edge and Node.js auth configurations
3. **Database Access**: Added Neon serverless driver for Edge compatibility
4. **Client Separation**: Removed server-side imports from client components
5. **Environment Validation**: Added proper validation for Edge Runtime

### Benefits Realized
- **Reduced Latency**: Authentication checks now happen at edge
- **Better Scalability**: Automatic scaling of authentication logic
- **Global Performance**: Users worldwide get fast authentication
- **Resource Optimization**: Reduced load on origin servers

## Monitoring and Observability

### Edge Runtime Monitoring
- **Vercel Analytics**: Built-in Edge function monitoring
- **Performance Metrics**: Cold start times, execution duration
- **Error Tracking**: Edge function errors and stack traces
- **Geographic Distribution**: Performance by region

### Node.js Runtime Monitoring
- **API Performance**: Response times for API routes
- **Database Connections**: Connection pool utilization
- **Error Rates**: API error rates and patterns
- **Resource Usage**: Memory and CPU utilization

### Cross-Runtime Metrics
- **Authentication Flow**: End-to-end authentication performance
- **User Experience**: Total page load times including both runtimes
- **Error Correlation**: Tracking errors across runtime boundaries

## Future Considerations

### Potential Optimizations
1. **Additional Edge APIs**: Move more lightweight operations to Edge Runtime
2. **Caching Strategy**: Implement Edge-side caching for frequently accessed data
3. **Regional Databases**: Consider regional database replicas for Edge queries
4. **Bundle Optimization**: Further optimize Edge bundle sizes

### Scalability Planning
- **Traffic Growth**: Edge Runtime scales automatically with traffic
- **Database Scaling**: Plan for Node.js runtime database scaling
- **Regional Expansion**: Consider additional edge regions
- **Performance Monitoring**: Continuous monitoring of both runtimes

### Technology Evolution
- **Next.js Updates**: Monitor Edge Runtime feature updates
- **Vercel Platform**: Take advantage of new Edge Runtime capabilities
- **Database Evolution**: Consider Edge-compatible database solutions
- **Security Enhancements**: Implement additional Edge-side security measures

## Related Documents
- `codebase-analysis.md` - Overall codebase structure
- `technology-stack.md` - Complete technology analysis
- `VERCEL-EDGE-RUNTIME-FIXES.md` - Implementation details and fixes
- `VERCEL-DEPLOYMENT-FIXES.md` - Deployment configuration
- `ARCHITECTURE.md` - System architecture overview

## Changelog
- 2025-07-06: Initial Edge Runtime architecture analysis completed
