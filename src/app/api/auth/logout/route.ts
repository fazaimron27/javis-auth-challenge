import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

/**
 * API route handler for user logout
 * 
 * Handles the logout process by:
 * 1. Creating a success response
 * 2. Removing the secure authentication cookie
 * 3. Removing the non-httpOnly state cookie used for UI state
 * 
 * @returns JSON response indicating successful logout
 */
export async function POST(): Promise<NextResponse> {
  try {
    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear auth cookie
    deleteAuthCookie(response);

    // Also clear the non-httpOnly state cookie
    response.cookies.delete('auth_state');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}