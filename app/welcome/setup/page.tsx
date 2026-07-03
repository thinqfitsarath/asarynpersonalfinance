import { redirect } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth/server';
import { ensureFamilyForUser } from '@/lib/family';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export const dynamic = 'force-dynamic';

async function startOwnFamily() {
  'use server';
  const { data: session } = await auth.getSession();
  const identity = session?.user;
  if (!identity?.email) redirect('/signin');

  const user = await prisma.user.findFirst({
    where: { neonAuthUserId: identity!.id },
  });
  if (!user) redirect('/welcome');
  if (!user.familyId) {
    await ensureFamilyForUser(user.id);
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'register', entityType: 'user', entityId: user.id },
    });
  }
  redirect('/dashboard');
}

export default async function WelcomeSetupPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.email) redirect('/signin');

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-sun text-white">
            <LifeBuoy className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mb-1 text-2xl font-extrabold text-ink">
            That invite didn&apos;t work
          </h1>
          <p className="text-ink-soft">
            The link may have expired or already been used.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <Alert tone="info" className="mb-5">
            Ask whoever invited you to send a fresh link, then open it again.
            Or start your own family vault now — you can invite others later.
          </Alert>

          <form action={startOwnFamily}>
            <Button type="submit" className="w-full">
              Start my own family vault
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
