import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-6 w-6 animate-spin text-primary', className)}
      aria-hidden
    />
  );
}

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Spinner className="h-8 w-8" />
      <p className="font-semibold text-ink-soft">{label}</p>
    </div>
  );
}
