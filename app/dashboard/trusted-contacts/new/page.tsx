'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Button, LinkButton } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';

const relationships = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'executor', label: 'Executor' },
  { value: 'trusted_friend', label: 'Trusted Friend' },
  { value: 'other', label: 'Other' },
];

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
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Add a trusted contact"
        description="Someone who can reach your vault in an emergency"
        backHref="/dashboard/trusted-contacts"
        backLabel="Trusted contacts"
      />

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && <Alert tone="error">{errors.submit}</Alert>}

          <div>
            <Label htmlFor="contactName">Contact name *</Label>
            <Input
              id="contactName"
              type="text"
              required
              maxLength={200}
              value={formData.contactName}
              error={errors.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div>
            <Label htmlFor="contactEmail">Email address *</Label>
            <Input
              id="contactEmail"
              type="email"
              required
              value={formData.contactEmail}
              error={errors.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <Label htmlFor="relationship">Relationship *</Label>
            <Select
              id="relationship"
              required
              value={formData.relationship}
              error={errors.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            >
              {relationships.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="accessLevel">Access level *</Label>
            <Select
              id="accessLevel"
              required
              value={formData.accessLevel}
              error={errors.accessLevel}
              onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
            >
              <option value="emergency-only">Emergency Only (Recommended)</option>
              <option value="view-only">View Only</option>
              <option value="full">Full Access</option>
            </Select>
            <div className="mt-2 space-y-1 text-sm text-ink-faint">
              <p>
                <strong className="text-ink-soft">Emergency only:</strong>{' '}
                access only during emergencies, with a time delay
              </p>
              <p>
                <strong className="text-ink-soft">View only:</strong> can view
                but not modify your information
              </p>
              <p>
                <strong className="text-ink-soft">Full access:</strong> can
                view and manage all information
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="delayDays">Access delay (days) *</Label>
            <Input
              id="delayDays"
              type="number"
              required
              min={0}
              max={365}
              value={formData.delayDays}
              error={errors.delayDays}
              onChange={(e) =>
                setFormData({ ...formData, delayDays: parseInt(e.target.value) })
              }
              className="sm:max-w-xs"
            />
            <p className="mt-2 text-sm text-ink-faint">
              Days before emergency access is granted after a request. You will
              be notified and can deny it during this period. Recommended: 7
              days.
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-sun-soft p-4 text-sm font-semibold text-sun-deep">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              Only add people you completely trust. They will be able to
              request access to your sensitive information in an emergency.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <LinkButton
              href="/dashboard/trusted-contacts"
              variant="secondary"
              className="sm:flex-1"
            >
              Cancel
            </LinkButton>
            <Button type="submit" loading={loading} className="sm:flex-1">
              {loading ? 'Saving…' : 'Add contact'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
