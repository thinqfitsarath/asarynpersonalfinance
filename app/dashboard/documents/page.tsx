'use client';

import { useEffect, useState } from 'react';
import { FileText, Pencil, Trash2, Plus, Lock } from 'lucide-react';
import { documentCategory, DOCUMENT_CATEGORIES } from '@/lib/categories';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoading } from '@/components/ui/Spinner';
import { SpotDocs } from '@/components/illustrations';

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
  visibility?: string;
  user?: { id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
}

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
    return <PageLoading label="Loading documents…" />;
  }

  const details = (document: Document) =>
    [
      { label: 'Provider', value: document.provider },
      { label: 'Policy #', value: document.policyNumber },
      { label: 'Amount', value: formatCurrency(document.amount) },
      { label: 'Premium', value: formatCurrency(document.premium) },
      {
        label: 'Maturity',
        value: document.maturityDate
          ? new Date(document.maturityDate).toLocaleDateString()
          : null,
      },
    ].filter((d) => d.value);

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Investments, insurance, and other important papers"
        action={
          <LinkButton href="/dashboard/documents/new">
            <Plus className="h-5 w-5" aria-hidden />
            Add
          </LinkButton>
        }
      />

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-6 max-w-xs">
        <Label htmlFor="filter">Filter by category</Label>
        <Select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          art={SpotDocs}
          title="No documents yet"
          description="Get started by adding your first document."
          action={
            <LinkButton href="/dashboard/documents/new">
              <Plus className="h-5 w-5" aria-hidden />
              Add document
            </LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document, index) => {
            const category = documentCategory(document.category);
            const CategoryIcon = category.icon;

            return (
              <Card
                key={document.id}
                className="card-enter flex flex-col"
                style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
              >
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${category.tileClasses}`}
                  >
                    <CategoryIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-extrabold text-ink">
                      {document.title}
                    </h3>
                    {document.documentType && (
                      <p className="truncate text-sm text-ink-soft">
                        {document.documentType}
                      </p>
                    )}
                  </div>
                  <Badge className={category.badgeClasses}>
                    {category.label}
                  </Badge>
                </div>

                {document.description && (
                  <p className="mb-3 text-sm text-ink-soft line-clamp-2">
                    {document.description}
                  </p>
                )}

                {details(document).length > 0 && (
                  <dl className="mb-3 space-y-1.5 rounded-xl bg-cream-deep p-3 text-sm">
                    {details(document).map(({ label, value }) => (
                      <div key={label} className="flex justify-between gap-3">
                        <dt className="text-ink-faint">{label}</dt>
                        <dd className="text-right font-bold text-ink">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-auto flex flex-wrap gap-2">
                  <LinkButton
                    href={`/dashboard/documents/${document.id}/edit`}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </LinkButton>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-faint">
                  <span>
                    Updated {new Date(document.updatedAt).toLocaleDateString()}
                  </span>
                  {document.user?.name && (
                    <span>Added by {document.user.name}</span>
                  )}
                  {document.visibility === 'private' && (
                    <span className="inline-flex items-center gap-1 text-plum-deep">
                      <Lock className="h-3 w-3" aria-hidden />
                      Only me
                    </span>
                  )}
                  {document.visibility === 'adults' && (
                    <span className="text-sun-deep">Adults only</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
