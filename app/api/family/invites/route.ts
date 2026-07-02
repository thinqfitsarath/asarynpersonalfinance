import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { canWrite } from '@/lib/family';
import { generateInviteCode, sha256 } from '@/lib/utils/codes';

const INVITE_TTL_HOURS = 48;

const createInviteSchema = z.object({
  role: z.enum(['ADULT', 'CHILD']).default('ADULT'),
});

// POST /api/family/invites - Create an invite code (returned in plaintext ONCE)
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as any)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to invite members' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { role } = createInviteSchema.parse(body);

    const code = generateInviteCode();
    const invite = await prisma.familyInvite.create({
      data: {
        familyId: user!.familyId,
        codeHash: sha256(code),
        role,
        expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000),
        createdById: user!.id,
      },
      select: { id: true, role: true, expiresAt: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'create_invite',
        entityType: 'family_invite',
        entityId: invite.id,
        metadata: JSON.stringify({ role }),
      },
    });

    // The plaintext code is returned exactly once and never stored
    return NextResponse.json({ ...invite, code }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invite:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
