import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  /** Illustration component (e.g. from components/illustrations) — takes precedence over icon */
  art?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  art: Art,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-sand-strong bg-surface px-6 py-12 text-center">
      {Art ? (
        <Art className="anim-float-slow mx-auto mb-4 h-28 w-28" />
      ) : (
        Icon && (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
            <Icon className="h-8 w-8" aria-hidden />
          </div>
        )
      )}
      <h3 className="text-lg font-extrabold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-ink-soft">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
