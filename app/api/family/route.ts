import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/utils/session';

// GET /api/family - Family members and active invites
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const [members, invites] = await Promise.all([
      prisma.user.findMany({
        where: { familyId: user!.familyId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.familyInvite.findMany({
        where: {
          familyId: user!.familyId,
          usedById: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          role: true,
          expiresAt: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({ members, invites });
  } catch (error) {
    console.error('Error fetching family:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family' },
      { status: 500 }
    );
  }
}
