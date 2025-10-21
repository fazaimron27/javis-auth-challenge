import jwt from 'jsonwebtoken';

// Define types for JWT payload
export interface JWTPayload {
  sub: string;  // subject (user id)
  email: string;
  name?: string;
  iat?: number;  // issued at
  exp?: number;  // expiration time
}

/**
 * Create a JWT token for a user
 * @param payload The data to be included in the token
 * @returns The JWT token
 */
export function createToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '86400'; // 24 hours in seconds

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn: parseInt(expiresIn) });
}

/**
 * Verify a JWT token
 * @param token The token to verify
 * @returns The decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}