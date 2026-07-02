import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { canWrite } from '@/lib/family';

// POST /api/emergency-access/[id]/deny — owner/adult denies a request,
// killing any granted access instantly (the vault re-checks per request).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as any)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to do this' },
      { status: 403 }
    );
  }

  try {
    const access = await prisma.emergencyAccess.findFirst({
      where: {
        id,
        familyId: user!.familyId,
        status: { in: ['pending', 'approved'] },
      },
    });

    if (!access) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.emergencyAccess.update({
      where: { id },
      data: {
        status: 'denied',
        deniedAt: new Date(),
        accessTokenHash: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'emergency_access_denied',
        entityType: 'emergency_access',
        entityId: id,
      },
    });

    return NextResponse.json({ message: 'Request denied' });
  } catch (error) {
    console.error('Error denying emergency access:', error);
    return NextResponse.json(
      { error: 'Failed to deny request' },
      { status: 500 }
    );
  }
}
