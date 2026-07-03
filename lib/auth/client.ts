'use client';

import { createAuthClient } from '@neondatabase/auth/next';

/**
 * Browser-side Neon Auth client for the passwordless sign-in UI:
 * `authClient.signIn.magicLink(...)`, `authClient.signIn.social(...)`,
 * `authClient.signOut()`.
 */
export const authClient = createAuthClient();
