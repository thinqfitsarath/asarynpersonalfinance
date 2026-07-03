import { NextResponse } from 'next/server';
import { getCurrentAppUser, type AppUser } from '@/lib/auth/current-user';

/** A fully-provisioned user — guaranteed to belong to a family. */
export type AuthedUser = AppUser & { familyId: string };

/**
 * Gets the current app user (Neon Auth session → our profile row), or null.
 */
export async function getCurrentUser() {
  return getCurrentAppUser();
}

/**
 * Requires authentication for API routes.
 * Returns `{ user, error }` — the SAME shape the routes already consume
 * (user.id / user.familyId / user.role). Fails loud (403) if the user has
 * no family yet rather than silently returning empty data.
 */
export async function requireAuth() {
  const user = await getCurrentAppUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (!user.familyId) {
    return {
      error: NextResponse.json(
        { error: 'Family setup incomplete - please sign out and back in' },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { user: user as AuthedUser, error: null };
}
