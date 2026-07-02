'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditPasswordPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category: 'bank',
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  useEffect(() => {
    fetchPassword();
  }, [params.id]);

  const fetchPassword = async () => {
    try {
      const response = await fetch(`/api/passwords/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch password');
      }

      const data = await response.json();
      setFormData({
        category: data.category,
        title: data.title,
        username: data.username || '',
        password: data.password,
        url: data.url || '',
        notes: data.notes || '',
      });
    } catch (err) {
      setErrors({ submit: 'Failed to load password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch(`/api/passwords/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.details) {
          const errorObj: Record<string, string> = {};
          data.details.forEach((err: any) => {
            errorObj[err.path[0]] = err.message;
          });
          setErrors(errorObj);
        } else {
          setErrors({ submit: data.error || 'Failed to update password' });
        }
        setSaving(false);
        return;
      }

      router.push('/dashboard/passwords');
      router.refresh();
    } catch (err) {
      setErrors({ submit: 'An error occurred while updating the password' });
      setSaving(false);
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading password...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/passwords"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← Back to passwords
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit Password</h1>
        <p className="mt-2 text-gray-600">
          Update your password information
        </p>
      </div>

      <div className="rounded-lg bg-white p-8 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="bank">Bank</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="laptop">Laptop</option>
              <option value="investment">Investment</option>
              <option value="google">Google</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title / Account Name *
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Chase Bank Checking"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username / Email
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="username or email"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="password"
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="whitespace-nowrap rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
              >
                Generate
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              maxLength={1000}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Additional notes or security questions"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.notes.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
            <Link
              href="/dashboard/passwords"
              className="flex-1 rounded-md bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
