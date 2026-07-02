import { redirect } from 'next/navigation';
import { LifeBuoy, KeyRound, FileText, HeartHandshake } from 'lucide-react';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/utils/encryption';
import { getEmergencySession } from '@/lib/emergency';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

// Read-only emergency vault. Access is validated against the database on
// EVERY request (cookie token hash + approved status + expiry), so an
// owner's denial takes effect immediately. This page never creates a
// NextAuth session — all mutating API routes remain closed.
export const dynamic = 'force-dynamic';

export default async function EmergencyVaultPage() {
  const access = await getEmergencySession();

  if (!access) {
    redirect('/emergency');
  }

  const [passwords, documents, contacts] = await Promise.all([
    prisma.password.findMany({
      where: { familyId: access.familyId! },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        category: true,
        title: true,
        username: true,
        url: true,
        notes: true,
        encryptedPassword: true,
      },
    }),
    prisma.document.findMany({
      where: { familyId: access.familyId! },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    }),
    prisma.trustedContact.findMany({
      where: { familyId: access.familyId! },
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        relationship: true,
      },
    }),
  ]);

  // Log every render of the emergency vault
  await prisma.auditLog.create({
    data: {
      userId: (await prisma.emergencyAccess.findUnique({
        where: { id: access.id },
        select: { userId: true },
      }))!.userId,
      familyId: access.familyId,
      action: 'emergency_vault_viewed',
      entityType: 'emergency_access',
      entityId: access.id,
    },
  });

  const expires = access.expiresAt!.toLocaleString();

  return (
    <div className="min-h-screen bg-cream pb-16">
      <header className="border-b-2 border-sand bg-coral-soft">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-coral text-white">
            <LifeBuoy className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="font-extrabold text-ink">
              Emergency vault access — read only
            </h1>
            <p className="text-sm text-ink-soft">
              Granted to {access.contact.contactName} · expires {expires}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 pt-6">
        <Alert tone="info">
          This is a read-only view. Every visit to this page is logged and
          the family can revoke access at any time.
        </Alert>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-ink">
            <KeyRound className="h-5 w-5 text-primary-deep" aria-hidden />
            Passwords ({passwords.length})
          </h2>
          <div className="space-y-3">
            {passwords.map((p) => (
              <Card key={p.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-extrabold text-ink">{p.title}</h3>
                  <span className="text-xs font-bold uppercase text-ink-faint">
                    {p.category}
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  {p.username && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Username</dt>
                      <dd className="break-all font-bold text-ink">{p.username}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-ink-faint">Password</dt>
                    <dd className="break-all font-mono font-bold text-ink">
                      {decrypt(p.encryptedPassword)}
                    </dd>
                  </div>
                  {p.url && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Website</dt>
                      <dd className="break-all text-ink">{p.url}</dd>
                    </div>
                  )}
                  {p.notes && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Notes</dt>
                      <dd className="text-ink-soft">{p.notes}</dd>
                    </div>
                  )}
                </dl>
              </Card>
            ))}
            {passwords.length === 0 && (
              <p className="text-ink-faint">No passwords stored.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-ink">
            <FileText className="h-5 w-5 text-sun-deep" aria-hidden />
            Documents ({documents.length})
          </h2>
          <div className="space-y-3">
            {documents.map((d) => (
              <Card key={d.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-extrabold text-ink">{d.title}</h3>
                  <span className="text-xs font-bold uppercase text-ink-faint">
                    {d.category}
                  </span>
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  {d.provider && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Provider</dt>
                      <dd className="font-bold text-ink">{d.provider}</dd>
                    </div>
                  )}
                  {d.policyNumber && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Policy #</dt>
                      <dd className="font-bold text-ink">{d.policyNumber}</dd>
                    </div>
                  )}
                  {d.amount && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Amount</dt>
                      <dd className="font-bold text-ink">
                        ${Number(d.amount).toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {d.description && (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-ink-faint">Notes</dt>
                      <dd className="text-ink-soft">{d.description}</dd>
                    </div>
                  )}
                </dl>
              </Card>
            ))}
            {documents.length === 0 && (
              <p className="text-ink-faint">No documents stored.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold text-ink">
            <HeartHandshake className="h-5 w-5 text-coral-deep" aria-hidden />
            Trusted contacts ({contacts.length})
          </h2>
          <div className="space-y-3">
            {contacts.map((c) => (
              <Card key={c.id}>
                <h3 className="font-extrabold text-ink">{c.contactName}</h3>
                <p className="text-sm text-ink-soft">
                  {c.contactEmail} · {c.relationship}
                </p>
              </Card>
            ))}
            {contacts.length === 0 && (
              <p className="text-ink-faint">No trusted contacts stored.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
