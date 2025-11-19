'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TrustedContact {
  id: string;
  contactName: string;
  contactEmail: string;
  relationship: string;
  accessLevel: string;
  delayDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const relationshipLabels: Record<string, string> = {
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  sibling: 'Sibling',
  lawyer: 'Lawyer',
  executor: 'Executor',
  trusted_friend: 'Trusted Friend',
  other: 'Other',
};

const accessLevelColors: Record<string, string> = {
  full: 'bg-red-100 text-red-800',
  'view-only': 'bg-yellow-100 text-yellow-800',
  'emergency-only': 'bg-green-100 text-green-800',
};

export default function TrustedContactsPage() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/trusted-contacts');

      if (!response.ok) {
        throw new Error('Failed to fetch trusted contacts');
      }

      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError('Failed to load trusted contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/trusted-contacts/${id}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle contact status');
      }

      const updatedContact = await response.json();
      setContacts(
        contacts.map((c) => (c.id === id ? updatedContact : c))
      );
    } catch (err) {
      alert('Failed to update contact status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this trusted contact?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trusted-contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(contacts.filter((c) => c.id !== id));
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading trusted contacts...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trusted Contacts</h1>
          <p className="mt-2 text-gray-600">
            Manage emergency access for family members and trusted individuals
          </p>
        </div>
        <Link
          href="/dashboard/trusted-contacts/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add Contact
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Emergency Access System
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Trusted contacts can request emergency access to your vault. After the
                configured delay period, they will be granted access unless you deny the
                request. This ensures your family can access important information when needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {contacts.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trusted contacts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a trusted contact for emergency access.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/trusted-contacts/new"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Contact
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`rounded-lg border bg-white p-6 shadow-sm ${
                !contact.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {contact.contactName}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        accessLevelColors[contact.accessLevel] ||
                        accessLevelColors['view-only']
                      }`}
                    >
                      {contact.accessLevel}
                    </span>
                    {!contact.isActive && (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{contact.contactEmail}</p>
                  <div className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700">Relationship:</span>{' '}
                      <span className="text-gray-900">
                        {relationshipLabels[contact.relationship] || contact.relationship}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Access Delay:</span>{' '}
                      <span className="text-gray-900">
                        {contact.delayDays} {contact.delayDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/trusted-contacts/${contact.id}/edit`}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleToggleActive(contact.id)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                    contact.isActive
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {contact.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Added {new Date(contact.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
