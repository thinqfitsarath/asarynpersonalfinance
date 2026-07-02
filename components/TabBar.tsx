'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  House,
  KeyRound,
  FileText,
  HeartHandshake,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: House, exact: true },
  { href: '/dashboard/passwords', label: 'Passwords', icon: KeyRound },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/trusted-contacts', label: 'Contacts', icon: HeartHandshake },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

/** Fixed bottom tab bar — mobile only */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-sand bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold',
                active ? 'text-primary-deep' : 'text-ink-faint'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex h-8 w-14 items-center justify-center rounded-full',
                  active && 'bg-primary-soft'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Inline nav links — desktop only */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-1 sm:flex">
      {tabs.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-bold',
              active
                ? 'bg-primary-soft text-primary-deep'
                : 'text-ink-soft hover:bg-cream-deep'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-bold text-ink-soft hover:bg-cream-deep"
      aria-label="Sign out"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
