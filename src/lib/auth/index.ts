/**
 * Auth module main entry point
 * 
 * This file exports server-side only authentication functions for API routes.
 * IMPORTANT: These use Node.js features and should NOT be imported in middleware or Edge functions.
 * 
 * The auth system is divided into several modules:
 * - password.ts: Handles password hashing and verification
 * - jwt.ts: Handles JWT token creation and verification
 * - cookies.ts: Manages authentication cookies
 * - rate-limiter.ts: Prevents brute force attacks
 * 
 * Usage guidelines:
 * 1. Do not import this file in middleware.ts or any Edge Runtime code
 * 2. For middleware, use '@/lib/auth/middleware' and '@/lib/auth/edge-jwt' instead
 * 3. For API routes, you can use this index file or import specific files directly
 */

export * from './password';
export * from './jwt';
export * from './cookies';
export * from './rate-limiter';

// Add a helper function to get client IP for rate limiting
export function getClientIp(request: Request): string {
  // Try to get IP from Cloudflare or other proxies first
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Return the first IP in the list (client's original IP)
    return forwarded.split(',')[0].trim();
  }

  // Fallback to a placeholder if we can't determine the IP
  return 'unknown-ip';
}