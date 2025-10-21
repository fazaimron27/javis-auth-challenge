// This file contains only the auth functions that are safe to use in middleware
// No native Node.js modules like bcrypt should be imported here
// DO NOT import jsonwebtoken or other Node.js-only modules here

import { NextRequest } from 'next/server';
import { simpleVerifyToken } from './edge-jwt';

const TOKEN_NAME = 'auth_token';

/**
 * Gets the authentication token from the cookie
 * @param request The request object
 * @returns The JWT token or null
 */
export function getAuthCookie(request: NextRequest): string | null {
  return request.cookies.get(TOKEN_NAME)?.value || null;
}

/**
 * Verify the authentication token from request
 * Uses a simplified verification for Edge Runtime compatibility
 * @param request The request object
 * @returns Whether the token appears to be valid
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = getAuthCookie(request);
  return token ? !!simpleVerifyToken(token) : false;
}