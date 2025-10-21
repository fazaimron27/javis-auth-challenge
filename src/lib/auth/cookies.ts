import { type NextRequest, NextResponse } from 'next/server';

const TOKEN_NAME = 'auth_token';
const COOKIE_MAX_AGE = parseInt(process.env.JWT_EXPIRES_IN || '86400'); // seconds

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: COOKIE_MAX_AGE,
  path: '/',
  sameSite: 'lax' as const, // Changed from 'strict' to 'lax' to allow cross-page redirects
};

/**
 * Sets the authentication token as an HTTP-only cookie
 * @param token The JWT token
 * @param response The response object
 */
export function setAuthCookie(token: string, response: NextResponse): NextResponse {
  response.cookies.set({
    name: TOKEN_NAME,
    value: token,
    ...COOKIE_OPTIONS
  });
  return response;
}

/**
 * Gets the authentication token from the cookie
 * @param request The request object
 * @returns The JWT token or null
 */
export function getAuthCookie(request: NextRequest): string | null {
  return request.cookies.get(TOKEN_NAME)?.value || null;
}

/**
 * Deletes the authentication token cookie
 * @param response The response object
 */
export function deleteAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(TOKEN_NAME);
  return response;
}