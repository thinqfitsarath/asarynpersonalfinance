import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { passwordSchema } from '@/lib/validations/password';
import { encrypt, decrypt } from '@/lib/utils/encryption';
import { readableWhere, canWrite, type FamilyUser } from '@/lib/family';

// GET /api/passwords/[id] - Get a specific password
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
    });

    if (!password) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      );
    }

    // Log the access
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'view_password',
        entityType: 'password',
        entityId: password.id,
      },
    });

    return NextResponse.json({
      ...password,
      password: decrypt(password.encryptedPassword),
      encryptedPassword: undefined,
    });
  } catch (error) {
    console.error('Error fetching password:', error);
    return NextResponse.json(
      { error: 'Failed to fetch password' },
      { status: 500 }
    );
  }
}

// PUT /api/passwords/[id] - Update a password
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as any)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to edit items' },
      { status: 403 }
    );
  }

  try {
    // Check the password exists and is visible to this member
    const existingPassword = await prisma.password.findFirst({
      where: {
        id,
        ...readableWhere(user as FamilyUser),
      },
    });

    if (!existingPassword) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = passwordSchema.parse(body);

    // Encrypt the new password
    const encryptedPassword = encrypt(validatedData.password);

    const updatedPassword = await prisma.password.update({
      where: { id },
      data: {
        category: validatedData.category,
        title: validatedData.title,
        username: validatedData.username || null,
        encryptedPassword,
        url: validatedData.url || null,
        notes: validatedData.notes || null,
        ...(validatedData.visibility && { visibility: validatedData.visibility }),
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'update_password',
        entityType: 'password',
        entityId: updatedPassword.id,
        metadata: JSON.stringify({ title: updatedPassword.title }),
      },
    });

    return NextResponse.json({
      ...updatedPassword,
      password: validatedData.password,
      encryptedPassword: undefined,
    });
  } catch (error: any) {
    console.error('Error updating password:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}

// DELETE /api/passwords/[id] - Delete a password
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as any)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to delete items' },
      { status: 403 }
    );
  }

  try {
    // Check the password exists and is visible to this member
    const existingPassword = await prisma.password.findFirst({
      where: {
        id,
        ...readableWhere(user as FamilyUser),
      },
    });

    if (!existingPassword) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      );
    }

    await prisma.password.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
        action: 'delete_password',
        entityType: 'password',
        entityId: id,
        metadata: JSON.stringify({ title: existingPassword.title }),
      },
    });

    return NextResponse.json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Error deleting password:', error);
    return NextResponse.json(
      { error: 'Failed to delete password' },
      { status: 500 }
    );
  }
}
