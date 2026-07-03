import { cache } from 'react';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth/server';

export interface AppUser {
  id: string;
  name: string | null;
  email: string;
  familyId: string | null;
  role: string;
}

/**
 * Resolves the current Neon Auth session to our app-side `User` profile row.
 *
 * READ-ONLY + link-only: it will lazily attach `neonAuthUserId` to a
 * pre-existing row matched by email (seamless migration of the original
 * account), but it NEVER creates a User or a Family. All provisioning
 * (new user rows, family creation, invite consumption) happens exactly
 * once in /welcome, the callbackURL of every sign-in. This keeps the
 * invite flow race-free and family scoping correct.
 *
 * Returns null when there is no session, or when the signed-in identity
 * has no profile row yet (i.e. /welcome hasn't provisioned it).
 *
 * Wrapped in React cache() so multiple calls within one request (e.g.
 * layout + page + requireAuth) share a single DB round-trip.
 */
export const getCurrentAppUser = cache(async (): Promise<AppUser | null> => {
  const { data: session } = await auth.getSession();
  const identity = session?.user;
  if (!identity?.email) return null;

  const neonAuthUserId = identity.id;

  // 1) Already linked to this Neon Auth identity.
  let user = await prisma.user.findFirst({ where: { neonAuthUserId } });

  // 2) Pre-migration row (created under NextAuth): match by email and link.
  if (!user) {
    const byEmail = await prisma.user.findUnique({
      where: { email: identity.email },
    });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          neonAuthUserId,
          name: byEmail.name ?? identity.name ?? null,
        },
      });
    }
  }

  // 3) No profile yet — /welcome will create it.
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    familyId: user.familyId,
    role: user.role,
  };
});
