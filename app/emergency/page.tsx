'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LifeBuoy, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function EmergencyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'info' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/emergency/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, reason: reason || undefined }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ tone: 'error', text: data.error || 'That code is not valid.' });
        return;
      }

      if (data.redirect) {
        setMessage({ tone: 'success', text: data.message });
        router.push(data.redirect);
        return;
      }

      setMessage({
        tone: data.status === 'approved' ? 'success' : 'info',
        text: data.message,
      });
    } catch {
      setMessage({ tone: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-coral text-white">
            <LifeBuoy className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mb-1 text-3xl font-extrabold text-ink">
            Emergency access
          </h1>
          <p className="text-ink-soft">
            If you were given a recovery code by a family member, enter it
            here.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {message && <Alert tone={message.tone}>{message.text}</Alert>}

            <div>
              <Label htmlFor="code">Recovery code</Label>
              <Input
                id="code"
                type="text"
                required
                autoCapitalize="characters"
                autoComplete="off"
                placeholder="XXXX-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center font-mono tracking-widest"
              />
            </div>

            <div>
              <Label htmlFor="reason">Why do you need access? (optional)</Label>
              <Textarea
                id="reason"
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="This is shown to the family so they understand the request."
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Checking…' : 'Submit'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-faint">
            The first use starts a waiting period during which the family
            can decline. You&apos;ll be asked to enter the code again once
            it elapses.
          </p>
        </Card>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 font-bold text-ink-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
