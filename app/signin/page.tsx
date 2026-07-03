'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DoodleKey, DoodleHeart } from '@/components/illustrations';

const CALLBACK_PATH = '/welcome';

export default function SignInPage() {
  const callbackURL =
    typeof window !== 'undefined'
      ? new URL(CALLBACK_PATH, window.location.origin).toString()
      : CALLBACK_PATH;
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setJoining(params.get('join') === '1');
  }, []);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const { error } = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL,
      });
      if (error) {
        setError(error.message || 'Could not send the link. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const continueWithGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL,
        newUserCallbackURL: callbackURL,
      });
      // Redirects to Google on success.
    } catch {
      setError('Could not start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="relative mb-8 text-center">
          <DoodleKey className="anim-float absolute -top-2 left-4 h-9 w-9 sm:left-10" />
          <DoodleHeart className="anim-float absolute right-4 top-6 h-8 w-8 [animation-delay:1.5s] sm:right-10" />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-white">
            <ShieldCheck className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mb-1 text-3xl font-extrabold text-ink">
            {sent ? 'Check your email' : 'Welcome'}
          </h1>
          <p className="text-ink-soft">
            {sent
              ? `We sent a sign-in link to ${email}`
              : 'Sign in to your family vault — no password needed'}
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
                <MailCheck className="h-8 w-8" aria-hidden />
              </div>
              <p className="text-ink-soft">
                Tap the link in that email to finish signing in. It expires
                shortly, and it&apos;s safe to close this tab.
              </p>
              <Button
                variant="ghost"
                className="mt-5"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              {joining && (
                <Alert tone="info" className="mb-5">
                  You&apos;re joining a family vault. Sign in and we&apos;ll add
                  you to it.
                </Alert>
              )}
              {error && (
                <Alert tone="error" className="mb-5">
                  {error}
                </Alert>
              )}

              <Button
                variant="secondary"
                className="w-full"
                loading={googleLoading}
                onClick={continueWithGoogle}
              >
                <GoogleGlyph />
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3 text-sm font-bold text-ink-faint">
                <span className="h-0.5 flex-1 rounded bg-sand" />
                or
                <span className="h-0.5 flex-1 rounded bg-sand" />
              </div>

              <form onSubmit={sendMagicLink} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" loading={sending}>
                  <Mail className="h-5 w-5" aria-hidden />
                  Email me a magic link
                </Button>
              </form>
            </>
          )}
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

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
