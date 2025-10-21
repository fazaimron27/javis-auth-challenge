import { RateLimiter } from 'limiter';
import { NextRequest, NextResponse } from 'next/server';

// Store rate limiters in memory
// In a production environment, consider using Redis or another shared storage
const limiters = new Map<string, RateLimiter>();

/**
 * Configure rate limiting parameters:
 * - Limit to 5 login attempts per minute per IP address
 * - This helps prevent brute force attacks
 */
const ATTEMPTS_PER_MINUTE = 5;
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute

/**
 * Check if a request should be rate limited
 * Implements a token bucket algorithm for rate limiting
 * 
 * @param request The request to check
 * @param identifier The identifier to use for rate limiting (e.g. IP address)
 * @returns NextResponse with 429 error if rate limited, or null if request is allowed
 */
export async function checkRateLimit(
  request: NextRequest,
  identifier: string
): Promise<NextResponse | null> {
  // Create or get limiter for this identifier
  if (!limiters.has(identifier)) {
    limiters.set(
      identifier,
      new RateLimiter({
        tokensPerInterval: ATTEMPTS_PER_MINUTE,
        interval: WINDOW_SIZE_MS,
        fireImmediately: true,
      })
    );
  }

  const limiter = limiters.get(identifier)!;

  // Try to take a token
  const remainingRequests = await limiter.removeTokens(1);

  // If no tokens remaining, return 429 Too Many Requests
  if (remainingRequests < 0) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Request is allowed
  return null;
}

/**
 * Get client IP address from request
 * @param request The request object
 * @returns The client IP address or a fallback
 */
export function getClientIp(request: NextRequest): string {
  // Check for forwarded IP (when behind a proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');

  if (forwarded) {
    // Get the first IP if there are multiple
    return forwarded.split(',')[0].trim();
  }

  // Check for Cloudflare connecting IP
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // If no IP found in headers, use a fallback
  return 'unknown';
}