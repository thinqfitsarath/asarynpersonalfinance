'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOCUMENT_CATEGORIES } from '@/lib/categories';
import { Card } from '@/components/ui/Card';
import { Input, fieldClasses } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Button, LinkButton } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils/cn';

const documentTypes = [
  'policy',
  'deed',
  'certificate',
  'statement',
  'contract',
  'other',
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category: 'investment',
    title: '',
    description: '',
    documentType: 'policy',
    provider: '',
    policyNumber: '',
    amount: '',
    premium: '',
    maturityDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        premium: formData.premium ? parseFloat(formData.premium) : undefined,
        maturityDate: formData.maturityDate ? new Date(formData.maturityDate) : undefined,
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
          setErrors({ submit: data.error || 'Failed to create document' });
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard/documents');
      router.refresh();
    } catch (err) {
      setErrors({ submit: 'An error occurred while creating the document' });
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Add a document"
        description="Track investments, insurance, and important papers"
        backHref="/dashboard/documents"
        backLabel="Documents"
      />

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && <Alert tone="error">{errors.submit}</Alert>}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                required
                value={formData.category}
                error={errors.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="documentType">Document type</Label>
              <Select
                id="documentType"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              required
              maxLength={200}
              value={formData.title}
              error={errors.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Life Insurance Policy"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              maxLength={1000}
              value={formData.description}
              error={errors.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the document"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="provider">Provider / Company</Label>
              <Input
                id="provider"
                type="text"
                maxLength={200}
                value={formData.provider}
                error={errors.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., State Farm, Vanguard"
              />
            </div>

            <div>
              <Label htmlFor="policyNumber">Policy / Reference number</Label>
              <Input
                id="policyNumber"
                type="text"
                maxLength={100}
                value={formData.policyNumber}
                error={errors.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                placeholder="Policy or account number"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount / Coverage</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold text-ink-faint">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={cn(fieldClasses, 'pl-8')}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1.5 text-sm font-semibold text-danger-deep">
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="premium">Premium / Monthly payment</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold text-ink-faint">
                  $
                </span>
                <input
                  id="premium"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.premium}
                  onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                  className={cn(fieldClasses, 'pl-8')}
                  placeholder="0.00"
                />
              </div>
              {errors.premium && (
                <p className="mt-1.5 text-sm font-semibold text-danger-deep">
                  {errors.premium}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="maturityDate">Maturity / Expiration date</Label>
            <Input
              id="maturityDate"
              type="date"
              value={formData.maturityDate}
              error={errors.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
              className="sm:max-w-xs"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <LinkButton
              href="/dashboard/documents"
              variant="secondary"
              className="sm:flex-1"
            >
              Cancel
            </LinkButton>
            <Button type="submit" loading={loading} className="sm:flex-1">
              {loading ? 'Saving…' : 'Save document'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
