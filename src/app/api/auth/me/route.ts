import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Import from direct path to ensure we're using the Node.js version
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * API route handler for retrieving the current authenticated user
 * 
 * This endpoint:
 * 1. Extracts the JWT token from either cookies or Authorization header
 * 2. Verifies the token's authenticity and validity
 * 3. Retrieves the user's profile data from the database
 * 4. Returns user information (excluding sensitive data)
 * 
 * @param request The incoming request
 * @returns JSON response with user data or error message
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get current user' },
      { status: 500 }
    );
  }
}