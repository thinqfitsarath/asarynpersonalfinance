import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sha256 } from '@/lib/utils/codes';

export const EMERGENCY_COOKIE = 'emergency_token';

/**
 * Validates the emergency access cookie against the database on every
 * request. Returns the active EmergencyAccess record (with family info)
 * or null. Owner denial or expiry kills access instantly because this
 * is re-checked per request — nothing is trusted client-side.
 */
export async function getEmergencySession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(EMERGENCY_COOKIE)?.value;
  if (!raw) return null;

  const dotIndex = raw.indexOf('.');
  if (dotIndex <= 0) return null;
  const id = raw.slice(0, dotIndex);
  const token = raw.slice(dotIndex + 1);
  if (!id || !token) return null;

  const access = await prisma.emergencyAccess.findUnique({
    where: { id },
    select: {
      id: true,
      familyId: true,
      status: true,
      expiresAt: true,
      accessTokenHash: true,
      contact: { select: { contactName: true } },
    },
  });

  if (
    !access ||
    access.status !== 'approved' ||
    !access.familyId ||
    !access.accessTokenHash ||
    access.accessTokenHash !== sha256(token) ||
    !access.expiresAt ||
    access.expiresAt < new Date()
  ) {
    return null;
  }

  return access;
}
