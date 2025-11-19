import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';
import { documentSchema } from '@/lib/validations/document';
import { Decimal } from '@prisma/client/runtime/library';

// GET /api/documents - Get all documents for the current user
export async function GET(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where = {
      userId: user!.id,
      ...(category && { category }),
    };

    const documents = await prisma.document.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedDocuments = documents.map((doc) => ({
      ...doc,
      amount: doc.amount ? Number(doc.amount) : null,
      premium: doc.premium ? Number(doc.premium) : null,
    }));

    return NextResponse.json(serializedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const validatedData = documentSchema.parse(body);

    const document = await prisma.document.create({
      data: {
        userId: user!.id,
        category: validatedData.category,
        title: validatedData.title,
        description: validatedData.description || null,
        documentType: validatedData.documentType || null,
        provider: validatedData.provider || null,
        policyNumber: validatedData.policyNumber || null,
        amount: validatedData.amount ? new Decimal(validatedData.amount) : null,
        premium: validatedData.premium ? new Decimal(validatedData.premium) : null,
        maturityDate: validatedData.maturityDate || null,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: 'create_document',
        entityType: 'document',
        entityId: document.id,
        metadata: JSON.stringify({ category: document.category, title: document.title }),
      },
    });

    return NextResponse.json(
      {
        ...document,
        amount: document.amount ? Number(document.amount) : null,
        premium: document.premium ? Number(document.premium) : null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating document:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
