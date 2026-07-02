'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Siren, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmergencyRequest {
  id: string;
  status: string;
  contactName: string;
  requestedAt: string;
  reason: string | null;
}

export function EmergencyBanner({ requests }: { requests: EmergencyRequest[] }) {
  const router = useRouter();
  const [denying, setDenying] = useState<string | null>(null);

  if (requests.length === 0) return null;

  const deny = async (id: string) => {
    if (!confirm('Deny this emergency access request?')) return;
    setDenying(id);
    try {
      const response = await fetch(`/api/emergency-access/${id}/deny`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      alert('Failed to deny the request');
    } finally {
      setDenying(null);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-danger bg-danger-soft p-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-danger text-white">
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-danger-deep">
              {request.contactName} has{' '}
              {request.status === 'approved' ? 'been granted' : 'requested'}{' '}
              emergency vault access
            </p>
            <p className="text-sm text-ink-soft">
              {new Date(request.requestedAt).toLocaleString()}
              {request.reason ? ` — “${request.reason}”` : ''}
            </p>
          </div>
          <Button
            variant="destructive"
            loading={denying === request.id}
            onClick={() => deny(request.id)}
            className="shrink-0 bg-danger text-white hover:bg-danger-deep"
          >
            <ShieldX className="h-4 w-4" aria-hidden />
            Deny
          </Button>
        </div>
      ))}
    </div>
  );
}
