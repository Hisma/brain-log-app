### Phase 1: Database Schema & Core RBAC (Week 1)

#### 1.1 Database Schema Enhancement

**Update Prisma Schema** (`prisma/schema.prisma`):

```prisma
// Enhanced User model with RBAC
model User {
  id                Int               @id @default(autoincrement())
  username          String            @unique
  passwordHash      String
  displayName       String
  
  // RBAC Fields
  role              UserRole          @default(PENDING)
  isActive          Boolean           @default(false)
  registrationToken String?           @unique
  approvedBy        Int?
  approvedAt        DateTime?
  rejectedAt        DateTime?
  rejectionReason   String?
  
  // Enhanced tracking
  createdAt         DateTime          @default(now())
  lastLogin         DateTime?
  lastLoginAt       DateTime?
  failedLoginAttempts Int             @default(0)
  lockedUntil       DateTime?
  
  // Existing fields
  timezone          String            @default("America/New_York")
  theme             String            @default("system")
  
  // Relations
  dailyLogs         DailyLog[]
  weeklyReflections WeeklyReflection[]
  insights          Insight[]
  weeklyInsights    WeeklyInsight[]
  auditLogs         AuditLog[]
  
  // Admin approval relations
  approver          User?             @relation("UserApproval", fields: [approvedBy], references: [id])
  approvedUsers     User[]            @relation("UserApproval")
  
  @@index([role])
  @@index([isActive])
  @@index([registrationToken])
}

enum UserRole {
  PENDING
  USER
  ADMIN
}

// System configuration
model SystemSettings {
  id                       String  @id @default("system")
  registrationEnabled      Boolean @default(true)
  requireEmailVerification Boolean @default(true)
  adminEmail              String  @default("admin@brainlogapp.com")
  siteName                String  @default("Brain Log App")
  maxFailedLoginAttempts  Int     @default(5)
  lockoutDurationMinutes  Int     @default(15)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

// Comprehensive audit logging
model AuditLog {
  id        String   @id @default(cuid())
  userId    Int
  action    String   // "USER_REGISTERED", "USER_APPROVED", "USER_REJECTED", "ROLE_CHANGED", "LOGIN_FAILED", "ACCOUNT_LOCKED"
  resource  String   // "USER", "SYSTEM", "AUTH", "ADMIN"
  details   Json?    // Additional context and metadata
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([timestamp])
}

// Email notification queue
model EmailQueue {
  id          String   @id @default(cuid())
  to          String
  subject     String
  template    String   // Template identifier
  variables   Json     // Template variables
  status      String   @default("pending") // "pending", "sent", "failed"
  attempts    Int      @default(0)
  maxAttempts Int      @default(3)
  error       String?
  sentAt      DateTime?
  createdAt   DateTime @default(now())
  
  @@index([status])
  @@index([createdAt])
}
```

**Migration Script** (`prisma/migrations/xxx_add_rbac_system/migration.sql`):

```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PENDING', 'USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registrationToken" TEXT,
ADD COLUMN     "approvedBy" INTEGER,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'system',
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "adminEmail" TEXT NOT NULL DEFAULT 'admin@brainlogapp.com',
    "siteName" TEXT NOT NULL DEFAULT 'Brain Log App',
    "maxFailedLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailQueue" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationToken_key" ON "User"("registrationToken");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_registrationToken_idx" ON "User"("registrationToken");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "EmailQueue_status_idx" ON "EmailQueue"("status");

-- CreateIndex
CREATE INDEX "EmailQueue_createdAt_idx" ON "EmailQueue"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update existing users to be active with USER role
UPDATE "User" SET "role" = 'USER', "isActive" = true WHERE "id" IS NOT NULL;

-- Create initial system settings
INSERT INTO "SystemSettings" ("id") VALUES ('system') ON CONFLICT DO NOTHING;
```

#### 1.2 Enhanced Auth.js Configuration

**Update Auth Configuration** (`auth.config.ts`):

```typescript
import { NextAuthConfig } from "next-auth";
import { UserRole } from "@prisma/client";

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
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
        token.timezone = user.timezone || "America/New_York";
      }
      
      // Handle session updates (role changes, etc.)
      if (trigger === "update" && session) {
        token.role = session.role;
        token.isActive = session.isActive;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user && token.id) {
        session.user.id = parseInt(String(token.id), 10);
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive as boolean;
        session.user.timezone = token.timezone || "America/New_York";
      }
      return session;
    },
    authorized({ auth, request }) {
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
  providers: [], // Providers defined in auth.ts
} satisfies NextAuthConfig;
```

**Update Main Auth** (`auth.ts`):

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { sql } from "@/lib/neon";
import { comparePasswords } from "@/lib/crypto";
import { UserRole } from "@prisma/client";
import { auditLog } from "@/lib/audit";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        const username = credentials.username as string;
        const password = credentials.password as string;
        
        try {
          // Get user with role and active status
          const users = await sql`
            SELECT id, username, "passwordHash", "displayName", timezone, theme, role, "isActive", "failedLoginAttempts", "lockedUntil"
            FROM "User" 
            WHERE username = ${username}
          `;
          
          if (users.length === 0) {
            await auditLog({
              action: "LOGIN_FAILED",
              resource: "AUTH",
              details: { username, reason: "user_not_found" },
              ipAddress: request?.headers?.get("x-forwarded-for") || "unknown",
              userAgent: request?.headers?.get("user-agent") || "unknown",
            });
            return null;
          }
          
          const user = users[0];
          
          // Check if account is locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            await auditLog({
              userId: user.id,
              action: "LOGIN_FAILED",
              resource: "AUTH",
              details: { username, reason: "account_locked" },
              ipAddress: request?.headers?.get("x-forwarded-for") || "unknown",
              userAgent: request?.headers?.get("user-agent") || "unknown",
            });
            return null;
          }
          
          // Verify password
          const hash = user.passwordHash as string;
          const isValidPassword = await comparePasswords(password, hash);
          
          if (!isValidPassword) {
            // Increment failed login attempts
            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            const maxAttempts = 5; // Could be from SystemSettings
            
            let lockUntil = null;
            if (failedAttempts >= maxAttempts) {
              lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            }
            
            await sql`
              UPDATE "User" 
              SET "failedLoginAttempts" = ${failedAttempts}, "lockedUntil" = ${lockUntil}
              WHERE id = ${user.id}
            `;
            
            await auditLog({
              userId: user.id,
              action: failedAttempts >= maxAttempts ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
              resource: "AUTH",
              details: { username, reason: "invalid_password", failedAttempts },
              ipAddress: request?.headers?.get("x-forwarded-for") || "unknown",
              userAgent: request?.headers?.get("user-agent") || "unknown",
            });
            
            return null;
          }
          
          // Reset failed login attempts and update last login
          await sql`
            UPDATE "User" 
            SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "lastLoginAt" = NOW()
            WHERE id = ${user.id}
          `;
          
          await auditLog({
            userId: user.id,
            action: "LOGIN_SUCCESS",
            resource: "AUTH",
            details: { username },
            ipAddress: request?.headers?.get("x-forwarded-for") || "unknown",
            userAgent: request?.headers?.get("user-agent") || "unknown",
          });
          
          // Return user object for session
          return {
            id: String(user.id),
            name: user.displayName || "",
            email: user.username,
            timezone: user.timezone || "America/New_York",
            theme: user.theme || "",
            role: user.role as UserRole,
            isActive: user.isActive as boolean,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  events: {
    async signOut({ token, session }) {
      if (token?.id) {
        await auditLog({
          userId: parseInt(String(token.id)),
          action: "LOGOUT",
          resource: "AUTH",
          details: {},
        });
      }
    },
  },
});

// Helper functions for authentication
export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN' || !session.user.isActive) {
    throw new Error('Admin access required');
  }
  return session.user;
};

export const requireUser = async () => {
  const session = await auth();
  if (!session?.user || !session.user.isActive) {
    throw new Error('Authentication required');
  }
  if (session.user.role === 'PENDING') {
    throw new Error('Account pending approval');
  }
  return session.user;
};
```

#### 1.3 Enhanced Middleware

**Update Middleware** (`src/middleware.ts`):

```typescript
import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest & { auth: any }) => {
  const { user } = req.auth || {};
  const { pathname } = req.nextUrl;
  
  // Rate limiting for auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    // TODO: Implement rate limiting
    // Could use Vercel KV or in-memory cache
  }
  
  // Security headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### 1.4 TypeScript Definitions

**Update TypeScript Definitions** (`src/types/next-auth.d.ts`):

```typescript
import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    timezone?: string;
    theme?: string;
    role: UserRole;
    isActive: boolean;
  }
  
  interface Session {
    user: User & {
      id: number; // Converted from string for Prisma compatibility
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    timezone?: string;
    role?: UserRole;
    isActive?: boolean;
  }
}
```

#### 1.5 Utility Functions

**Create Audit Logging Utility** (`src/lib/audit.ts`):

```typescript
import { sql } from "@/lib/neon";

interface AuditLogParams {
  userId?: number;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function auditLog(params: AuditLogParams) {
  try {
    await sql`
      INSERT INTO "AuditLog" (id, "userId", action, resource, details, "ipAddress", "userAgent", timestamp)
      VALUES (
        ${crypto.randomUUID()},
        ${params.userId || 0},
        ${params.action},
        ${params.resource},
        ${JSON.stringify(params.details || {})},
        ${params.ipAddress || null},
        ${params.userAgent || null},
        NOW()
      )
    `;
  } catch (error) {
    console.error("Audit logging failed:", error);
    // Don't throw - audit failures shouldn't break app functionality
  }
}

export async function getAuditLogs(options: {
  userId?: number;
  action?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, action, resource, limit = 50, offset = 0 } = options;
  
  let whereClause = "WHERE 1=1";
  const params: any[] = [];
  
  if (userId) {
    whereClause += ` AND "userId" = $${params.length + 1}`;
    params.push(userId);
  }
  
  if (action) {
    whereClause += ` AND action = $${params.length + 1}`;
    params.push(action);
  }
  
  if (resource) {
    whereClause += ` AND resource = $${params.length + 1}`;
    params.push(resource);
  }
  
  const query = `
    SELECT a.*, u.username, u."displayName"
    FROM "AuditLog" a
    LEFT JOIN "User" u ON a."userId" = u.id
    ${whereClause}
    ORDER BY a.timestamp DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  params.push(limit, offset);
  
  return await sql.unsafe(query, params);
}
```

**Create Role Utilities** (`src/lib/roles.ts`):

```typescript
import { UserRole } from "@prisma/client";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  PENDING: 0,
  USER: 1,
  ADMIN: 2,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    PENDING: [],
    USER: [
      'daily-logs:read',
      'daily-logs:create',
      'daily-logs:update',
      'weekly-reflections:read',
      'weekly-reflections:create',
      'weekly-reflections:update',
      'insights:read',
      'profile:read',
      'profile:update',
    ],
    ADMIN: [
      // All user permissions plus admin permissions
      'daily-logs:read',
      'daily-logs:create',
      'daily-logs:update',
      'daily-logs:delete',
      'weekly-reflections:read',
      'weekly-reflections:create',
      'weekly-reflections:update',
      'weekly-reflections:delete',
      'insights:read',
      'insights:delete',
      'profile:read',
      'profile:update',
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'users:approve',
      'users:reject',
      'system:read',
      'system:update',
      'audit:read',
    ],
  };
  
  return permissions[userRole]?.includes(permission) || false;
}

export function canAccessRoute(userRole: UserRole, isActive: boolean, route: string): boolean {
  if (!isActive && userRole !== 'PENDING') {
    return false;
  }
  
  if (route.startsWith('/admin')) {
    return userRole === 'ADMIN' && isActive;
  }
  
  if (route.startsWith('/pending')) {
    return userRole === 'PENDING';
  }
  
  if (route === '/login' || route === '/register') {
    return !isActive || userRole === 'PENDING';
  }
  
  // Protected routes (dashboard, daily-log, etc.)
  const protectedRoutes = ['/', '/daily-log', '/insights', '/profile', '/weekly-reflection', '/weekly-insights'];
  if (protectedRoutes.some(r => route.startsWith(r))) {
    return (userRole === 'USER' || userRole === 'ADMIN') && isActive;
  }
  
  return true; // Allow other routes
}
```

### Phase 1 Implementation Status

#### ✅ **COMPLETED TASKS**

**1. Database Schema & Migration**
- [x] Updated Prisma schema with RBAC models and fields
- [x] Successfully ran migration: `npx prisma migrate dev --name add_rbac_system`
- [x] Database includes: User roles, AuditLog, SystemSettings, EmailQueue tables
- [x] All indexes and relationships properly configured

**2. Core RBAC System** 
- [x] **Created `src/lib/rbac.ts`** - Comprehensive RBAC utilities with Edge Runtime compatibility
  - Role hierarchy: SUPER_ADMIN → ADMIN → USER
  - 11 granular permissions (USER_READ, ROLE_ASSIGN, DATA_READ_ALL, etc.)
  - Functions: `hasPermission()`, `requirePermission()`, `assignRole()`, `revokeRole()`
  - Data access helpers: `canAccessUserData()`, `canModifyUserData()`
  - Lightweight middleware functions: `getUserRole()`, `userExists()`

**3. Audit System**
- [x] **Created `src/lib/audit.ts`** - Production-ready audit logging with Edge Runtime compatibility
  - Functions: `auditLog()`, `getAuditLogs()`, `getAuditLogStats()`, `getRecentAuditActivity()`
  - Advanced filtering by user, action, resource, time ranges
  - Maintenance function: `cleanupOldAuditLogs()` with configurable retention
  - Full user context joins for complete audit trails

**4. Architecture Decisions**
- [x] **Edge Runtime Compatibility**: Used direct SQL queries via Neon instead of Prisma ORM
- [x] **Type Safety**: All functions properly typed, no `any` types
- [x] **Error Handling**: Graceful degradation, audit failures don't break app functionality
- [x] **Security**: Deny-by-default model, comprehensive permission checking

#### 🔄 **REMAINING TASKS**

**Auth.js Integration** - *Next Priority*
- [ ] Update Auth.js configuration with role-based callbacks
- [ ] Enhance authentication with RBAC permission checks
- [ ] Update middleware with RBAC route protection
- [ ] Update TypeScript definitions for new user properties

**Testing & Verification**
- [ ] Test authentication with new role system
- [ ] Verify JWT tokens include role information  
- [ ] Test route protection for different user roles
- [ ] Verify audit logging in authentication flows

### Phase 1 Implementation Checklist

**Database & Core Systems** ✅ **COMPLETE**
- [x] Update Prisma schema with new models and fields
- [x] Run database migration: `npx prisma migrate dev --name add_rbac_system`
- [x] Create comprehensive RBAC utility functions (`src/lib/rbac.ts`)
- [x] Create production-ready audit logging system (`src/lib/audit.ts`)
- [x] Ensure Edge Runtime compatibility for Vercel deployment

**Authentication Integration** 🔄 **IN PROGRESS**
- [ ] Update Auth.js configuration with role-based callbacks
- [ ] Enhance middleware with security headers and RBAC protection
- [ ] Update TypeScript definitions for new user properties
- [ ] Test authentication with new role system
- [ ] Verify JWT tokens include role information
- [ ] Test route protection for different user roles

---
