import { NextRequest, NextResponse } from 'next/server';
// Import from direct path to ensure we're using the Node.js version
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * API route handler for lightweight authentication status check
 * 
 * A simplified auth check endpoint that:
 * 1. Verifies if the user is authenticated based on JWT token
 * 2. Does not require database access (more performant)
 * 3. Can use either cookie-based or bearer token authentication
 * 4. Returns basic user information extracted from the token
 * 
 * Use this endpoint for UI state management and simple auth checks
 * where full user profile data is not needed
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookie
    let token = getAuthCookie(request);

    // If token not in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // User is authenticated
    return NextResponse.json({
      authenticated: true,
      userId: payload.sub,
      email: payload.email
    }, { status: 200 });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}