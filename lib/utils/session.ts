import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Gets the current user session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Requires authentication for API routes
 * Returns user if authenticated, or returns 401 response
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { user, error: null };
}
