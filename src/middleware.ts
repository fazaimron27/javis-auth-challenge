import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/middleware';

/**
 * Routes that require authentication
 * Users must be logged in to access these routes
 */
const protectedRoutes = ['/dashboard'];

/**
 * Routes that should redirect to dashboard if already authenticated
 * Prevents authenticated users from accessing login/signup pages
 */
const authRoutes = ['/', '/signin', '/signup'];

/**
 * Next.js middleware that runs before each request
 * Handles authentication redirection and route protection
 * 
 * @param request The incoming request object
 * @returns NextResponse with appropriate redirect or passes through
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const userIsAuthenticated = isAuthenticated(request);

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is an auth route (login/signup)
  const isAuthRoute = authRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && userIsAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users from protected routes to signin page
  if (isProtectedRoute && !userIsAuthenticated) {
    const url = new URL('/signin', request.url);
    // Removed return_to param - we'll directly redirect to dashboard after login
    return NextResponse.redirect(url);
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specifies which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api/* (API routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};