import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { getRequestMetadata } from '@/lib/utils/request';
import { normalizeCode, sha256 } from '@/lib/utils/codes';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const { ipAddress, userAgent } = getRequestMetadata(req);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // If joining an existing family, resolve the invite first
    let invite: { id: string; familyId: string; role: string } | null = null;
    if (validatedData.inviteCode?.trim()) {
      const codeHash = sha256(normalizeCode(validatedData.inviteCode));
      const found = await prisma.familyInvite.findUnique({
        where: { codeHash },
        select: { id: true, familyId: true, role: true, usedById: true, expiresAt: true },
      });

      if (!found || found.usedById || found.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Invalid or expired invite code' },
          { status: 400 }
        );
      }
      invite = found;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const familyId = invite
        ? invite.familyId
        : (await tx.family.create({ data: {} })).id;

      const created = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          familyId,
          role: invite ? invite.role : 'OWNER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          familyId: true,
          createdAt: true,
        },
      });

      if (invite) {
        // Atomically consume the invite: only succeeds if it is still
        // unused. Guards against two simultaneous registrations racing
        // to redeem the same code — the loser rolls the whole
        // transaction back (including this user) and gets a 400.
        const consumed = await tx.familyInvite.updateMany({
          where: { id: invite.id, usedById: null },
          data: { usedById: created.id, usedAt: new Date() },
        });
        if (consumed.count === 0) {
          throw new Error('INVITE_ALREADY_USED');
        }
      }

      await tx.auditLog.create({
        data: {
          userId: created.id,
          familyId,
          action: invite ? 'join_family' : 'register',
          entityType: 'user',
          entityId: created.id,
          ipAddress,
          userAgent,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error.message === 'INVITE_ALREADY_USED') {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
