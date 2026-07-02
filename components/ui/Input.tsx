import { cn } from '@/lib/utils/cn';

export const fieldClasses =
  'block w-full min-h-12 rounded-xl border-2 border-sand bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <>
      <input
        className={cn(fieldClasses, error && 'border-danger', className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm font-semibold text-danger-deep">{error}</p>}
    </>
  );
}
