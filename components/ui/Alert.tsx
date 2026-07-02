import { CircleAlert, Info, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Tone = 'error' | 'info' | 'success';

const tones: Record<Tone, { classes: string; icon: typeof Info }> = {
  error: { classes: 'bg-danger-soft text-danger-deep', icon: CircleAlert },
  info: { classes: 'bg-sky-soft text-sky-deep', icon: Info },
  success: { classes: 'bg-leaf-soft text-leaf-deep', icon: CircleCheck },
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
}

export function Alert({ tone = 'info', className, children, ...props }: AlertProps) {
  const { classes, icon: Icon } = tones[tone];
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl p-4 text-sm font-semibold',
        classes,
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
