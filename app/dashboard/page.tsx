import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound,
  FileText,
  HeartHandshake,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { readableWhere, type FamilyRole } from '@/lib/family';
import { Card } from '@/components/ui/Card';

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

  const familyUser = {
    id: session.user.id,
    familyId: session.user.familyId,
    role: session.user.role as FamilyRole,
  };

  const [passwordCount, documentCount, contactCount] = await Promise.all([
    prisma.password.count({ where: readableWhere(familyUser) }),
    prisma.document.count({ where: readableWhere(familyUser) }),
    prisma.trustedContact.count({ where: { familyId: familyUser.familyId } }),
  ]);

  const counts = [passwordCount, documentCount, contactCount];
  const firstName = (session.user.name || session.user.email || '').split(
    ' '
  )[0];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Hi, {firstName} 👋
        </h2>
        <p className="mt-1 text-ink-soft">
          Everything your family needs, safe in one place.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
