import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { canWrite } from '@/lib/family';
import { generateRecoveryCode, sha256 } from '@/lib/utils/codes';

// POST /api/trusted-contacts/[id]/recovery-code
// Generates a one-time emergency recovery code for this contact.
// The plaintext is returned exactly once; only its hash is stored.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as any)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to manage contacts' },
      { status: 403 }
    );
  }

  try {
    const contact = await prisma.trustedContact.findFirst({
      where: { id, familyId: user!.familyId },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const code = generateRecoveryCode();
    await prisma.trustedContact.update({
      where: { id },
      data: {
        recoveryCodeHash: sha256(code),
        recoveryCodeGeneratedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'generate_recovery_code',
        entityType: 'trusted_contact',
        entityId: id,
        metadata: JSON.stringify({ contactName: contact.contactName }),
      },
    });

    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    console.error('Error generating recovery code:', error);
    return NextResponse.json(
      { error: 'Failed to generate recovery code' },
      { status: 500 }
    );
  }
}
