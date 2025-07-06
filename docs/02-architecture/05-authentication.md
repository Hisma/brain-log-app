---
title: Authentication Architecture
description: Comprehensive authentication system design and security implementation in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Authentication Architecture

## Overview
The Brain Log App implements a sophisticated three-layer authentication system that leverages Edge Runtime for global performance and Node.js Runtime for comprehensive user management. Built on NextAuth.js v5, this architecture provides secure, scalable authentication with optimal performance characteristics.

## Three-Layer Authentication System

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                    Layer 1: Edge Middleware                     │
│  ├── Global CDN Authentication Checks (10-50ms worldwide)      │
│  ├── JWT Token Verification                                    │
│  ├── Route Protection & Redirects                              │
│  └── Edge Runtime Compatible (auth.config.ts)                  │
├─────────────────────────────────────────────────────────────────┤
│                 Layer 2: API Authentication                     │
│  ├── Database User Lookup & Validation                         │
│  ├── Password Verification (PBKDF2)                            │
│  ├── Session Creation & Management                             │
│  └── Node.js Runtime with Full Features (auth.ts)              │
├─────────────────────────────────────────────────────────────────┤
│               Layer 3: Client Authentication                    │
│  ├── React Context for Session Management                      │
│  ├── Client-Side Session Access                                │
│  ├── Safe Browser Authentication Utilities                     │
│  └── UI State Management                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Layer 1: Edge Middleware Authentication

### Edge Runtime Configuration
**File**: `auth.config.ts`
**Runtime**: Edge Runtime (CDN Global)
**Purpose**: Lightweight, fast authentication checks

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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.timezone = user.timezone || "America/New_York";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user && token.id) {
        session.user.id = parseInt(String(token.id), 10);
        session.user.timezone = token.timezone || "America/New_York";
      }
      return session;
    },
    authorized({ auth, request }) {
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
        return false; // Redirect unauthenticated users
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', request.nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Providers defined in auth.ts
};
```

### Middleware Implementation
**File**: `src/middleware.ts`
**Runtime**: Edge Runtime (Automatic)

```typescript
import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

export const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**Key Features**:
- **Global Performance**: Runs at CDN edge locations worldwide
- **JWT-Only Authentication**: No database queries for performance
- **Route Protection**: Automatic redirects based on authentication status
- **Edge Runtime Compatible**: Uses only Web APIs and Edge-compatible code

## Layer 2: API Authentication

### Node.js Runtime Configuration
**File**: `auth.ts`
**Runtime**: Node.js Runtime
**Purpose**: Full-featured authentication with database access

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
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        // Database user lookup
        const username = credentials.username as string;
        const users = await sql`
          SELECT id, username, "passwordHash", "displayName", timezone, theme 
          FROM "User" 
          WHERE username = ${username}
        `;
        
        if (users.length === 0) {
          return null;
        }
        
        const user = users[0];
        const password = credentials.password as string;
        const hash = user.passwordHash as string;
        
        // Password verification using PBKDF2
        if (!(await comparePasswords(password, hash))) {
          return null;
        }
        
        // Return user object for session creation
        return {
          id: String(user.id),
          name: user.displayName || "",
          email: user.username,
          timezone: user.timezone || "America/New_York",
          theme: user.theme || "",
        };
      },
    }),
  ],
});
```

### Authentication Helpers
```typescript
// Helper function to check authentication status
export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};
```

## Layer 3: Client Authentication

### React Authentication Context
**File**: `src/lib/auth/AuthContext.tsx`
**Runtime**: Browser/Client
**Purpose**: Client-side session management and UI state

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isLoading: status === 'loading',
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Client Authentication Utilities
**File**: `src/lib/auth/auth-client.ts`
**Runtime**: Browser/Client
**Purpose**: Safe client-side authentication operations

```typescript
'use client';

// Re-export only client-safe functions from next-auth/react
export { 
  signIn, 
  signOut, 
  getSession, 
  useSession,
  SessionProvider 
} from 'next-auth/react';

// Client-side authentication status check
export const useAuthStatus = () => {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    user: session?.user || null,
  };
};
```

## Password Security Implementation

### PBKDF2 Cryptographic Implementation
**File**: `src/lib/crypto.ts`
**Runtime**: Edge Runtime Compatible
**Purpose**: Secure password hashing using Web Crypto API

```typescript
// Generate cryptographically secure salt
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

// Hash password using PBKDF2 with 100,000 iterations
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const hashArray = new Uint8Array(hashBuffer);
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `PBKDF2:100000:${saltBase64}:${hashBase64}`;
}

// Compare password with stored hash
export async function comparePasswords(password: string, hashString: string): Promise<boolean> {
  const parts = hashString.split(':');
  if (parts.length !== 4 || parts[0] !== 'PBKDF2') {
    return false;
  }
  
  const iterations = parseInt(parts[1], 10);
  const salt = new Uint8Array(atob(parts[2]).split('').map(c => c.charCodeAt(0)));
  const storedHash = new Uint8Array(atob(parts[3]).split('').map(c => c.charCodeAt(0)));
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const newHash = new Uint8Array(hashBuffer);
  
  // Constant-time comparison
  if (newHash.length !== storedHash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < newHash.length; i++) {
    result |= newHash[i] ^ storedHash[i];
  }
  
  return result === 0;
}
```

**Security Features**:
- **PBKDF2 Algorithm**: Industry-standard key derivation function
- **100,000 Iterations**: Protection against brute-force attacks
- **Cryptographic Salt**: Unique salt per password prevents rainbow table attacks
- **Constant-Time Comparison**: Prevents timing-based attacks
- **Edge Runtime Compatible**: Uses Web Crypto API instead of Node.js crypto

## Session Management

### JWT Token Strategy
```typescript
session: { strategy: "jwt" as const }
```

**Benefits**:
- **Stateless Authentication**: No server-side session storage required
- **Edge Runtime Compatible**: JWT verification possible at CDN edge
- **Scalable**: No database queries for session validation
- **Global Performance**: Fast authentication checks worldwide

### Session Token Configuration
```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,        // Prevents XSS attacks
      sameSite: "lax",       // CSRF protection
      path: "/",             // Available site-wide
      secure: process.env.NODE_ENV === "production", // HTTPS in production
    },
  },
}
```

### Session Data Structure
```typescript
interface Session {
  user: {
    id: number;           // User database ID
    name: string;         // Display name
    email: string;        // Username (used as email)
    timezone: string;     // User timezone preference
    theme?: string;       // UI theme preference
  };
  expires: string;        // Session expiration timestamp
}
```

## Authentication Flow

### User Registration Flow
```
1. User Registration (Client)
   ├── Form Submission (/register)
   ├── Password Hashing (PBKDF2)
   ├── Database User Creation
   └── Automatic Sign-In

2. Account Creation (API)
   ├── Input Validation
   ├── Username Uniqueness Check
   ├── Password Hashing (100,000 iterations)
   ├── Database Insert
   └── User Object Creation
```

### User Login Flow
```
1. Edge Middleware Check
   ├── Existing Session? ──YES──► Allow Request
   └── No Session ──NO──► Continue to Login

2. Login Submission (API)
   ├── Credentials Validation
   ├── Database User Lookup (Neon SQL)
   ├── Password Verification (PBKDF2)
   ├── JWT Token Creation
   └── Session Cookie Set

3. Subsequent Requests
   ├── Edge Middleware: JWT Verification (Global CDN)
   ├── Fast Authentication Check (10-50ms)
   └── Route Access Granted
```

### Protected Route Access
```
User Request → Edge Middleware → JWT Check → Route Access
     │                                │
     ├── Valid JWT ──────────────────► Continue to Route
     └── Invalid/Missing JWT ─────────► Redirect to Login
```

## API Route Protection

### Authentication Middleware Pattern
```typescript
// Pattern used in API routes
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Proceed with authenticated logic
  const userId = session.user.id;
  // ... business logic
}
```

### Session Validation Endpoint
**Endpoint**: `/api/auth/session-check`
**Purpose**: Client-side session validation

```typescript
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        timezone: session.user.timezone,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
```

## Security Implementation

### Cross-Site Request Forgery (CSRF) Protection
- **SameSite Cookies**: `sameSite: "lax"` prevents CSRF attacks
- **NextAuth.js Built-in**: Automatic CSRF token validation
- **Origin Validation**: Request origin verification

### Cross-Site Scripting (XSS) Protection
- **HttpOnly Cookies**: Session tokens inaccessible to JavaScript
- **Content Security Policy**: Implemented via Next.js configuration
- **Input Sanitization**: All user inputs validated and sanitized

### Session Security
- **Secure Cookies**: HTTPS-only cookies in production
- **Session Expiration**: Automatic token expiration
- **Token Rotation**: NextAuth.js handles token refresh
- **Logout Cleanup**: Complete session cleanup on logout

### Password Security
- **PBKDF2 Hashing**: 100,000 iterations with unique salt
- **Minimum Complexity**: Client-side and server-side validation
- **Constant-Time Comparison**: Prevents timing attacks
- **No Password Storage**: Only hashed values stored

## Performance Characteristics

### Global Authentication Performance
- **Edge Middleware**: 10-50ms authentication checks globally
- **CDN Distribution**: Authentication logic runs close to users
- **Zero Database Queries**: JWT verification without database access
- **Instant Cold Starts**: Edge functions start immediately

### Database Optimization
- **Minimal Queries**: Only authentication requires database access
- **Connection Efficiency**: Neon serverless driver for authentication
- **Index Optimization**: Username uniqueness index for fast lookups
- **Query Caching**: Prisma Accelerate for repeated queries

## Type Safety and Integration

### TypeScript Integration
**File**: `src/types/next-auth.d.ts`

```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    timezone?: string;
    theme?: string;
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
  }
}
```

### Runtime Separation
- **Edge Compatible**: `auth.config.ts`, `crypto.ts`, `neon.ts`
- **Node.js Only**: `auth.ts`, Prisma operations
- **Client Safe**: `auth-client.ts`, React components
- **Universal**: Type definitions, utility functions

## Monitoring and Debugging

### Authentication Monitoring
- **Session Creation**: Track login success/failure rates
- **JWT Verification**: Monitor edge authentication performance
- **Password Attempts**: Track failed authentication attempts
- **Session Duration**: Monitor user session lengths

### Error Handling
- **Authentication Failures**: Graceful error handling and user feedback
- **Session Expiration**: Automatic redirect to login
- **Network Errors**: Retry logic for authentication requests
- **Edge Runtime Errors**: Fallback to Node.js runtime when needed

## Development and Testing

### Local Development
```bash
# Start development server with authentication
npm run dev

# Test authentication endpoints
curl -X POST http://localhost:3000/api/auth/signin

# Check session status
curl http://localhost:3000/api/auth/session-check
```

### Testing Strategy
- **Unit Tests**: Password hashing and verification functions
- **Integration Tests**: Authentication flow end-to-end
- **Edge Runtime Tests**: Middleware functionality
- **Security Tests**: Session security and CSRF protection

## Future Enhancements

### Multi-Factor Authentication
- **TOTP Support**: Time-based one-time passwords
- **SMS Verification**: Phone number verification
- **Email Verification**: Email-based confirmation
- **Backup Codes**: Recovery code generation

### Advanced Security Features
- **Rate Limiting**: Login attempt throttling
- **Device Management**: Device tracking and management
- **Session Management**: Active session monitoring
- **Audit Logging**: Authentication event logging

### Social Authentication
- **OAuth Providers**: Google, GitHub, etc.
- **Provider Configuration**: Multiple authentication methods
- **Account Linking**: Link multiple authentication methods
- **Profile Synchronization**: Sync profile data across providers

## Related Documents
- [System Architecture Overview](./01-overview.md) - High-level system design
- [Database Architecture](./04-database.md) - User data and session storage
- [Backend Architecture](./03-backend.md) - API security implementation
- [Frontend Architecture](./02-frontend.md) - Client-side authentication

## Changelog
- 2025-07-06: Initial authentication architecture documentation created
- 2025-07-06: Three-layer authentication system detailed
- 2025-07-06: Security implementation and performance characteristics documented
