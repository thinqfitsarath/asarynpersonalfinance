'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Copy,
  Check,
  KeyRound,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { passwordCategory, PASSWORD_CATEGORIES } from '@/lib/categories';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoading } from '@/components/ui/Spinner';
import { SpotKeys } from '@/components/illustrations';

interface Password {
  id: string;
  category: string;
  title: string;
  username?: string;
  url?: string;
  notes?: string;
  visibility?: string;
  user?: { id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
}

export default function PasswordsPage() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [revealingPassword, setRevealingPassword] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const revealPassword = async (id: string): Promise<string | null> => {
    if (revealedPasswords[id]) return revealedPasswords[id];

    const response = await fetch(`/api/passwords/${id}/reveal`);
    if (!response.ok) return null;

    const data = await response.json();
    setRevealedPasswords((prev) => ({ ...prev, [id]: data.password }));
    return data.password;
  };

  const togglePasswordVisibility = async (id: string) => {
    // If already revealed, hide it
    if (revealedPasswords[id]) {
      const newRevealed = { ...revealedPasswords };
      delete newRevealed[id];
      setRevealedPasswords(newRevealed);
      return;
    }

    setRevealingPassword(id);
    try {
      const password = await revealPassword(id);
      if (password === null) throw new Error('Failed to reveal password');
    } catch (err) {
      alert('Failed to reveal password');
    } finally {
      setRevealingPassword(null);
    }
  };

  const copyPassword = async (id: string) => {
    setRevealingPassword(id);
    try {
      const password = await revealPassword(id);
      if (password === null) throw new Error('Failed to fetch password');
      await navigator.clipboard.writeText(password);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      alert('Failed to copy password');
    } finally {
      setRevealingPassword(null);
    }
  };

  if (loading) {
    return <PageLoading label="Loading passwords…" />;
  }

  return (
    <div>
      <PageHeader
        title="Passwords"
        description="All your family's logins, safe in one place"
        action={
          <LinkButton href="/dashboard/passwords/new">
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
          {Object.entries(PASSWORD_CATEGORIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {passwords.length === 0 ? (
        <EmptyState
          art={SpotKeys}
          title="No passwords yet"
          description="Get started by adding your first password."
          action={
            <LinkButton href="/dashboard/passwords/new">
              <Plus className="h-5 w-5" aria-hidden />
              Add password
            </LinkButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {passwords.map((password, index) => {
            const category = passwordCategory(password.category);
            const CategoryIcon = category.icon;
            const revealed = revealedPasswords[password.id];
            const busy = revealingPassword === password.id;

            return (
              <Card
                key={password.id}
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
                      {password.title}
                    </h3>
                    {password.username && (
                      <p className="truncate text-sm text-ink-soft">
                        {password.username}
                      </p>
                    )}
                  </div>
                  <Badge className={category.badgeClasses}>
                    {category.label}
                  </Badge>
                </div>

                <div className="mb-3 space-y-3">
                  <div>
                    <span className="mb-1 block text-xs font-bold text-ink-faint">
                      Password
                    </span>
                    <div className="flex items-center gap-1.5">
                      <code className="min-h-11 flex-1 content-center break-all rounded-xl bg-cream-deep px-3 py-2 font-mono text-sm text-ink">
                        {revealed || '••••••••••••'}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(password.id)}
                        disabled={busy}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep disabled:opacity-50"
                        aria-label={revealed ? 'Hide password' : 'Show password'}
                      >
                        {busy ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        ) : revealed ? (
                          <EyeOff className="h-5 w-5" aria-hidden />
                        ) : (
                          <Eye className="h-5 w-5" aria-hidden />
                        )}
                      </button>
                      <button
                        onClick={() => copyPassword(password.id)}
                        disabled={busy}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep disabled:opacity-50"
                        aria-label="Copy password"
                      >
                        {copiedId === password.id ? (
                          <Check className="pop-in h-5 w-5 text-leaf-deep" aria-hidden />
                        ) : (
                          <Copy className="h-5 w-5" aria-hidden />
                        )}
                      </button>
                    </div>
                  </div>

                  {password.url && (
                    <div>
                      <span className="mb-1 block text-xs font-bold text-ink-faint">
                        Website
                      </span>
                      <a
                        href={password.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-1.5 font-bold text-primary-deep"
                      >
                        <span className="truncate">{password.url}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                      </a>
                    </div>
                  )}

                  {password.notes && (
                    <div>
                      <span className="mb-1 block text-xs font-bold text-ink-faint">
                        Notes
                      </span>
                      <p className="text-sm text-ink-soft">{password.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <LinkButton
                    href={`/dashboard/passwords/${password.id}/edit`}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </LinkButton>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(password.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-faint">
                  <span>
                    Updated {new Date(password.updatedAt).toLocaleDateString()}
                  </span>
                  {password.user?.name && (
                    <span>Added by {password.user.name}</span>
                  )}
                  {password.visibility === 'private' && (
                    <span className="inline-flex items-center gap-1 text-plum-deep">
                      <Lock className="h-3 w-3" aria-hidden />
                      Only me
                    </span>
                  )}
                  {password.visibility === 'adults' && (
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
