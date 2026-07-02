import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { fieldClasses } from './Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <>
      <div className="relative">
        <select
          className={cn(
            fieldClasses,
            'appearance-none pr-10',
            error && 'border-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
      </div>
      {error && <p className="mt-1.5 text-sm font-semibold text-danger-deep">{error}</p>}
    </>
  );
}
