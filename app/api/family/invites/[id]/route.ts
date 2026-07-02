import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { canWrite, type FamilyRole } from '@/lib/family';

// DELETE /api/family/invites/[id] - Revoke an unused invite
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as FamilyRole)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to manage invites' },
      { status: 403 }
    );
  }

  try {
    const invite = await prisma.familyInvite.findFirst({
      where: { id, familyId: user!.familyId, usedById: null },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    await prisma.familyInvite.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'revoke_invite',
        entityType: 'family_invite',
        entityId: id,
      },
    });

    return NextResponse.json({ message: 'Invite revoked' });
  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json(
      { error: 'Failed to revoke invite' },
      { status: 500 }
    );
  }
}
