# Vercel Deployment Fixes

This document outlines the fixes implemented to resolve authentication and hydration issues when deploying to Vercel.

## Issues Fixed

1. **Root Layout Client Component Issue**
   - Removed `'use client'` directive from `src/app/layout.tsx`
   - Created a separate client-side providers wrapper

2. **Middleware Import Error**
   - Fixed import paths in middleware and API routes
   - Updated relative paths to correctly point to auth files

3. **Session Hydration Issues**
   - Added proper client-side checks in AuthContext
   - Improved session handling to prevent hydration mismatches

4. **Server Actions Configuration**
   - Added Vercel production URL to allowedOrigins in next.config.mjs

5. **Theme Hydration Issues**
   - Simplified ThemeProvider to follow official next-themes recommendations
   - Added client-side only rendering for theme-dependent components
   - Fixed date/time hydration mismatches

6. **Edge Runtime Authentication Issues**
   - Updated middleware to use a separate Auth.js instance without database access
   - Added trustHost and cookie configuration to auth.config.ts
   - Followed the recommended "Split Config" approach from Auth.js Edge Compatibility guide

7. **Session Synchronization Issues**
   - Enhanced login and registration flow to ensure proper session establishment
   - Added forced session updates after authentication
   - Implemented hard navigation after login/register to ensure complete page refresh
   - Configured SessionProvider to refetch on window focus

## Changes Made

### 1. Root Layout Architecture

- **src/app/layout.tsx**: Converted to a Server Component by removing 'use client' directive
- **src/components/providers/ClientProviders.tsx**: Created a new client-side wrapper for providers
- **src/components/layout/Layout.tsx**: Updated to use the new ClientProviders wrapper

### 2. Import Path Fixes

- **src/app/api/auth/[...nextauth]/route.ts**: Fixed import path
- **src/app/api/auth/session-check/route.ts**: Fixed import path

### 3. Client-Side Hydration Fixes

- **src/lib/auth/AuthContext.tsx**: Added proper client-side checks to prevent hydration mismatches
- **next.config.mjs**: Updated serverExternalPackages and allowedOrigins configuration

### 4. Theme Hydration Fixes

- **src/lib/utils/ThemeProvider.tsx**: Simplified to follow official next-themes recommendations
- **src/components/ui/modetoggle.tsx**: Added client-side only rendering with useHasMounted hook
- **src/components/current-time.tsx**: Fixed date/time hydration mismatches with client-side only rendering

### 5. Edge Runtime Authentication Fixes

- **src/middleware.ts**: Updated to use a separate Auth.js instance without database access
  ```typescript
  import NextAuth from "next-auth";
  import { authConfig } from "../auth.config";
  
  // @ts-expect-error - NextAuth v5 beta has type issues
  export const { auth } = NextAuth(authConfig);
  
  export default auth;
  ```

- **auth.config.ts**: Added trustHost and cookie configuration
  ```typescript
  export const authConfig = {
    // Trust the NEXTAUTH_URL and any URLs in the VERCEL_URL env var
    trustHost: true,
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
    // ... other config
  };
  ```

### 6. Session Synchronization Fixes

- **src/lib/auth/AuthContext.tsx**: Enhanced login function to force session update
  ```typescript
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login...');
      
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      if (result?.ok) {
        console.log('Login successful, updating session...');
        
        // Force a session update after successful login
        try {
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Update the session state
          const updatedSession = await updateSession();
          console.log('Session updated:', !!updatedSession);
          
          return true;
        } catch (updateError) {
          console.error('Session update error after login:', updateError);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  ```

- **src/app/login/page.tsx**: Added hard navigation after login
  ```typescript
  if (success) {
    // Add a small delay before redirecting to ensure the session is fully updated
    console.log('Login successful, waiting for session to update before redirecting...');
    
    // Wait for session to be fully established
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Force a hard navigation instead of client-side navigation
    window.location.href = '/';
  }
  ```

- **src/components/providers/ClientProviders.tsx**: Configured SessionProvider
  ```typescript
  <SessionProvider 
    // Only refetch when window regains focus
    // This is a more targeted approach that doesn't cause random refreshes
    refetchOnWindowFocus={true}
  >
    {/* ... */}
  </SessionProvider>
  ```

## Vercel Deployment Instructions

1. **Environment Variables**
   Ensure these environment variables are set in your Vercel project:

   ```
   DATABASE_URL=postgres://neondb_owner:password@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require
   NEXTAUTH_URL=https://brain-log-app.vercel.app
   NEXTAUTH_SECRET=vRHQbehoXUoCTwsaC0m89n0H7Vsq0Vtj6blu6zKLd9k=
   OPENAI_API_KEY=your-openai-key
   ```

2. **Deployment**
   Deploy to Vercel using:

   ```bash
   vercel --prod
   ```

3. **Verification**
   After deployment, verify:
   - Login functionality works
   - No hydration errors in console
   - Session persistence works correctly
   - Navigation between pages works

## Troubleshooting

If you encounter issues after deployment:

1. **Check Browser Console**: Look for hydration errors or other JavaScript errors
2. **Verify Environment Variables**: Ensure all required variables are set correctly
3. **Check Network Requests**: Inspect auth-related API calls for errors
4. **Clear Browser Cache**: Try clearing cache and cookies if session issues persist
5. **Hydration Warnings**: If you still see hydration warnings:
   - Add `suppressHydrationWarning` to specific components causing issues
   - Check components that use dynamic data like dates, times, or theme-dependent styles
   - Ensure client-side components don't render different content during SSR vs client render

## Architecture Overview

The application now follows a more robust architecture:

- **Server Components**: Handle initial rendering and data fetching
- **Client Components**: Handle interactivity and state management
- **Edge Runtime Compatibility**: Middleware and auth config are Edge-compatible
- **Hybrid Database Approach**: Using Prisma for API routes and Neon for Edge Runtime
- **Hydration-Safe Components**: Components properly handle server/client rendering differences
- **Split Auth Configuration**: Separate auth config for Edge Runtime and Node.js environments

This separation ensures proper hydration and prevents client/server mismatches that were causing authentication issues.

## Key Hydration Principles Applied

1. **Client-Side Detection**: Using useEffect to detect client-side rendering
2. **Placeholder Content**: Showing placeholder content during SSR
3. **suppressHydrationWarning**: Applied to components with expected differences
4. **Simplified Theme Handling**: Following next-themes best practices
5. **Date/Time Safety**: Ensuring date/time rendering only happens client-side
6. **Edge-Compatible Auth**: Following Auth.js Edge Compatibility guide recommendations
7. **Session Synchronization**: Ensuring proper session establishment and updates

## Session Synchronization Pattern

The application now follows a robust session synchronization pattern:

1. **Enhanced Login Flow**:
   - Force session update after successful login
   - Add delay before navigation to ensure session is established
   - Use hard navigation (window.location.href) instead of client-side routing

2. **Improved Session Provider Configuration**:
   - Refetch on window focus
   - Proper error handling for session updates

3. **Robust Error Handling**:
   - Detailed logging for authentication operations
   - Graceful fallbacks for session update failures
   - Session expiration detection and handling

## Edge Runtime Authentication Pattern

The application now follows the recommended "Split Config" approach from the Auth.js Edge Compatibility guide:

1. **auth.config.ts**: Common configuration without database access (Edge-compatible)
2. **auth.ts**: Full configuration with database access (Node.js only)
3. **middleware.ts**: Uses auth.config.ts for Edge Runtime compatibility

This pattern ensures that authentication works correctly in both Edge Runtime and Node.js environments.
