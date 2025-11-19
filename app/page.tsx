import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Family Legacy Manager
          </h1>
          <p className="text-xl text-gray-600">
            Securely manage passwords, documents, and ensure your family's financial legacy
          </p>
        </div>

        <div className="mb-12 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-3 text-3xl">🔐</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Password Vault
            </h3>
            <p className="text-sm text-gray-600">
              Store bank, email, and other passwords with military-grade encryption
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-3 text-3xl">📄</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Document Manager
            </h3>
            <p className="text-sm text-gray-600">
              Track insurance policies, investments, and important documents
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-3 text-3xl">👨‍👩‍👧‍👦</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Emergency Access
            </h3>
            <p className="text-sm text-gray-600">
              Grant trusted contacts access to your vault when needed
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/auth/register"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-indigo-700"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border-2 border-indigo-600 bg-white px-8 py-3 text-lg font-semibold text-indigo-600 shadow-lg transition-colors hover:bg-indigo-50"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 max-w-2xl rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Why Family Legacy Manager?
          </h3>
          <ul className="space-y-2 text-left text-sm text-gray-600">
            <li>✓ End-to-end encryption for all sensitive data</li>
            <li>✓ Comprehensive audit logs for security tracking</li>
            <li>✓ Time-delayed emergency access for trusted contacts</li>
            <li>✓ Easy organization by categories (bank, insurance, investments, etc.)</li>
            <li>✓ Secure way to transfer assets to your children when needed</li>
          </ul>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-600">
        <p>© 2025 Family Legacy Manager. Your security is our priority.</p>
      </footer>
    </div>
  );
}
