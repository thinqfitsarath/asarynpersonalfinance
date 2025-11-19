import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { trustedContactSchema } from '@/lib/validations/trusted-contact';

// GET /api/trusted-contacts/[id] - Get a specific trusted contact
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const contact = await prisma.trustedContact.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Trusted contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching trusted contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trusted contact' },
      { status: 500 }
    );
  }
}

// PUT /api/trusted-contacts/[id] - Update a trusted contact
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if contact exists and belongs to user
    const existingContact = await prisma.trustedContact.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Trusted contact not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = trustedContactSchema.parse(body);

    // Check if new email conflicts with another contact
    if (validatedData.contactEmail !== existingContact.contactEmail) {
      const emailConflict = await prisma.trustedContact.findFirst({
        where: {
          userId: user!.id,
          contactEmail: validatedData.contactEmail,
          id: { not: params.id },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'This email is already used by another trusted contact' },
          { status: 400 }
        );
      }
    }

    const updatedContact = await prisma.trustedContact.update({
      where: { id: params.id },
      data: {
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        relationship: validatedData.relationship,
        accessLevel: validatedData.accessLevel,
        delayDays: validatedData.delayDays,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'update_trusted_contact',
        entityType: 'trusted_contact',
        entityId: updatedContact.id,
        metadata: JSON.stringify({ contactName: updatedContact.contactName }),
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error: any) {
    console.error('Error updating trusted contact:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update trusted contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/trusted-contacts/[id] - Delete a trusted contact
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if contact exists and belongs to user
    const existingContact = await prisma.trustedContact.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Trusted contact not found' },
        { status: 404 }
      );
    }

    await prisma.trustedContact.delete({
      where: { id: params.id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'delete_trusted_contact',
        entityType: 'trusted_contact',
        entityId: params.id,
        metadata: JSON.stringify({ contactName: existingContact.contactName }),
      },
    });

    return NextResponse.json({ message: 'Trusted contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting trusted contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete trusted contact' },
      { status: 500 }
    );
  }
}

// PATCH /api/trusted-contacts/[id] - Toggle active status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const existingContact = await prisma.trustedContact.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Trusted contact not found' },
        { status: 404 }
      );
    }

    const updatedContact = await prisma.trustedContact.update({
      where: { id: params.id },
      data: {
        isActive: !existingContact.isActive,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: updatedContact.isActive ? 'activate_trusted_contact' : 'deactivate_trusted_contact',
        entityType: 'trusted_contact',
        entityId: updatedContact.id,
      },
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error toggling trusted contact status:', error);
    return NextResponse.json(
      { error: 'Failed to update trusted contact' },
      { status: 500 }
    );
  }
}
