import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, createToken, setAuthCookie, checkRateLimit, getClientIp } from '@/lib/auth';

/**
 * Zod schema for login request validation
 * Ensures the email is valid and password is provided
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * API route handler for user login
 * 
 * Handles authentication by:
 * 1. Implementing rate limiting to prevent brute force attacks
 * 2. Validating user input
 * 3. Checking credentials against database
 * 4. Creating JWT token and setting secure cookies
 * 
 * @param request The incoming request object
 * @returns JSON response with user data or error message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResponse = await checkRateLimit(request, `login_${clientIp}`);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // User not found or password doesn't match
    if (!user || !(await comparePassword(password, user.hashedPassword))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createToken({
      sub: user.id,
      email: user.email,
      name: user.name || undefined,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        // Don't include the actual token in the response for security
        isAuthenticated: true
      },
      { status: 200 }
    );

    // Set auth cookie (httpOnly for security)
    setAuthCookie(token, response);

    // Also set a non-httpOnly cookie for UI state detection
    // This doesn't contain the actual token, just indicates logged-in state
    response.cookies.set({
      name: 'auth_state',
      value: 'authenticated',
      maxAge: parseInt(process.env.JWT_EXPIRES_IN || '86400'),
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // This one can be read by JavaScript
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}