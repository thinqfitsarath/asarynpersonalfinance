import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch counts for dashboard overview
  const [passwordCount, documentCount, contactCount] = await Promise.all([
    prisma.password.count({ where: { userId: session.user.id } }),
    prisma.document.count({ where: { userId: session.user.id } }),
    prisma.trustedContact.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Family Legacy Manager
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                {session.user.name || session.user.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your passwords, documents, and trusted contacts
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passwords</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {passwordCount}
                </p>
              </div>
              <div className="text-4xl">🔐</div>
            </div>
            <Link
              href="/dashboard/passwords"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all →
            </Link>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {documentCount}
                </p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
            <Link
              href="/dashboard/documents"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all →
            </Link>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Trusted Contacts
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {contactCount}
                </p>
              </div>
              <div className="text-4xl">👨‍👩‍👧‍👦</div>
            </div>
            <Link
              href="/dashboard/trusted-contacts"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Manage →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/passwords/new"
                className="block rounded-md bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                + Add New Password
              </Link>
              <Link
                href="/dashboard/documents/new"
                className="block rounded-md bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                + Add New Document
              </Link>
              <Link
                href="/dashboard/trusted-contacts/new"
                className="block rounded-md bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                + Add Trusted Contact
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Security Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Use strong, unique passwords for each account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Regularly update important document information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Keep your trusted contacts list up to date</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Review audit logs periodically for suspicious activity</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
