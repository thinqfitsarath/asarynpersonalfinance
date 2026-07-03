import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { getCurrentAppUser } from '@/lib/auth/current-user';
import { TabBar, DesktopNav, SignOutButton } from '@/components/TabBar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect('/signin');
  }
  if (!user.familyId) {
    redirect('/welcome');
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-20 border-b-2 border-sand bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
          <Link
            href="/dashboard"
            className="flex min-h-11 items-center gap-2 font-extrabold text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
              <LogoMark className="h-5 w-5" />
            </span>
            <span className="text-lg">Family Legacy</span>
          </Link>
          <div className="flex items-center gap-1">
            <DesktopNav />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:pb-10">
        {children}
      </main>

      <TabBar />
    </div>
  );
}
