---
title: Auth.js v5 (NextAuth) Edge Runtime Implementation Patterns
description: Latest Auth.js v5 patterns, Edge Runtime compatibility, and authentication best practices for the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Auth.js v5 (NextAuth) Edge Runtime Implementation Patterns

## Overview

This document provides comprehensive patterns and best practices for implementing Auth.js v5 (formerly NextAuth.js) with Edge Runtime compatibility in the Brain Log App. It covers the three-layer authentication architecture, session management, and modern authentication patterns for 2025.

## Auth.js v5 Migration & Changes

### Key Changes from NextAuth.js v4
- **New Import Structure**: `import { NextAuth } from 'next-auth'` instead of `import NextAuth from 'next-auth'`
- **Environment Variables**: Prefixed with `AUTH_*` instead of `NEXTAUTH_*` (though both are supported)
- **Edge Runtime Support**: Native compatibility with Edge Runtime
- **Improved TypeScript Support**: Better type safety and inference
- **Configuration Split**: Separate configuration for Edge and Node.js environments

### Migration Benefits
- **Faster Authentication**: 10-50ms response times with Edge Runtime
- **Global Distribution**: Reduced latency worldwide
- **Better Developer Experience**: Improved TypeScript integration
- **Future-Proof**: Foundation for upcoming Auth.js features

## Three-Layer Authentication Architecture

### Layer 1: Edge Runtime Middleware (Global)
```typescript
// middleware.ts - Runs on Edge Runtime globally
import { auth } from '@/auth';

export default auth((req) => {
  // Global authentication logic
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  
  // Protect routes that require authentication
  const protectedRoutes = ['/dashboard', '/daily-log', '/insights', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register'];
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return Response.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Layer 2: API Route Authentication (Node.js Runtime)
```typescript
// app/api/auth/[...nextauth]/route.ts - Node.js Runtime for complex operations
import { handlers } from '@/auth';

export const { GET, POST } = handlers;

// Custom API routes with authentication
// app/api/daily-logs/route.ts
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const logs = await getDailyLogs(session.user.id);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const log = await createDailyLog({
      ...body,
      userId: session.user.id,
    });
    
    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    );
  }
}
```

### Layer 3: Client-Side Session Management
```typescript
// lib/auth/AuthContext.tsx - Client-side session management
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from 'next-auth';

interface AuthContextType {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: 'loading',
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  
  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session-check');
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData.session);
        setStatus(sessionData.session ? 'authenticated' : 'unauthenticated');
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Session fetch error:', error);
      setSession(null);
      setStatus('unauthenticated');
    }
  };
  
  useEffect(() => {
    fetchSession();
    
    // Refresh session periodically
    const interval = setInterval(fetchSession, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);
  
  const refresh = async () => {
    await fetchSession();
  };
  
  return (
    <AuthContext.Provider value={{ session, status, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Core Configuration Patterns

### Auth.js v5 Configuration
```typescript
// auth.ts - Main authentication configuration
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }
        
        try {
          const user = await getUserByEmail(credentials.email as string);
          
          if (!user || !user.password) {
            throw new Error('Invalid credentials');
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          
          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            timezone: user.timezone,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.timezone = user.timezone;
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.timezone) token.timezone = session.timezone;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.timezone = token.timezone as string;
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in/out
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return `${baseUrl}/dashboard`;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', { userId: user.id, email: user.email });
    },
    
    async signOut({ session, token }) {
      console.log('User signed out:', { userId: token?.id });
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
});
```

### Edge-Compatible Configuration
```typescript
// auth.config.ts - Edge Runtime compatible configuration
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnProtectedRoute = [
        '/daily-log',
        '/insights',
        '/profile',
        '/weekly-reflection',
      ].some(route => nextUrl.pathname.startsWith(route));
      
      if (isOnDashboard || isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      
      return true;
    },
  },
  
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
```

## Authentication Patterns

### Sign In Flow
```typescript
// app/login/page.tsx - Login page implementation
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### User Registration Flow
```typescript
// app/register/page.tsx - Registration page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    try {
      // Create user account
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      // Automatically sign in after registration
      const result = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error('Registration successful but sign-in failed');
      }
      
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">
            Get started with your health tracking journey
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### Session Management Hooks
```typescript
// lib/hooks/useAuth.ts - Enhanced authentication hook
'use client';

import { useAuth as useAuthContext } from '@/lib/auth/AuthContext';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { session, status, refresh } = useAuthContext();
  const router = useRouter();
  
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const updateSession = async (updates: Partial<Session['user']>) => {
    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        await refresh(); // Refresh session with updated data
      }
    } catch (error) {
      console.error('Session update error:', error);
    }
  };
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logout,
    updateSession,
    refresh,
  };
}
```

## Protected Route Patterns

### Server Component Protection
```typescript
// Higher-order component for protected pages
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function withAuth<T extends {}>(
  Component: React.ComponentType<T>
): Promise<React.ComponentType<T>> {
  return async function AuthenticatedComponent(props: T) {
    const session = await auth();
    
    if (!session?.user) {
      redirect('/login');
    }
    
    return <Component {...props} />;
  };
}

// Usage in pages
const ProtectedDashboard = await withAuth(DashboardPage);
export default ProtectedDashboard;
```

### Client Component Protection
```typescript
// lib/components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return fallback || <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
```

## Environment Configuration

### Environment Variables (Auth.js v5)
```bash
# .env.local - Auth.js v5 environment variables

# Auth.js v5 Configuration (preferred prefix)
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="your-database-url"

# Optional: Legacy NextAuth variables (still supported)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Type Definitions
```typescript
// types/next-auth.d.ts - Extended Auth.js types
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      timezone: string;
    } & DefaultSession['user'];
  }
  
  interface User extends DefaultUser {
    id: string;
    timezone: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    timezone: string;
  }
}
```

## Error Handling Patterns

### Authentication Error Handling
```typescript
// lib/auth/error-handling.ts
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: new AuthError(
    'Invalid email or password',
    'INVALID_CREDENTIALS',
    401
  ),
  USER_NOT_FOUND: new AuthError(
    'User not found',
    'USER_NOT_FOUND',
    404
  ),
  EMAIL_ALREADY_EXISTS: new AuthError(
    'Email already exists',
    'EMAIL_ALREADY_EXISTS',
    409
  ),
  SESSION_EXPIRED: new AuthError(
    'Session expired',
    'SESSION_EXPIRED',
    401
  ),
} as const;

// Error handler for API routes
export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }
  
  console.error('Unexpected auth error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Session Expiry Handling
```typescript
// lib/auth/session-manager.ts
'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export function SessionManager() {
  const { refresh, logout } = useAuth();
  
  const handleSessionExpiry = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  }, [refresh, logout]);
  
  // Listen for session expiry from API responses
  useEffect(() => {
    const handleFetchResponse = (event: Event) => {
      const response = (event as CustomEvent).detail;
      
      if (response?.status === 401) {
        handleSessionExpiry();
      }
    };
    
    window.addEventListener('auth:session-expired', handleFetchResponse);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleFetchResponse);
    };
  }, [handleSessionExpiry]);
  
  return null;
}

// Enhanced fetch wrapper with auth handling
export async function authFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    // Dispatch session expiry event
    window.dispatchEvent(
      new CustomEvent('auth:session-expired', { detail: response })
    );
  }
  
  return response;
}
```

## Performance Optimization

### Session Caching
```typescript
// lib/auth/session-cache.ts
import { unstable_cache } from 'next/cache';
import { auth } from '@/auth';

export const getCachedSession = unstable_cache(
  async () => {
    return await auth();
  },
  ['user-session'],
  {
    revalidate: 300, // 5 minutes
    tags: ['session'],
  }
);

// Invalidate session cache when needed
import { revalidateTag } from 'next/cache';

export function invalidateSessionCache() {
  revalidateTag('session');
}
```

### Optimistic Session Updates
```typescript
// lib/hooks/useOptimisticAuth.ts
'use client';

import { useOptimistic } from 'react';
import { useAuth } from './useAuth';

export function useOptimisticAuth() {
  const { user, updateSession } = useAuth();
  
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (current, update: Partial<typeof user>) => ({
      ...current,
      ...update,
    })
  );
  
  const updateUserOptimistically = async (updates: Partial<typeof user>) => {
    // Optimistically update UI
    setOptimisticUser(updates);
    
    try {
      // Perform actual update
      await updateSession(updates);
    } catch (error) {
      // Revert optimistic update on error
      console.error('Failed to update user:', error);
    }
  };
  
  return {
    user: optimisticUser,
    updateUser: updateUserOptimistically,
  };
}
```

## Testing Patterns

### Mocking Auth.js v5
```typescript
// __tests__/utils/auth-mock.ts
import { Session } from 'next-auth';

export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    timezone: 'America/New_York',
  },
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAuth = jest.fn(() => Promise.resolve(mockSession));

// Mock the auth function
jest.mock('@/auth', () => ({
  auth: mockAuth,
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
```

### Testing Protected Components
```typescript
// __tests__/components/ProtectedComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedComponent from '@/components/ProtectedComponent';

// Mock the useAuth hook
jest.mock('@/lib/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedComponent', () => {
  it('renders when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockSession.user,
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
      updateSession: jest.fn(),
      refresh: jest.fn(),
    });
    
    render(<ProtectedComponent />);
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  it('shows loading when session is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      logout: jest.fn(),
      updateSession: jest.fn(),
      refresh: jest.fn(),
    });
    
    render(<ProtectedComponent />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## Migration Guide from v4 to v5

### Step-by-Step Migration
```typescript
// 1. Update dependencies
// package.json
{
  "dependencies": {
    "next-auth": "5.0.0-beta.4", // Latest v5 beta
    "@auth/drizzle-adapter": "^0.3.6" // If using Drizzle
  }
}

// 2. Update import statements
// Before (v4)
import NextAuth from 'next-auth';

// After (v5)
import { NextAuth } from 'next-auth';

// 3. Update configuration structure
// Before (v4)
export default NextAuth({
  // config
});

// After (v5)
export const { handlers, auth, signIn, signOut } = NextAuth({
  // config
});

// 4. Update environment variables
// Before (v4)
NEXTAUTH_SECRET=
NEXTAUTH_URL=

// After (v5) - both work, but AUTH_ is preferred
AUTH_SECRET=
AUTH_URL=
NEXTAUTH_SECRET= // Still supported
NEXTAUTH_URL=   // Still supported
```

## Common Anti-Patterns to Avoid

### ❌ Blocking Edge Runtime with Node.js APIs
```typescript
// ❌ Don't use Node.js APIs in Edge Runtime
export default auth((req) => {
  const fs = require('fs'); // Error: fs not available in Edge Runtime
  // ...
});

// ✅ Use Edge-compatible alternatives
export default auth((req) => {
  // Use Web APIs or Edge Runtime compatible libraries
  // ...
});
```

### ❌ Synchronous Session Fetching
```typescript
// ❌ Don't block rendering for session
export default function Component() {
  const session = getSessionSync(); // Doesn't exist
  return <div>{session.user.name}</div>;
}

// ✅ Use proper async patterns
export default function Component() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>{user.name}</div>;
}
```

### ❌ Storing Sensitive Data in JWT
```typescript
// ❌ Don't store sensitive data in JWT tokens
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.password = user.password; // Never do this
      token.creditCard = user.creditCard; // Never do this
    }
    return token;
  },
}

// ✅ Store only necessary, non-sensitive data
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.email = user.email;
      token.name = user.name;
      token.timezone = user.timezone;
    }
    return token;
  },
}
```

## Security Best Practices

### Secure Configuration
```typescript
// ✅ Production security configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use secure secret in production
  secret: process.env.AUTH_SECRET,
  
  // Secure session configuration
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (reasonable duration)
    updateAge: 24 * 60 * 60,  // Update session every 24 hours
  },
  
  // Secure JWT configuration
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // Match session duration
  },
  
  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  // Security headers
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  // Disable debug in production
  debug: process.env.NODE_ENV === 'development',
});
```

### Rate Limiting
```typescript
// lib/auth/rate-limit.ts
import { NextRequest } from 'next/server';

const attempts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(request: NextRequest, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const key = request.ip || 'anonymous';
  const now = Date.now();
  
  const userAttempts = attempts.get(key);
  
  if (!userAttempts || now > userAttempts.resetTime) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }
  
  if (userAttempts.count >= maxAttempts) {
    return { 
      success: false, 
      remaining: 0,
      resetTime: userAttempts.resetTime,
    };
  }
  
  userAttempts.count++;
  return { 
    success: true, 
    remaining: maxAttempts - userAttempts.count,
  };
}

// Usage in login API
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request);
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }
  
  // Continue with authentication...
}
```

## Monitoring & Observability

### Authentication Events Logging
```typescript
// lib/auth/monitoring.ts
export function logAuthEvent(
  event: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    metadata,
  };
  
  // Log to your monitoring service
  console.log('Auth Event:', logData);
  
  // Send to external monitoring (e.g., DataDog, Sentry)
  if (process.env.NODE_ENV === 'production') {
    // analytics.track('auth_event', logData);
  }
}

// Integration in auth configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ... other config
  
  events: {
    async signIn({ user, account, profile }) {
      logAuthEvent('sign_in', user.id, {
        provider: account?.provider,
        email: user.email,
      });
    },
    
    async signOut({ session, token }) {
      logAuthEvent('sign_out', token?.id as string);
    },
    
    async createUser({ user }) {
      logAuthEvent('user_created', user.id, {
        email: user.email,
        name: user.name,
      });
    },
    
    async session({ session, token }) {
      // Track active sessions (be careful about frequency)
      if (Math.random() < 0.1) { // Sample 10% of sessions
        logAuthEvent('session_active', token?.id as string);
      }
    },
  },
});
```

### Health Checks
```typescript
// app/api/auth/health/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  try {
    // Test database connection
    const testConnection = await testDatabaseConnection();
    
    // Test auth configuration
    const testAuth = await auth();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: testConnection ? 'ok' : 'error',
        auth: 'ok',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

## Related Documents
- `docs/08-frameworks/01-nextjs15-patterns.md` - Next.js 15 patterns and App Router
- `docs/08-frameworks/07-vercel-edge-runtime.md` - Edge Runtime optimization
- `docs/02-architecture/05-authentication.md` - Authentication architecture overview
- `docs/03-api-reference/02-authentication.md` - Authentication API reference

## External Resources
- [Auth.js v5 Documentation](https://authjs.dev/)
- [Auth.js Edge Runtime Guide](https://authjs.dev/guides/edge-compatibility)
- [NextAuth.js Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Auth.js Security Guide](https://authjs.dev/guides/basics/securing-your-site)

## Changelog
- 2025-07-06: Initial Auth.js v5 implementation patterns created
- 2025-07-06: Three-layer authentication architecture documented
- 2025-07-06: Edge Runtime compatibility patterns established
- 2025-07-06: Security best practices and monitoring patterns added
