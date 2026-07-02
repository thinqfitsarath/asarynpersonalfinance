import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = 'Back',
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex min-h-11 items-center gap-1.5 font-bold text-primary-deep"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-ink-soft">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
