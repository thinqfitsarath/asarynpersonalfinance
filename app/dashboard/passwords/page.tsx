'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Password {
  id: string;
  category: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryColors: Record<string, string> = {
  bank: 'bg-green-100 text-green-800',
  email: 'bg-blue-100 text-blue-800',
  phone: 'bg-purple-100 text-purple-800',
  laptop: 'bg-gray-100 text-gray-800',
  investment: 'bg-yellow-100 text-yellow-800',
  google: 'bg-red-100 text-red-800',
  other: 'bg-indigo-100 text-indigo-800',
};

export default function PasswordsPage() {
  const router = useRouter();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [showPassword, setShowPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchPasswords();
  }, [filter]);

  const fetchPasswords = async () => {
    try {
      const url = filter
        ? `/api/passwords?category=${filter}`
        : '/api/passwords';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch passwords');
      }

      const data = await response.json();
      setPasswords(data);
    } catch (err) {
      setError('Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) {
      return;
    }

    try {
      const response = await fetch(`/api/passwords/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete password');
      }

      setPasswords(passwords.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete password');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(showPassword === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading passwords...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Password Vault</h1>
          <p className="mt-2 text-gray-600">
            Securely manage all your passwords in one place
          </p>
        </div>
        <Link
          href="/dashboard/passwords/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add Password
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
          Filter by category
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
        >
          <option value="">All categories</option>
          <option value="bank">Bank</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="laptop">Laptop</option>
          <option value="investment">Investment</option>
          <option value="google">Google</option>
          <option value="other">Other</option>
        </select>
      </div>

      {passwords.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No passwords</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new password entry.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/passwords/new"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Password
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passwords.map((password) => (
            <div
              key={password.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        categoryColors[password.category] || categoryColors.other
                      }`}
                    >
                      {password.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {password.title}
                  </h3>
                  {password.username && (
                    <p className="mt-1 text-sm text-gray-600">{password.username}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500">
                    Password
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 px-2 py-1 text-sm font-mono">
                      {showPassword === password.id
                        ? password.password
                        : '••••••••••••'}
                    </code>
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      {showPassword === password.id ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {password.url && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      URL
                    </label>
                    <a
                      href={password.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      {password.url}
                    </a>
                  </div>
                )}

                {password.notes && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-600">{password.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/passwords/${password.id}/edit`}
                  className="flex-1 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(password.id)}
                  className="flex-1 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Updated {new Date(password.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
