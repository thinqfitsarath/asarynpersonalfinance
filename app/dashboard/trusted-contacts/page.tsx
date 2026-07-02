'use client';

import { useEffect, useState } from 'react';
import {
  HeartHandshake,
  Pencil,
  Trash2,
  Plus,
  Pause,
  Play,
  LifeBuoy,
  Copy,
  Check,
} from 'lucide-react';
import { accessLevel } from '@/lib/categories';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoading } from '@/components/ui/Spinner';

interface TrustedContact {
  id: string;
  contactName: string;
  contactEmail: string;
  relationship: string;
  accessLevel: string;
  delayDays: number;
  isActive: boolean;
  user?: { id: string; name: string | null };
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

export default function TrustedContactsPage() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<Record<string, string>>({});
  const [generatingCode, setGeneratingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const generateRecoveryCode = async (id: string) => {
    if (
      !confirm(
        'Generate a one-time emergency recovery code for this contact? Any previous code stops working.'
      )
    ) {
      return;
    }
    setGeneratingCode(id);
    try {
      const response = await fetch(`/api/trusted-contacts/${id}/recovery-code`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRecoveryCodes((prev) => ({ ...prev, [id]: data.code }));
    } catch {
      alert('Failed to generate recovery code');
    } finally {
      setGeneratingCode(null);
    }
  };

  const copyRecoveryCode = async (id: string) => {
    await navigator.clipboard.writeText(recoveryCodes[id]);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return <PageLoading label="Loading trusted contacts…" />;
  }

  return (
    <div>
      <PageHeader
        title="Trusted Contacts"
        description="Who can reach your vault in an emergency"
        action={
          <LinkButton href="/dashboard/trusted-contacts/new">
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

      <Alert tone="info" className="mb-6">
        Trusted contacts can request emergency access to your vault. After the
        delay period you set, they get access unless you deny the request — so
        your family can always reach what matters.
      </Alert>

      {contacts.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No trusted contacts yet"
          description="Add a family member or trusted person for emergency access."
          action={
            <LinkButton href="/dashboard/trusted-contacts/new">
              <Plus className="h-5 w-5" aria-hidden />
              Add contact
            </LinkButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => {
            const level = accessLevel(contact.accessLevel);
            const LevelIcon = level.icon;

            return (
              <Card
                key={contact.id}
                className={!contact.isActive ? 'opacity-60' : undefined}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${level.tileClasses}`}
                  >
                    <LevelIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-ink">
                        {contact.contactName}
                      </h3>
                      <Badge className={level.badgeClasses}>{level.label}</Badge>
                      {!contact.isActive && (
                        <Badge className="bg-cream-deep text-ink-soft">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-ink-soft">
                      {contact.contactEmail}
                    </p>
                  </div>
                </div>

                <dl className="mt-3 grid gap-x-4 gap-y-1.5 rounded-xl bg-cream-deep p-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-3 sm:justify-start">
                    <dt className="text-ink-faint">Relationship</dt>
                    <dd className="font-bold text-ink">
                      {relationshipLabels[contact.relationship] ||
                        contact.relationship}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 sm:justify-start">
                    <dt className="text-ink-faint">Access delay</dt>
                    <dd className="font-bold text-ink">
                      {contact.delayDays}{' '}
                      {contact.delayDays === 1 ? 'day' : 'days'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <LinkButton
                    href={`/dashboard/trusted-contacts/${contact.id}/edit`}
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </LinkButton>
                  <Button
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleToggleActive(contact.id)}
                  >
                    {contact.isActive ? (
                      <>
                        <Pause className="h-4 w-4" aria-hidden />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" aria-hidden />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                    loading={generatingCode === contact.id}
                    onClick={() => generateRecoveryCode(contact.id)}
                  >
                    <LifeBuoy className="h-4 w-4" aria-hidden />
                    Recovery code
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remove
                  </Button>
                </div>

                {recoveryCodes[contact.id] && (
                  <div className="mt-3 rounded-xl bg-sun-soft p-4">
                    <p className="mb-2 text-sm font-bold text-sun-deep">
                      One-time recovery code — hand it to {contact.contactName}{' '}
                      securely. It won&apos;t be shown again:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="min-h-11 flex-1 content-center rounded-xl bg-surface px-3 py-2 text-center font-mono text-base font-bold tracking-wider text-ink">
                        {recoveryCodes[contact.id]}
                      </code>
                      <button
                        onClick={() => copyRecoveryCode(contact.id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-primary-deep"
                        aria-label="Copy recovery code"
                      >
                        {copiedCode === contact.id ? (
                          <Check className="h-5 w-5 text-leaf-deep" aria-hidden />
                        ) : (
                          <Copy className="h-5 w-5" aria-hidden />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-ink-soft">
                      They can use it at {typeof window !== 'undefined' ? window.location.origin : ''}/emergency if
                      something happens to you.
                    </p>
                  </div>
                )}

                <div className="mt-3 text-xs font-semibold text-ink-faint">
                  Added {new Date(contact.createdAt).toLocaleDateString()}
                  {contact.user?.name ? ` by ${contact.user.name}` : ''}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
