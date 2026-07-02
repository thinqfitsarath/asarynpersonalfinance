import { cn } from '@/lib/utils/cn';
import { fieldClasses } from './Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <>
      <textarea
        className={cn(fieldClasses, error && 'border-danger', className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm font-semibold text-danger-deep">{error}</p>}
    </>
  );
}
