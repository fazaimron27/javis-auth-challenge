// This file contains a simplified JWT verification that works in Edge Runtime
// It does NOT perform cryptographic verification (for security reasons, this should only be used for redirects)
// The actual verification will happen in the API routes which run in Node.js environment

import { JWTPayload } from './jwt';

/**
 * Simple check if a JWT token is potentially valid by checking structure and expiration
 * This does NOT perform cryptographic verification and should only be used for basic checks in middleware
 * 
 * @param token The JWT token to verify structure
 * @returns A basic parsed payload or null
 */
export function simpleVerifyToken(token: string): JWTPayload | null {
  try {
    // JWT consists of 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Properly decode base64url format used by JWT
    // First replace characters for base64url to base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

    // Now decode it
    const payload = JSON.parse(atob(paddedBase64));
    // Check for required fields
    if (!payload.sub || !payload.email) {
      return null;
    }

    // Check token expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      // Token has expired
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch {
    return null;
  }
}