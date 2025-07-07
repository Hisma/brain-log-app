import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { NextResponse } from "next/server";

// Create a separate Auth.js instance for middleware without database access
// This follows the recommended approach from the Auth.js Edge Compatibility guide
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { auth } = req;
  const user = auth?.user;
  const { pathname } = req.nextUrl;
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers for all responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // CSP header for additional security
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Role-based access control
  if (pathname.startsWith('/admin')) {
    // Admin routes require ADMIN role
    if (!user || user.role !== 'ADMIN' || !user.isActive) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } else if (pathname.startsWith('/api/admin')) {
    // Admin API routes require ADMIN role
    if (!user || user.role !== 'ADMIN' || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
  } else if (pathname === '/pending') {
    // Pending page is only for users with PENDING role
    if (!user || user.role !== 'PENDING') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  } else if (['/daily-log', '/weekly-reflection', '/insights', '/weekly-insights', '/profile'].some(path => pathname.startsWith(path))) {
    // Protected user routes require authentication and active account
    if (!user || !user.isActive) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Users with PENDING role should be redirected to pending page
    if (user.role === 'PENDING') {
      return NextResponse.redirect(new URL('/pending', req.url));
    }
  }
  
  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - these are handled by individual route protection
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
