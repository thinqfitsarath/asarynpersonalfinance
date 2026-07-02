'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2 } from 'lucide-react';
import { PASSWORD_CATEGORIES } from '@/lib/categories';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Button, LinkButton } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NewPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category: 'bank',
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/passwords', {
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
          setErrors({ submit: data.error || 'Failed to create password' });
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard/passwords');
      router.refresh();
    } catch (err) {
      setErrors({ submit: 'An error occurred while creating the password' });
      setLoading(false);
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

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Add a password"
        description="Stored securely with encryption"
        backHref="/dashboard/passwords"
        backLabel="Passwords"
      />

      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && <Alert tone="error">{errors.submit}</Alert>}

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              required
              value={formData.category}
              error={errors.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {Object.entries(PASSWORD_CATEGORIES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title / Account name *</Label>
            <Input
              id="title"
              type="text"
              required
              maxLength={200}
              value={formData.title}
              error={errors.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Chase Bank Checking"
            />
          </div>

          <div>
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              error={errors.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username or email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="password"
                  type="text"
                  required
                  value={formData.password}
                  error={errors.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={generatePassword}
                className="shrink-0 self-start"
              >
                <Wand2 className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Generate</span>
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              error={errors.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              maxLength={1000}
              value={formData.notes}
              error={errors.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or security questions"
            />
            <p className="mt-1.5 text-xs text-ink-faint">
              {formData.notes.length}/1000 characters
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <LinkButton
              href="/dashboard/passwords"
              variant="secondary"
              className="sm:flex-1"
            >
              Cancel
            </LinkButton>
            <Button type="submit" loading={loading} className="sm:flex-1">
              {loading ? 'Saving…' : 'Save password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
