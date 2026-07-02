import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { passwordSchema } from '@/lib/validations/password';
import { encrypt } from '@/lib/utils/encryption';
import { readableWhere, canWrite, type FamilyUser } from '@/lib/family';

// GET /api/passwords - Get all passwords visible to the current family member
// NOTE: Passwords are NOT decrypted in this endpoint for security
// Use GET /api/passwords/[id]/reveal to decrypt individual passwords
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where = {
      ...readableWhere(user as FamilyUser),
      ...(category && { category }),
    };

    const passwords = await prisma.password.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        category: true,
        title: true,
        username: true,
        url: true,
        notes: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true } },
        // DO NOT include encryptedPassword
      },
    });

    return NextResponse.json(passwords);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching passwords:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch passwords' },
      { status: 500 }
    );
  }
}

// POST /api/passwords - Create a new password
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as any)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to add items' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = passwordSchema.parse(body);

    // Encrypt the password before storing
    const encryptedPassword = encrypt(validatedData.password);

    const password = await prisma.password.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        category: validatedData.category,
        title: validatedData.title,
        username: validatedData.username || null,
        encryptedPassword,
        url: validatedData.url || null,
        notes: validatedData.notes || null,
        visibility: validatedData.visibility || 'family',
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'create_password',
        entityType: 'password',
        entityId: password.id,
        metadata: JSON.stringify({ category: password.category, title: password.title }),
      },
    });

    return NextResponse.json(
      {
        ...password,
        password: validatedData.password,
        encryptedPassword: undefined,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating password:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create password' },
      { status: 500 }
    );
  }
}
