import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { documentSchema } from '@/lib/validations/document';

// GET /api/documents/[id] - Get a specific document
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: id,
        userId: user!.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Log the access
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'view_document',
        entityType: 'document',
        entityId: document.id,
      },
    });

    return NextResponse.json({
      ...document,
      amount: document.amount ? Number(document.amount) : null,
      premium: document.premium ? Number(document.premium) : null,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: id,
        userId: user!.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = documentSchema.parse(body);

    const updatedDocument = await prisma.document.update({
      where: { id: id },
      data: {
        category: validatedData.category,
        title: validatedData.title,
        description: validatedData.description || null,
        documentType: validatedData.documentType || null,
        provider: validatedData.provider || null,
        policyNumber: validatedData.policyNumber || null,
        amount: validatedData.amount || null,
        premium: validatedData.premium || null,
        maturityDate: validatedData.maturityDate || null,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'update_document',
        entityType: 'document',
        entityId: updatedDocument.id,
        metadata: JSON.stringify({ title: updatedDocument.title }),
      },
    });

    return NextResponse.json({
      ...updatedDocument,
      amount: updatedDocument.amount ? Number(updatedDocument.amount) : null,
      premium: updatedDocument.premium ? Number(updatedDocument.premium) : null,
    });
  } catch (error: any) {
    console.error('Error updating document:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: id,
        userId: user!.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await prisma.document.delete({
      where: { id: id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'delete_document',
        entityType: 'document',
        entityId: id,
        metadata: JSON.stringify({ title: existingDocument.title }),
      },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
