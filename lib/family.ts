import prisma from '@/lib/prisma';

export type FamilyRole = 'OWNER' | 'ADULT' | 'CHILD';

export interface FamilyUser {
  id: string;
  familyId: string;
  role: FamilyRole;
}

/**
 * Ensures the user belongs to a family, creating one and backfilling their
 * legacy data if needed. Idempotent and transactional. Called from the
 * NextAuth jwt callback only when the token lacks a familyId, so it runs
 * once per legacy user, not per request.
 */
export async function ensureFamilyForUser(
  userId: string
): Promise<{ familyId: string; role: FamilyRole }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { familyId: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.familyId) {
    return { familyId: user.familyId, role: user.role as FamilyRole };
  }

  const familyId = await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({ data: {} });

    await tx.user.update({
      where: { id: userId },
      data: { familyId: family.id },
    });

    // Backfill all legacy rows created before the family vault existed
    const backfill = { where: { userId, familyId: null }, data: { familyId: family.id } };
    await tx.password.updateMany(backfill);
    await tx.document.updateMany(backfill);
    await tx.trustedContact.updateMany(backfill);
    await tx.emergencyAccess.updateMany(backfill);
    await tx.auditLog.updateMany(backfill);

    return family.id;
  });

  return { familyId, role: user.role as FamilyRole };
}

/**
 * Where-clause for items the user is allowed to read.
 * CHILD: family-visible items only.
 * ADULT/OWNER: family + adults items, plus their own private items.
 */
export function readableWhere(user: FamilyUser) {
  if (user.role === 'CHILD') {
    return { familyId: user.familyId, visibility: 'family' };
  }
  return {
    familyId: user.familyId,
    OR: [
      { visibility: { in: ['family', 'adults'] } },
      { visibility: 'private', userId: user.id },
    ],
  };
}

/** Whether this role may create/update/delete vault items. */
export function canWrite(role: FamilyRole): boolean {
  return role === 'OWNER' || role === 'ADULT';
}

export const VISIBILITY_OPTIONS = ['family', 'adults', 'private'] as const;
