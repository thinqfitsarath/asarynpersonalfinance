'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  category: string;
  title: string;
  description?: string;
  documentType?: string;
  provider?: string;
  policyNumber?: string;
  amount?: number;
  premium?: number;
  maturityDate?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryColors: Record<string, string> = {
  investment: 'bg-green-100 text-green-800',
  insurance: 'bg-blue-100 text-blue-800',
  house: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const url = filter
        ? `/api/documents?category=${filter}`
        : '/api/documents';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading documents...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Manager</h1>
          <p className="mt-2 text-gray-600">
            Track investments, insurance policies, and important documents
          </p>
        </div>
        <Link
          href="/dashboard/documents/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add Document
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
          <option value="investment">Investment</option>
          <option value="insurance">Insurance</option>
          <option value="house">House</option>
          <option value="other">Other</option>
        </select>
      </div>

      {documents.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new document.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/documents/new"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Document
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      categoryColors[document.category] || categoryColors.other
                    }`}
                  >
                    {document.category}
                  </span>
                  {document.documentType && (
                    <span className="text-xs text-gray-500">
                      {document.documentType}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {document.title}
                </h3>
                {document.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {document.description}
                  </p>
                )}
              </div>

              <div className="mb-4 space-y-2 text-sm">
                {document.provider && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Provider:</span>
                    <span className="font-medium text-gray-900">{document.provider}</span>
                  </div>
                )}
                {document.policyNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Policy #:</span>
                    <span className="font-medium text-gray-900">{document.policyNumber}</span>
                  </div>
                )}
                {document.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(document.amount)}
                    </span>
                  </div>
                )}
                {document.premium && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Premium:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(document.premium)}
                    </span>
                  </div>
                )}
                {document.maturityDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Maturity:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(document.maturityDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/documents/${document.id}/edit`}
                  className="flex-1 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(document.id)}
                  className="flex-1 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Updated {new Date(document.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
