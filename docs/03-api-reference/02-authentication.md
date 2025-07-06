---
title: Authentication API
description: User authentication and session management endpoints
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Authentication API

## Overview

The Brain Log App uses NextAuth.js v5 for authentication with a credentials-based provider and JWT session management. The authentication system provides secure user login, session validation, and automatic session management.

## Authentication Flow

1. **User Registration**: Users register via `/api/users` endpoint
2. **User Login**: Users authenticate via NextAuth.js signin process
3. **Session Management**: JWT tokens manage user sessions
4. **Session Validation**: Automatic validation on protected endpoints
5. **User Logout**: Session termination via NextAuth.js signout

## Endpoints

### NextAuth.js Authentication Handler

**Endpoint**: `/api/auth/[...nextauth]`  
**Methods**: GET, POST  
**Authentication**: Public (handles authentication)  
**Runtime**: Node.js  

#### Description
Handles all NextAuth.js authentication operations including signin, signout, session management, and provider callbacks.

#### Supported Operations
- **Sign In**: `POST /api/auth/signin`
- **Sign Out**: `POST /api/auth/signout`
- **Session**: `GET /api/auth/session`
- **CSRF Token**: `GET /api/auth/csrf`
- **Providers**: `GET /api/auth/providers`

#### Sign In Request
```bash
POST /api/auth/signin/credentials
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=userpassword&callbackUrl=/
```

#### Sign In Response (Success)
```json
HTTP 200 OK
{
  "url": "http://localhost:3000/",
  "ok": true
}
```

#### Sign In Response (Error)
```json
HTTP 401 Unauthorized
{
  "error": "CredentialsSignin",
  "status": 401,
  "ok": false,
  "url": "http://localhost:3000/login?error=CredentialsSignin"
}
```

#### Session Request
```bash
GET /api/auth/session
```

#### Session Response (Authenticated)
```json
HTTP 200 OK
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "timezone": "America/New_York",
    "theme": "light"
  },
  "expires": "2025-08-06T14:30:00.000Z"
}
```

#### Session Response (Unauthenticated)
```json
HTTP 200 OK
{}
```

### Session Validation

**Endpoint**: `/api/auth/session-check`  
**Methods**: GET  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Custom endpoint for validating current session status and retrieving fresh session data. Includes cache-control headers to ensure fresh session validation.

#### Request
```bash
GET /api/auth/session-check
```

#### Headers
```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
Pragma: no-cache
Expires: 0
```

#### Response (Valid Session)
```json
HTTP 200 OK
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
Pragma: no-cache
Expires: 0

{
  "status": "ok",
  "session": {
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "user@example.com",
      "timezone": "America/New_York",
      "theme": "light"
    }
  }
}
```

#### Response (Invalid Session)
```json
HTTP 401 Unauthorized
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0

{
  "error": "Unauthorized"
}
```

## Authentication Configuration

### Session Strategy
- **Type**: JWT (JSON Web Tokens)
- **Storage**: HTTPOnly cookies
- **Security**: Secure in production, SameSite=Lax
- **Expiration**: Based on NextAuth.js default (30 days)

### Cookie Configuration
```typescript
cookies: {
  sessionToken: {
    name: "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production"
    }
  }
}
```

### JWT Token Structure
```typescript
{
  id: string,           // User ID (converted from number)
  timezone: string,     // User timezone preference
  name?: string,        // User display name
  email?: string,       // User email/username
  iat: number,          // Issued at timestamp
  exp: number,          // Expiration timestamp
  jti: string           // JWT ID
}
```

## Credentials Provider

### Provider Configuration
- **Type**: Credentials
- **Username Field**: email/username
- **Password Field**: password
- **Validation**: Custom authorization function

### Authorization Process
1. **Input Validation**: Verify username and password provided
2. **User Lookup**: Query database for user by username
3. **Password Verification**: Compare provided password with stored hash
4. **User Object Creation**: Return user object if valid

### Authorization Function
```typescript
async authorize(credentials) {
  if (!credentials?.username || !credentials?.password) {
    return null;
  }
  
  // Database lookup using Neon serverless
  const users = await sql`
    SELECT id, username, "passwordHash", "displayName", timezone, theme 
    FROM "User" 
    WHERE username = ${username}
  `;
  
  if (users.length === 0) {
    return null;
  }
  
  // Password verification using Edge-compatible crypto
  const isValid = await comparePasswords(password, hash);
  if (!isValid) {
    return null;
  }
  
  return {
    id: String(user.id),
    name: user.displayName || "",
    email: user.username,
    timezone: user.timezone || "America/New_York",
    theme: user.theme || ""
  };
}
```

## Password Security

### Password Hashing
- **Algorithm**: PBKDF2 with SHA-256
- **Salt**: Randomly generated per password
- **Iterations**: 100,000 iterations
- **Key Length**: 64 bytes
- **Edge Runtime Compatible**: Yes

### Password Comparison
```typescript
async function comparePasswords(password: string, hash: string): Promise<boolean> {
  // Extract salt and stored hash from stored value
  const [storedSalt, storedHash] = hash.split(':');
  
  // Hash the provided password with the stored salt
  const hashedPassword = await hashPassword(password, storedSalt);
  
  // Compare the hashes
  return hashedPassword === hash;
}
```

## Session Management

### Session Callbacks
```typescript
// JWT Callback - runs whenever JWT is created/accessed
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.timezone = user.timezone || "America/New_York";
  }
  return token;
}

// Session Callback - runs whenever session is accessed
async session({ session, token }) {
  if (token && session.user && token.id) {
    session.user.id = parseInt(String(token.id), 10);
    session.user.timezone = token.timezone || "America/New_York";
  }
  return session;
}
```

### Session Data Structure
```typescript
interface Session {
  user: {
    id: number;           // User ID (converted to number for Prisma)
    name?: string;        // Display name
    email?: string;       // Username/email
    timezone?: string;    // User timezone preference
    theme?: string;       // UI theme preference
  };
  expires: string;        // ISO date string
}
```

## Middleware Integration

### Route Protection
```typescript
// Middleware configuration for route protection
export const authConfig = {
  callbacks: {
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
        return isLoggedIn;
      }
      
      return true;
    }
  }
}
```

## Error Handling

### Authentication Errors

#### Invalid Credentials
```json
HTTP 401 Unauthorized
{
  "error": "CredentialsSignin"
}
```

#### Session Expired
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Missing Credentials
```json
HTTP 400 Bad Request
{
  "error": "Missing credentials"
}
```

## Security Features

### CSRF Protection
- Automatic CSRF token generation and validation
- Built-in NextAuth.js CSRF protection
- Secure state parameter handling

### Secure Cookies
- HTTPOnly cookies prevent XSS access
- Secure flag in production
- SameSite=Lax prevents CSRF
- Automatic cookie cleanup on signout

### Session Security
- JWT tokens signed and encrypted
- Automatic token rotation
- Configurable session expiration
- Secure token storage

## Integration with API Endpoints

### Standard Authentication Pattern
All protected API endpoints use this pattern:

```typescript
export async function GET(request: Request) {
  // Validate session
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Use user ID for data scoping
  const userId = session.user.id;
  
  // Continue with authenticated logic...
}
```

### Session Helper Functions
```typescript
// Check if user is authenticated
const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};

// Get current user
const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};
```

## Client-Side Integration

### Session Management
```typescript
// Client-side session access via NextAuth
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();

// Session status: "loading" | "authenticated" | "unauthenticated"
```

### Authentication Actions
```typescript
import { signIn, signOut } from "next-auth/react";

// Sign in with credentials
await signIn("credentials", {
  username: "user@example.com",
  password: "password",
  callbackUrl: "/"
});

// Sign out
await signOut({ callbackUrl: "/" });
```

## Development Considerations

### Edge Runtime Compatibility
- **auth.config.ts**: Edge Runtime compatible configuration
- **auth.ts**: Node.js runtime for full features
- **Middleware**: Uses Edge Runtime compatible configuration
- **API Routes**: Use Node.js runtime configuration

### Environment Variables
```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Database Integration
- User authentication via Neon serverless database
- Edge Runtime compatible SQL queries
- User lookup and validation
- Session data persistence

## Testing Authentication

### Manual Testing
```bash
# Test session validation
curl -X GET http://localhost:3000/api/auth/session-check \
  -H "Cookie: next-auth.session-token=your-token"

# Test sign in
curl -X POST http://localhost:3000/api/auth/signin/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpassword"
```

### Session Validation Testing
```typescript
// Test session validation in API routes
const session = await auth();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
console.log('Is authenticated:', !!session?.user);
```

## Related Documents
- [API Overview](01-overview.md)
- [User Management API](03-users.md)
- [Authentication Architecture](../02-architecture/05-authentication.md)
- [System Security](../02-architecture/01-overview.md#security)

## Changelog
- 2025-07-06: Initial authentication API documentation created
