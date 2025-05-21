import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@auth';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If the user is not authenticated and trying to access a protected route
  if (!session?.user && !isPublicRoute) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is authenticated and trying to access login/register
  if (session?.user && (pathname === '/login' || pathname === '/register')) {
    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
