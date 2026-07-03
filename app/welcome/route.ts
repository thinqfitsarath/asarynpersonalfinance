import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth/server';
import { ensureFamilyForUser } from '@/lib/family';
import { validateInvite, consumeInvite } from '@/lib/invites';

/**
 * First-login resolver — the callbackURL of every sign-in.
 *
 * Provisioning happens ONLY here (getCurrentAppUser never creates rows):
 * - resolve/link/create our profile row for the Neon Auth identity
 * - already in a family → straight to the dashboard
 * - valid pending invite → atomically join that family
 * - invalid pending invite → the setup screen (don't silently split families)
 * - no invite → create their own family as OWNER
 */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const { data: session } = await auth.getSession();
  const identity = session?.user;

  if (!identity?.email) {
    return NextResponse.redirect(new URL('/signin', origin));
  }

  // 1) Resolve our profile row (link by neonAuthUserId, then email, else create).
  let user = await prisma.user.findFirst({
    where: { neonAuthUserId: identity.id },
  });
  if (!user) {
    const byEmail = await prisma.user.findUnique({
      where: { email: identity.email },
    });
    user = byEmail
      ? await prisma.user.update({
          where: { id: byEmail.id },
          data: {
            neonAuthUserId: identity.id,
            name: byEmail.name ?? identity.name ?? null,
          },
        })
      : await prisma.user.create({
          data: {
            email: identity.email,
            name: identity.name ?? null,
            neonAuthUserId: identity.id,
          },
        });
  }

  const clearInvite = (res: NextResponse) => {
    res.cookies.delete('pending_invite');
    return res;
  };

  // 2) Returning user already in a family → dashboard.
  if (user.familyId) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        familyId: user.familyId,
        action: 'login',
        entityType: 'user',
        entityId: user.id,
      },
    });
    return clearInvite(NextResponse.redirect(new URL('/dashboard', origin)));
  }

  // 3) Provision a family for this new user.
  const cookieStore = await cookies();
  const pendingCode = cookieStore.get('pending_invite')?.value;

  if (pendingCode) {
    const invite = await validateInvite(pendingCode);
    if (!invite) {
      // Stale/used code — don't create a rival family; let them choose.
      return clearInvite(
        NextResponse.redirect(new URL('/welcome/setup?invite_error=1', origin))
      );
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user!.id },
          data: { familyId: invite.familyId, role: invite.role },
        });
        await consumeInvite(tx, invite.id, user!.id);
        await tx.auditLog.create({
          data: {
            userId: user!.id,
            familyId: invite.familyId,
            action: 'join_family',
            entityType: 'user',
            entityId: user!.id,
          },
        });
      });
    } catch {
      // Lost a concurrent race for the code.
      return clearInvite(
        NextResponse.redirect(new URL('/welcome/setup?invite_error=1', origin))
      );
    }
    return clearInvite(NextResponse.redirect(new URL('/dashboard', origin)));
  }

  // 4) No invite → their own family, as OWNER.
  await ensureFamilyForUser(user.id);
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'register',
      entityType: 'user',
      entityId: user.id,
    },
  });
  return clearInvite(NextResponse.redirect(new URL('/dashboard', origin)));
}
