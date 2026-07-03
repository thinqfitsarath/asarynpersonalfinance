import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound,
  FileText,
  HeartHandshake,
  Users,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { readableWhere, type FamilyRole } from '@/lib/family';
import { Card } from '@/components/ui/Card';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { DoodleHeart, DoodleKey, DoodleStar } from '@/components/illustrations';

const sections = [
  {
    href: '/dashboard/passwords',
    label: 'Passwords',
    icon: KeyRound,
    tile: 'bg-primary-soft text-primary-deep',
  },
  {
    href: '/dashboard/documents',
    label: 'Documents',
    icon: FileText,
    tile: 'bg-sun-soft text-sun-deep',
  },
  {
    href: '/dashboard/trusted-contacts',
    label: 'Trusted Contacts',
    icon: HeartHandshake,
    tile: 'bg-coral-soft text-coral-deep',
  },
  {
    href: '/dashboard/family',
    label: 'Family Members',
    icon: Users,
    tile: 'bg-plum-soft text-plum-deep',
  },
];

const quickActions = [
  { href: '/dashboard/passwords/new', label: 'Add a password' },
  { href: '/dashboard/documents/new', label: 'Add a document' },
  { href: '/dashboard/trusted-contacts/new', label: 'Add a trusted contact' },
];

const tips = [
  'Use strong, unique passwords for each account',
  'Regularly update important document information',
  'Keep your trusted contacts list up to date',
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Never run family-scoped queries with an unresolved familyId — Prisma
  // would drop the undefined filter and aggregate across all families.
  if (!session.user.familyId) {
    redirect('/auth/login');
  }

  const familyUser = {
    id: session.user.id,
    familyId: session.user.familyId,
    role: session.user.role as FamilyRole,
  };

  const [passwordCount, documentCount, contactCount, memberCount] =
    await Promise.all([
      prisma.password.count({ where: readableWhere(familyUser) }),
      prisma.document.count({ where: readableWhere(familyUser) }),
      prisma.trustedContact.count({ where: { familyId: familyUser.familyId } }),
      prisma.user.count({ where: { familyId: familyUser.familyId } }),
    ]);

  const counts = [passwordCount, documentCount, contactCount, memberCount];

  const emergencyRequests = await prisma.emergencyAccess.findMany({
    where: {
      familyId: familyUser.familyId,
      status: { in: ['pending', 'approved'] },
    },
    orderBy: { requestedAt: 'desc' },
    select: {
      id: true,
      status: true,
      requestedAt: true,
      reason: true,
      contact: { select: { contactName: true } },
    },
  });
  const firstName = (session.user.name || session.user.email || '').split(
    ' '
  )[0];

  return (
    <div>
      <EmergencyBanner
        requests={emergencyRequests.map((r) => ({
          id: r.id,
          status: r.status,
          contactName: r.contact.contactName,
          requestedAt: r.requestedAt.toISOString(),
          reason: r.reason,
        }))}
      />
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Hi, {firstName} 👋
          </h2>
          <p className="mt-1 text-ink-soft">
            Everything your family needs, safe in one place.
          </p>
        </div>
        <div className="relative h-16 w-20 shrink-0" aria-hidden>
          <DoodleHeart className="anim-float absolute left-0 top-0 h-8 w-8" />
          <DoodleKey className="anim-float absolute right-0 top-4 h-7 w-7 [animation-delay:1.4s]" />
          <DoodleStar className="anim-float absolute bottom-0 left-5 h-6 w-6 [animation-delay:2.6s]" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map(({ href, label, icon: Icon, tile }, i) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-4 transition-colors hover:border-sand-strong">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tile}`}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink-soft">
                  {label}
                </span>
                <span className="block text-2xl font-extrabold text-ink">
                  {counts[i]}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-ink-faint" aria-hidden />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg font-extrabold text-ink">
            Quick actions
          </h3>
          <div className="space-y-2">
            {quickActions.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex min-h-12 items-center gap-2.5 rounded-xl bg-primary-soft px-4 font-bold text-primary-deep transition-colors hover:bg-primary hover:text-white"
              >
                <Plus className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Sparkles className="h-5 w-5 text-sun-deep" aria-hidden />
            Good habits
          </h3>
          <ul className="space-y-2.5">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-ink-soft">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sun" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
