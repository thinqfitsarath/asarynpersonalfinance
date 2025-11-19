'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTrustedContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    relationship: 'spouse',
    accessLevel: 'emergency-only',
    delayDays: 7,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/trusted-contacts', {
        method: 'POST',
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
          setErrors({ submit: data.error || 'Failed to create trusted contact' });
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard/trusted-contacts');
      router.refresh();
    } catch (err) {
      setErrors({ submit: 'An error occurred while creating the trusted contact' });
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/trusted-contacts"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          ← Back to trusted contacts
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Add Trusted Contact</h1>
        <p className="mt-2 text-gray-600">
          Designate a family member or trusted individual for emergency access
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
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
              Contact Name *
            </label>
            <input
              id="contactName"
              type="text"
              required
              maxLength={200}
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Full name"
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              id="contactEmail"
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="contact@example.com"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
              Relationship *
            </label>
            <select
              id="relationship"
              required
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="lawyer">Lawyer</option>
              <option value="executor">Executor</option>
              <option value="trusted_friend">Trusted Friend</option>
              <option value="other">Other</option>
            </select>
            {errors.relationship && (
              <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
            )}
          </div>

          <div>
            <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700">
              Access Level *
            </label>
            <select
              id="accessLevel"
              required
              value={formData.accessLevel}
              onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="emergency-only">Emergency Only (Recommended)</option>
              <option value="view-only">View Only</option>
              <option value="full">Full Access</option>
            </select>
            {errors.accessLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.accessLevel}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              <strong>Emergency Only:</strong> Access only during emergencies with time delay
              <br />
              <strong>View Only:</strong> Can view but not modify your information
              <br />
              <strong>Full Access:</strong> Can view and manage all information
            </p>
          </div>

          <div>
            <label htmlFor="delayDays" className="block text-sm font-medium text-gray-700">
              Access Delay (Days) *
            </label>
            <input
              id="delayDays"
              type="number"
              required
              min="0"
              max="365"
              value={formData.delayDays}
              onChange={(e) =>
                setFormData({ ...formData, delayDays: parseInt(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs"
            />
            {errors.delayDays && (
              <p className="mt-1 text-sm text-red-600">{errors.delayDays}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Number of days before emergency access is granted after a request. You will be
              notified and can deny the request during this period. Recommended: 7 days.
            </p>
          </div>

          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Only add people you completely trust. They will be able to request access
                    to your sensitive information in case of an emergency. Always verify their
                    identity before granting access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Trusted Contact'}
            </button>
            <Link
              href="/dashboard/trusted-contacts"
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
