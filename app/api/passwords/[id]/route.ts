import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { passwordSchema } from '@/lib/validations/password';
import { encrypt, decrypt } from '@/lib/utils/encryption';

// GET /api/passwords/[id] - Get a specific password
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const password = await prisma.password.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
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
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if password exists and belongs to user
    const existingPassword = await prisma.password.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
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
      where: { id: params.id },
      data: {
        category: validatedData.category,
        title: validatedData.title,
        username: validatedData.username || null,
        encryptedPassword,
        url: validatedData.url || null,
        notes: validatedData.notes || null,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
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
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if password exists and belongs to user
    const existingPassword = await prisma.password.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
      },
    });

    if (!existingPassword) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      );
    }

    await prisma.password.delete({
      where: { id: params.id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'delete_password',
        entityType: 'password',
        entityId: params.id,
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
