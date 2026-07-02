import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { trustedContactSchema } from '@/lib/validations/trusted-contact';
import { canWrite, type FamilyRole } from '@/lib/family';

// GET /api/trusted-contacts - Get all trusted contacts for the current user
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const contacts = await prisma.trustedContact.findMany({
      where: {
        familyId: user!.familyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching trusted contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trusted contacts' },
      { status: 500 }
    );
  }
}

// POST /api/trusted-contacts - Create a new trusted contact
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (!canWrite(user!.role as FamilyRole)) {
    return NextResponse.json(
      { error: 'Your account does not have permission to add contacts' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = trustedContactSchema.parse(body);

    // Check if contact email already exists for this user
    const existingContact = await prisma.trustedContact.findFirst({
      where: {
        familyId: user!.familyId,
        contactEmail: validatedData.contactEmail,
      },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: 'This email is already added as a trusted contact' },
        { status: 400 }
      );
    }

    const contact = await prisma.trustedContact.create({
      data: {
        userId: user!.id,
        familyId: user!.familyId,
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
        familyId: user!.familyId,
        action: 'create_trusted_contact',
        entityType: 'trusted_contact',
        entityId: contact.id,
        metadata: JSON.stringify({
          contactName: contact.contactName,
          contactEmail: contact.contactEmail
        }),
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trusted contact:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create trusted contact' },
      { status: 500 }
    );
  }
}
