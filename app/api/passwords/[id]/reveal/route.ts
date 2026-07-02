import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { decrypt } from '@/lib/utils/encryption';
import { createAuditLog } from '@/lib/utils/audit';
import { readableWhere, type FamilyUser } from '@/lib/family';

// GET /api/passwords/[id]/reveal - Reveal (decrypt) a specific password
// This endpoint requires authentication and logs every access
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const password = await prisma.password.findFirst({
      where: {
        id,
        ...readableWhere(user as FamilyUser),
      },
      select: {
        id: true,
        encryptedPassword: true,
        title: true,
      },
    });

    if (!password) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      );
    }

    // Decrypt the password
    const decryptedPassword = decrypt(password.encryptedPassword);

    // Log the password reveal access
    await createAuditLog(
      user!.id,
      'reveal_password',
      'password',
      password.id,
      { title: password.title },
      req,
      user!.familyId
    );

    // Return ONLY the decrypted password, nothing else
    return NextResponse.json({
      password: decryptedPassword,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error revealing password:', error);
    }
    return NextResponse.json(
      { error: 'Failed to reveal password' },
      { status: 500 }
    );
  }
}
