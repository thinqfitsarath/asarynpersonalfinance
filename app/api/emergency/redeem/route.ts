import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  normalizeCode,
  sha256,
  generateAccessToken,
} from '@/lib/utils/codes';
import { EMERGENCY_COOKIE } from '@/lib/emergency';

const ACCESS_WINDOW_HOURS = 72;

const redeemSchema = z.object({
  code: z.string().min(4).max(32),
  reason: z.string().max(500).optional(),
});

const GENERIC_ERROR = { error: 'That code is not valid.' };

// POST /api/emergency/redeem — PUBLIC endpoint.
// State machine: first valid use opens a pending request (owner is
// notified in-app and can deny). After the contact's delay period has
// passed without denial, entering the code again grants time-limited
// read-only access via an httpOnly cookie.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, reason } = redeemSchema.parse(body);
    const codeHash = sha256(normalizeCode(code));

    const contact = await prisma.trustedContact.findFirst({
      where: { recoveryCodeHash: codeHash, isActive: true },
      select: {
        id: true,
        familyId: true,
        userId: true,
        contactName: true,
        delayDays: true,
      },
    });

    // Unknown, revoked, or already-consumed codes all look identical
    if (!contact || !contact.familyId) {
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    const existing = await prisma.emergencyAccess.findFirst({
      where: {
        contactId: contact.id,
        status: { in: ['pending', 'approved'] },
      },
      orderBy: { requestedAt: 'desc' },
    });

    // Denied requests keep the code burned — same generic error
    const denied = await prisma.emergencyAccess.findFirst({
      where: { contactId: contact.id, status: 'denied' },
    });
    if (denied && !existing) {
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    // First use → open the pending request and start the clock
    if (!existing) {
      await prisma.emergencyAccess.create({
        data: {
          userId: contact.userId,
          familyId: contact.familyId,
          contactId: contact.id,
          status: 'pending',
          reason: reason || null,
        },
      });

      return NextResponse.json({
        status: 'pending',
        message: `Request received. Unless it is denied, access unlocks in ${contact.delayDays} ${contact.delayDays === 1 ? 'day' : 'days'}. Come back then and enter the code again.`,
      });
    }

    // Already approved and still valid → refresh cookie and continue
    if (
      existing.status === 'approved' &&
      existing.accessTokenHash &&
      existing.expiresAt &&
      existing.expiresAt > new Date()
    ) {
      // The one-time token can't be re-derived; a fresh visit needs the
      // still-set cookie. Tell them access is active.
      return NextResponse.json({
        status: 'approved',
        message:
          'Access is already active on the device where it was unlocked.',
      });
    }

    // Pending → check whether the delay window has passed
    const unlockAt = new Date(
      existing.requestedAt.getTime() + contact.delayDays * 24 * 60 * 60 * 1000
    );

    if (unlockAt > new Date()) {
      return NextResponse.json({
        status: 'pending',
        message: `Not yet. Access unlocks ${unlockAt.toLocaleDateString()} unless the request is denied.`,
      });
    }

    // Delay elapsed, never denied → approve and grant read-only access
    const token = generateAccessToken();
    const expiresAt = new Date(
      Date.now() + ACCESS_WINDOW_HOURS * 60 * 60 * 1000
    );

    await prisma.$transaction([
      prisma.emergencyAccess.update({
        where: { id: existing.id },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          expiresAt,
          accessTokenHash: sha256(token),
        },
      }),
      // Burn the recovery code — it is strictly one-time
      prisma.trustedContact.update({
        where: { id: contact.id },
        data: { recoveryCodeHash: null },
      }),
      prisma.auditLog.create({
        data: {
          userId: contact.userId,
          familyId: contact.familyId,
          action: 'emergency_access_granted',
          entityType: 'emergency_access',
          entityId: existing.id,
          metadata: JSON.stringify({ contactName: contact.contactName }),
        },
      }),
    ]);

    const response = NextResponse.json({
      status: 'approved',
      message: 'Access granted. Opening the vault…',
      redirect: '/emergency/vault',
    });
    response.cookies.set(EMERGENCY_COOKIE, `${existing.id}.${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_WINDOW_HOURS * 60 * 60,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }
    console.error('Error redeeming emergency code:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
