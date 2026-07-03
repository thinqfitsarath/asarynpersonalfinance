'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DoodleKey, DoodleHeart } from '@/components/illustrations';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth collapses every sign-in failure into one error, so this
        // can be a wrong password OR the service being briefly unreachable.
        // Don't assert the credentials are wrong when we can't be sure.
        setError(
          "We couldn't sign you in. Double-check your email and password — if they're correct, the service may be briefly unavailable, so please try again in a moment."
        );
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred during login');
      setLoading(false);
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
            Welcome back
          </h1>
          <p className="text-ink-soft">Sign in to access your family vault</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ink-soft">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-bold text-primary-deep"
              >
                Sign up
              </Link>
            </p>
          </div>
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
