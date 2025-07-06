---
title: Authentication Flow Implementation Guide
description: Complete step-by-step guide to implementing and working with the Brain Log App's 3-layer authentication system
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Authentication Flow Implementation Guide

## Overview

This guide provides complete, practical instructions for implementing and working with Brain Log App's sophisticated 3-layer authentication system. Built on NextAuth.js v5 with Edge Runtime optimization, this system provides secure, performant authentication with global CDN capabilities.

## Quick Reference

### Authentication Architecture
```
Layer 1: Edge Middleware (Global CDN, 10-50ms)
Layer 2: API Authentication (Node.js Runtime, Database)
Layer 3: Client Authentication (React Context, UI State)
```

### Key Files
- `auth.config.ts` - Edge Runtime configuration
- `auth.ts` - Node.js Runtime with database access
- `src/middleware.ts` - Route protection middleware
- `src/lib/crypto.ts` - Password security (PBKDF2)
- `src/lib/auth/AuthContext.tsx` - React authentication context
- `src/lib/auth/auth-client.ts` - Client-side utilities

## Complete Implementation Walkthrough

### Step 1: Edge Runtime Configuration

**File**: `auth.config.ts` (Project Root)

This file configures JWT-based authentication compatible with Edge Runtime for global performance.

```typescript
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Essential for Vercel Edge Runtime
  trustHost: true,
  
  // JWT strategy enables Edge Runtime compatibility
  session: { strategy: "jwt" as const },
  
  // Custom login/logout pages
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  
  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,    // Prevents XSS attacks
        sameSite: "lax",   // CSRF protection
        path: "/",         // Available site-wide
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
      },
    },
  },
  
  // JWT and session callbacks
  callbacks: {
    // JWT callback: Runs on token creation/refresh
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.timezone = user.timezone || "America/New_York";
      }
      return token;
    },
    
    // Session callback: Shapes session object for client
    async session({ session, token }) {
      if (token && session.user && token.id) {
        session.user.id = parseInt(String(token.id), 10);
        session.user.timezone = token.timezone || "America/New_York";
      }
      return session;
    },
    
    // Authorization callback: Route protection logic
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
      
      // Protect dashboard routes
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', request.nextUrl));
      }
      
      return true;
    },
  },
  
  // Providers defined in auth.ts (Node.js runtime)
  providers: [],
} satisfies NextAuthConfig;
```

### Step 2: Middleware Implementation

**File**: `src/middleware.ts`

The middleware runs at the Edge Runtime and provides global route protection.

```typescript
import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

// Create auth instance using Edge-compatible config
export const { auth } = NextAuth(authConfig);

// Export auth as default middleware
export default auth;

// Configure which routes middleware should run on
export const config = {
  // Run on all routes except:
  // - API routes (handled separately)
  // - Static files (_next/static)
  // - Images (_next/image)
  // - Favicon
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Step 3: Node.js Runtime Authentication

**File**: `auth.ts` (Project Root)

This file provides full NextAuth.js functionality with database access.

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
      
      // Authorization function: Validates user credentials
      async authorize(credentials) {
        // Input validation
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        
        // Database user lookup using Neon serverless driver
        const username = credentials.username as string;
        const users = await sql`
          SELECT id, username, "passwordHash", "displayName", timezone, theme 
          FROM "User" 
          WHERE username = ${username}
        `;
        
        if (users.length === 0) {
          return null; // User not found
        }
        
        const user = users[0];
        const password = credentials.password as string;
        const hash = user.passwordHash as string;
        
        // Password verification using PBKDF2
        if (!(await comparePasswords(password, hash))) {
          return null; // Invalid password
        }
        
        // Return user object for JWT token creation
        return {
          id: String(user.id),
          name: user.displayName || "",
          email: user.username, // Username used as email
          timezone: user.timezone || "America/New_York",
          theme: user.theme || "",
        };
      },
    }),
  ],
});

// Server-side authentication helpers
export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};
```

### Step 4: Password Security Implementation

**File**: `src/lib/crypto.ts`

PBKDF2 implementation using Web Crypto API for Edge Runtime compatibility.

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
  
  // Import password as cryptographic key
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive hash using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // 100,000 iterations for security
      hash: 'SHA-256'
    },
    key,
    256 // 256-bit output
  );
  
  // Convert to base64 and format
  const hashArray = new Uint8Array(hashBuffer);
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `PBKDF2:100000:${saltBase64}:${hashBase64}`;
}

// Verify password against stored hash
export async function comparePasswords(password: string, hashString: string): Promise<boolean> {
  // Parse stored hash format
  const parts = hashString.split(':');
  if (parts.length !== 4 || parts[0] !== 'PBKDF2') {
    return false;
  }
  
  const iterations = parseInt(parts[1], 10);
  const salt = new Uint8Array(atob(parts[2]).split('').map(c => c.charCodeAt(0)));
  const storedHash = new Uint8Array(atob(parts[3]).split('').map(c => c.charCodeAt(0)));
  
  // Hash provided password with stored salt
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
  
  // Constant-time comparison to prevent timing attacks
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

### Step 5: Client-Side Authentication Context

**File**: `src/lib/auth/AuthContext.tsx`

React context for managing authentication state in the browser.

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

### Step 6: Client-Side Authentication Utilities

**File**: `src/lib/auth/auth-client.ts`

Safe client-side authentication functions.

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

// Custom hook for authentication status
export const useAuthStatus = () => {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    user: session?.user || null,
  };
};
```

## Authentication Flows

### User Registration Flow

#### 1. Registration Form Submission
```typescript
// In registration component
import { hashPassword } from '@/lib/crypto';
import { sql } from '@/lib/neon';

const handleRegistration = async (formData: {
  username: string;
  password: string;
  displayName: string;
  timezone: string;
}) => {
  try {
    // Hash password using PBKDF2
    const passwordHash = await hashPassword(formData.password);
    
    // Create user in database
    const result = await sql`
      INSERT INTO "User" (username, "passwordHash", "displayName", timezone, theme)
      VALUES (${formData.username}, ${passwordHash}, ${formData.displayName}, ${formData.timezone}, 'light')
      RETURNING id, username, "displayName", timezone
    `;
    
    // Automatically sign in the new user
    const signInResult = await signIn('credentials', {
      username: formData.username,
      password: formData.password,
      redirect: false,
    });
    
    if (signInResult?.ok) {
      router.push('/'); // Redirect to dashboard
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

#### 2. API Route for Registration
```typescript
// /app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName, timezone } = await request.json();
    
    // Input validation
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUsers = await sql`
      SELECT id FROM "User" WHERE username = ${username}
    `;
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    const result = await sql`
      INSERT INTO "User" (username, "passwordHash", "displayName", timezone, theme)
      VALUES (${username}, ${passwordHash}, ${displayName}, ${timezone || 'America/New_York'}, 'light')
      RETURNING id, username, "displayName", timezone
    `;
    
    return NextResponse.json({
      success: true,
      user: result[0]
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### User Login Flow

#### 1. Login Form Implementation
```typescript
'use client';

import { signIn } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/'); // Redirect to dashboard
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            username: e.target.value
          }))}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            password: e.target.value
          }))}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
```

#### 2. Login Page Implementation
```typescript
// /app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStatus } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Brain Log
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

### Protected Route Implementation

#### 1. API Route Protection
```typescript
// Pattern for protecting API routes
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Authentication check
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Extract user ID for database queries
  const userId = session.user.id;
  
  // Proceed with authenticated logic
  try {
    // Your protected API logic here
    const data = await fetchUserSpecificData(userId);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2. Page-Level Protection
```typescript
// Pattern for protecting pages
'use client';

import { useAuthStatus } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      {/* Protected content */}
    </div>
  );
}
```

### Session Management

#### 1. Session Validation API
```typescript
// /app/api/auth/session-check/route.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

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
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
```

#### 2. Client-Side Session Refresh
```typescript
// Custom hook for session management
'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export const useSessionManagement = () => {
  const { data: session, status, update } = useSession();

  const refreshSession = useCallback(async () => {
    try {
      await update(); // Force session refresh
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }, [update]);

  const isSessionValid = useCallback(() => {
    if (!session) return false;
    
    // Check if session is expired
    const now = new Date();
    const expires = new Date(session.expires);
    
    return now < expires;
  }, [session]);

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    refreshSession,
    isSessionValid,
  };
};
```

### Logout Implementation

#### 1. Logout Function
```typescript
'use client';

import { signOut } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut({
        redirect: false, // Handle redirect manually
        callbackUrl: '/'
      });
      
      // Clear any additional client-side state
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return logout;
};
```

#### 2. Logout Button Component
```typescript
'use client';

import { useLogout } from '@/lib/hooks/useLogout';

export function LogoutButton() {
  const logout = useLogout();

  return (
    <button
      onClick={logout}
      className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
    >
      Sign Out
    </button>
  );
}
```

## Environment Configuration

### Required Environment Variables

```bash
# .env.local (Development)
DATABASE_URL="postgresql://username:password@host/database"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# .env (Production)
DATABASE_URL="postgresql://production-connection-string"
NEXTAUTH_SECRET="secure-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### NextAuth Secret Generation
```bash
# Generate secure secret
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

## Common Patterns and Best Practices

### 1. API Authentication Pattern
```typescript
// Reusable authentication wrapper
export const withAuth = (handler: Function) => {
  return async (request: NextRequest) => {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(request, session);
  };
};

// Usage in API routes
export const GET = withAuth(async (request: NextRequest, session: any) => {
  const userId = session.user.id;
  // Your protected logic here
});
```

### 2. Session Expiration Handling
```typescript
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useSessionExpiration = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const checkExpiration = () => {
      const now = new Date();
      const expires = new Date(session.expires);
      
      // Redirect 5 minutes before expiration
      const fiveMinutesBeforeExpiry = new Date(expires.getTime() - 5 * 60 * 1000);
      
      if (now >= fiveMinutesBeforeExpiry) {
        router.push('/login?session=expired');
      }
    };

    const interval = setInterval(checkExpiration, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
  }, [session, router]);
};
```

### 3. Type-Safe Session Access
```typescript
// Type definitions
interface AuthUser {
  id: number;
  name: string;
  email: string;
  timezone: string;
}

interface AuthSession {
  user: AuthUser;
  expires: string;
}

// Type-safe session hook
export const useTypedSession = (): {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} => {
  const { data: session, status } = useSession();
  
  return {
    session: session as AuthSession | null,
    user: session?.user as AuthUser | null,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
  };
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "NEXTAUTH_URL is not defined" Error
```bash
# Solution: Set NEXTAUTH_URL in environment
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
```

#### 2. Edge Runtime Compatibility Issues
```typescript
// ❌ Don't use Node.js APIs in auth.config.ts
import fs from 'fs'; // This will break Edge Runtime

// ✅ Use Web APIs only
const data = await fetch('/api/data');
```

#### 3. Session Not Persisting
```typescript
// Check cookie configuration in auth.config.ts
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production", // Ensure this matches your environment
    },
  },
}
```

#### 4. Database Connection Issues
```typescript
// Verify Neon connection string format
DATABASE_URL="postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]"

// Test connection
import { sql } from '@/lib/neon';
const result = await sql`SELECT NOW()`;
console.log('Database connected:', result);
```

#### 5. Password Hashing Errors
```typescript
// Ensure crypto is available (Edge Runtime compatible)
if (typeof crypto === 'undefined') {
  throw new Error('Web Crypto API not available');
}

// Use try-catch for PBKDF2 operations
try {
  const hash = await hashPassword(password);
} catch (error) {
  console.error('Password hashing failed:', error);
}
```

### Debug Mode

#### Enable NextAuth Debug Mode
```bash
# .env.local
NEXTAUTH_DEBUG=true
```

#### Session Debugging
```typescript
'use client';

import { useSession } from 'next-auth/react';

export function SessionDebug() {
  const { data: session, status } = useSession();
  
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        background: '#000', 
        color: '#fff', 
        padding: '1rem',
        fontSize: '12px',
        maxWidth: '300px'
      }}>
        <h4>Session Debug</h4>
        <p>Status: {status}</p>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    );
  }
  
  return null;
}
```

## Performance Considerations

### Edge Runtime Benefits
- **Global Performance**: 10-50ms authentication checks worldwide
- **No Cold Starts**: Instant response at CDN edge locations
- **Reduced Latency**: Authentication logic runs close to users

### Database Optimization
- **Minimal Queries**: Only login requires database access
- **Connection Efficiency**: Neon serverless driver optimizes connections
- **Index Usage**: Username uniqueness index for fast lookups

### Security Performance
- **PBKDF2 Optimization**: 100,000 iterations balance security and performance
- **Constant-Time Comparison**: Prevents timing attack vulnerabilities
- **JWT Verification**: Fast token validation without database queries

## Related Documents
- [Authentication Architecture](../02-architecture/05-authentication.md) - Detailed system design
- [API Reference - Authentication](../03-api-reference/02-authentication.md) - API documentation
- [Development Workflow](../01-getting-started/04-development-workflow.md) - Development process
- [Database Architecture](../02-architecture/04-database.md) - User storage and sessions

## Changelog
- 2025-07-06: Initial authentication flow implementation guide created
- 2025-07-06: Complete code examples and troubleshooting added
- 2025-07-06: Performance considerations and best practices documented
