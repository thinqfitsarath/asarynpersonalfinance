import type { Prisma, PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';
import { normalizeCode, sha256 } from '@/lib/utils/codes';

export interface ValidInvite {
  id: string;
  familyId: string;
  role: string;
}

/**
 * Resolves a plaintext invite code to a still-valid invite, or null.
 * Valid = exists, not yet used, not expired.
 */
export async function validateInvite(code: string): Promise<ValidInvite | null> {
  const codeHash = sha256(normalizeCode(code));
  const invite = await prisma.familyInvite.findUnique({
    where: { codeHash },
    select: {
      id: true,
      familyId: true,
      role: true,
      usedById: true,
      expiresAt: true,
    },
  });

  if (!invite || invite.usedById || invite.expiresAt < new Date()) {
    return null;
  }
  return { id: invite.id, familyId: invite.familyId, role: invite.role };
}

/**
 * Atomically consumes an invite inside a transaction. Only succeeds if the
 * invite is still unused (guards against two people racing one code).
 * Throws 'INVITE_ALREADY_USED' if it was consumed concurrently.
 */
export async function consumeInvite(
  tx: Prisma.TransactionClient | PrismaClient,
  inviteId: string,
  usedById: string
): Promise<void> {
  const consumed = await tx.familyInvite.updateMany({
    where: { id: inviteId, usedById: null },
    data: { usedById, usedAt: new Date() },
  });
  if (consumed.count === 0) {
    throw new Error('INVITE_ALREADY_USED');
  }
}
