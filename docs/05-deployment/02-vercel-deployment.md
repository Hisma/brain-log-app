---
title: Vercel Deployment Guide
description: Complete guide to deploying the Brain Log App on Vercel with Edge Runtime compatibility
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Vercel Deployment Guide

## Overview

This guide covers deploying the Brain Log App to Vercel, including the hybrid Edge Runtime architecture, authentication configuration, and troubleshooting common deployment issues. The application uses a sophisticated setup that combines Edge Runtime for middleware with Node.js runtime for API routes.

## Hybrid Runtime Architecture

### Architecture Overview

The Brain Log App uses a hybrid runtime model optimized for Vercel:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Edge Runtime  │    │   Node.js Runtime │    │    Database     │
│                 │    │                   │    │                 │
│  • Middleware   │───▶│  • API Routes     │───▶│  • Neon Postgres│
│  • Route Guard  │    │  • Database Ops   │    │  • Connection   │
│  • Basic Auth   │    │  • Full Auth      │    │    Pooling      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Split Configuration Strategy

**Edge Runtime Components (Fast, Global):**
- `middleware.ts` - Route protection and basic authentication
- `auth.config.ts` - Edge-compatible auth configuration
- No database access, limited package compatibility

**Node.js Runtime Components (Full Features):**
- `auth.ts` - Complete authentication with database access
- API routes in `/api` - Full database operations
- Complex business logic and integrations

## Pre-Deployment Setup

### 1. Repository Preparation

Ensure your repository is properly configured:

```bash
# Verify all changes are committed
git status

# Push latest changes
git push origin main

# Verify package.json build script
npm run build  # Should complete without errors
```

### 2. Environment Variable Preparation

Create your environment variable list (without sensitive values):

```
Required Variables:
- DATABASE_URL
- NEXTAUTH_URL  
- NEXTAUTH_SECRET
- OPENAI_API_KEY

Optional Variables:
- EMAIL_SERVER_HOST
- EMAIL_SERVER_PORT
- EMAIL_SERVER_USER
- EMAIL_SERVER_PASSWORD
- EMAIL_FROM
```

### 3. Build Configuration Verification

Verify your `next.config.mjs` is production-ready:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  serverExternalPackages: ['@prisma/client'],
  
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL, 'your-app.vercel.app'] 
        : ['localhost:3000', '172.18.0.2:3000', '0.0.0.0:3000'],
    },
  },
  
  // Production security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Conditional caching based on environment
          process.env.NODE_ENV === 'production' ? {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          } : {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

## Vercel Deployment Process

### 1. Initial Vercel Setup

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Follow prompts to configure project
```

**Option B: Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Connect your GitHub account
3. Import your repository
4. Configure build settings

### 2. Build Settings Configuration

In Vercel dashboard or CLI:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: (leave empty - Next.js default)
Install Command: npm install
Development Command: npm run dev
```

### 3. Environment Variables Setup

In Vercel Dashboard → Project Settings → Environment Variables:

**Production Environment:**
```
DATABASE_URL = [Your production database URL]
NEXTAUTH_URL = https://your-app.vercel.app
NEXTAUTH_SECRET = [Your production secret]
OPENAI_API_KEY = [Your OpenAI API key]
```

**Preview Environment (optional):**
```
DATABASE_URL = [Your staging database URL]
NEXTAUTH_URL = https://your-app-preview.vercel.app
NEXTAUTH_SECRET = [Your staging secret]
OPENAI_API_KEY = [Your development OpenAI key]
```

### 4. Domain Configuration

**Custom Domain Setup:**
1. Vercel Dashboard → Project → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update NEXTAUTH_URL environment variable

**SSL Certificate:**
- Automatically provisioned by Vercel
- Includes automatic renewal
- Supports custom domains

## Authentication Configuration

### Split Auth Architecture

The application uses NextAuth.js v5 with a split configuration for Edge Runtime compatibility:

**auth.config.ts (Edge Runtime):**
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
    // JWT and session callbacks without database access
  },
  providers: [], // Defined in auth.ts
};
```

**auth.ts (Node.js Runtime):**
```typescript
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./src/lib/prisma";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Full provider configuration with database access
  ],
});
```

### Middleware Configuration

**middleware.ts:**
```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use Edge-compatible auth configuration
export const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Deployment Verification

### 1. Build Verification

After deployment, check:

```bash
# Verify build completed successfully in Vercel dashboard
# Check Functions tab for proper runtime assignment:
# - middleware.ts → Edge Runtime
# - API routes → Node.js Runtime
```

### 2. Functionality Testing

Test core features post-deployment:

1. **Authentication Flow:**
   - User registration
   - Login/logout
   - Session persistence

2. **API Endpoints:**
   - Daily logs CRUD operations
   - Weekly reflections
   - AI insights generation

3. **Database Operations:**
   - Data persistence
   - Relationship queries
   - Transaction handling

### 3. Performance Verification

Check Vercel Analytics:
- Core Web Vitals scores
- Function execution times
- Edge Runtime performance
- Database connection efficiency

## Common Deployment Issues & Solutions

### 1. Hydration Errors

**Symptoms:**
- Console errors about hydration mismatches
- Components not rendering consistently

**Solutions:**
```typescript
// Use client-side only rendering for dynamic content
import { useEffect, useState } from 'react';

function DynamicComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div>Loading...</div>; // Placeholder for SSR
  }
  
  return <div>{/* Dynamic content */}</div>;
}
```

### 2. Authentication Issues

**Symptoms:**
- Login redirects fail
- Session not persisting
- Middleware errors

**Solutions:**

1. **Verify NEXTAUTH_URL:**
   ```env
   # Must match your deployed domain exactly
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

2. **Check trustHost setting:**
   ```typescript
   // In auth.config.ts
   export const authConfig = {
     trustHost: true, // Required for Vercel deployment
     // ...
   };
   ```

3. **Verify cookie configuration:**
   ```typescript
   cookies: {
     sessionToken: {
       options: {
         secure: process.env.NODE_ENV === "production", // Must be true in production
         sameSite: "lax",
       },
     },
   },
   ```

### 3. Database Connection Issues

**Symptoms:**
- API routes failing with database errors
- Connection pool exhaustion
- Timeout errors

**Solutions:**

1. **Verify DATABASE_URL format:**
   ```env
   # Include connection pooling parameters
   DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&connection_limit=5"
   ```

2. **Optimize Prisma configuration:**
   ```typescript
   // src/lib/prisma.ts
   export const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL + 
             (process.env.NODE_ENV === 'production' ? '?connection_limit=5' : ''),
       },
     },
   });
   ```

### 4. Edge Runtime Compatibility

**Symptoms:**
- Middleware fails to deploy
- "Module not found" errors in Edge Runtime
- Authentication middleware not working

**Solutions:**

1. **Use Edge-compatible packages only:**
   ```typescript
   // ❌ Don't use in middleware or auth.config.ts
   import bcrypt from 'bcrypt';
   import { PrismaClient } from '@prisma/client';
   
   // ✅ Use in API routes only
   import bcrypt from 'bcrypt'; // Only in Node.js runtime
   ```

2. **Split configurations correctly:**
   ```typescript
   // middleware.ts - Use auth.config.ts
   import { authConfig } from "./auth.config";
   
   // API routes - Use auth.ts  
   import { auth } from "../../../auth";
   ```

### 5. Environment Variable Issues

**Symptoms:**
- Variables not loading
- Different values than expected
- Build-time vs runtime differences

**Solutions:**

1. **Check variable scope in Vercel:**
   - Development: Used for branch deployments
   - Preview: Used for pull request previews
   - Production: Used for main branch

2. **Verify variable precedence:**
   ```bash
   # Vercel environment variables override .env files
   # Production variables override preview variables
   ```

3. **Use Vercel system variables:**
   ```env
   # Automatically available
   VERCEL="1"
   VERCEL_URL="your-deployment-url.vercel.app"
   VERCEL_ENV="production" # or "preview" or "development"
   ```

## Performance Optimization

### 1. Edge Runtime Optimization

Maximize Edge Runtime benefits:

```typescript
// middleware.ts - Keep lightweight
export default auth((req) => {
  // Minimal logic for route protection
  const isAuthenticated = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  
  if (!isAuthenticated && !isAuthPage) {
    return Response.redirect(new URL('/login', req.url));
  }
});
```

### 2. Database Connection Optimization

Optimize for serverless environment:

```typescript
// Implement connection pooling
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + 
          '?connection_limit=5&pool_timeout=30&statement_timeout=30s',
    },
  },
});
```

### 3. API Route Optimization

Minimize cold start impact:

```typescript
// Use dynamic imports for heavy dependencies
const { generateInsights } = await import('../../../lib/openai');

// Implement response caching where appropriate
export async function GET(request: Request) {
  const response = await processRequest();
  
  return new Response(JSON.stringify(response), {
    headers: {
      'Cache-Control': 'public, s-maxage=60',
      'Content-Type': 'application/json',
    },
  });
}
```

## Monitoring and Maintenance

### 1. Vercel Analytics

Enable built-in monitoring:
- Core Web Vitals tracking
- Function performance metrics
- Error rate monitoring

### 2. Log Monitoring

Access deployment logs:
```bash
# Using Vercel CLI
vercel logs [deployment-url]

# View real-time logs
vercel logs --follow
```

### 3. Function Monitoring

Monitor function performance:
- Edge Runtime execution times
- Node.js function cold starts
- Database connection efficiency

## Security Considerations

### 1. Environment Variable Security

Never commit sensitive values:
```gitignore
# .gitignore
.env.local
.env.production.local
.env.*.local
```

### 2. Production Headers

Security headers configuration:
```javascript
// next.config.mjs
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        },
      ],
    },
  ];
},
```

### 3. API Security

Implement rate limiting and validation:
```typescript
// API route security
export async function POST(request: Request) {
  // Validate authentication
  const session = await auth();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Validate input
  const body = await request.json();
  // ... validation logic
}
```

## Rollback Procedures

### 1. Quick Rollback

Using Vercel Dashboard:
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "Promote to Production"

### 2. CLI Rollback

```bash
# List recent deployments
vercel ls

# Promote specific deployment
vercel promote [deployment-url]
```

### 3. Emergency Procedures

For critical issues:
1. Immediate rollback to last known good deployment
2. Update environment variables if needed
3. Monitor error rates and performance
4. Communicate status to users

## Related Documents

- [Environment Configuration](01-environments.md)
- [Database Setup](03-database-setup.md)
- [Monitoring Guide](04-monitoring.md)
- [Authentication Architecture](../02-architecture/05-authentication.md)

## Changelog

- **2025-07-06**: Initial Vercel deployment guide with hybrid runtime architecture
