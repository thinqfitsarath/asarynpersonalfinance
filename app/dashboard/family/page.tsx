'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Crown,
  Baby,
  User as UserIcon,
  Ticket,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageLoading } from '@/components/ui/Spinner';

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

interface Invite {
  id: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

const roleStyles: Record<string, { label: string; icon: typeof UserIcon; badge: string }> = {
  OWNER: { label: 'Owner', icon: Crown, badge: 'bg-sun-soft text-sun-deep' },
  ADULT: { label: 'Adult', icon: UserIcon, badge: 'bg-primary-soft text-primary-deep' },
  CHILD: { label: 'Child', icon: Baby, badge: 'bg-plum-soft text-plum-deep' },
};

export default function FamilyPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteRole, setInviteRole] = useState('ADULT');
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      const response = await fetch('/api/family');
      if (!response.ok) throw new Error('Failed to fetch family');
      const data = await response.json();
      setMembers(data.members);
      setInvites(data.invites);
    } catch (err) {
      setError('Failed to load your family');
    } finally {
      setLoading(false);
    }
  };

  const createInvite = async () => {
    setCreating(true);
    setNewCode(null);
    try {
      const response = await fetch('/api/family/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: inviteRole }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invite');
      }
      const data = await response.json();
      setNewCode(data.code);
      fetchFamily();
    } catch (err: any) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  const revokeInvite = async (id: string) => {
    try {
      const response = await fetch(`/api/family/invites/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      setInvites(invites.filter((i) => i.id !== id));
    } catch {
      alert('Failed to revoke invite');
    }
  };

  const copyToClipboard = async (value: string, kind: 'code' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const inviteLink = newCode
    ? `${window.location.origin}/auth/register?invite=${newCode}`
    : '';

  if (loading) {
    return <PageLoading label="Loading your family…" />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Your Family"
        description="Everyone who shares this vault"
      />

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Members */}
      <div className="space-y-3">
        {members.map((member) => {
          const style = roleStyles[member.role] || roleStyles.ADULT;
          const RoleIcon = style.icon;
          return (
            <Card key={member.id} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
                <RoleIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold text-ink">
                  {member.name || member.email}
                </p>
                <p className="truncate text-sm text-ink-soft">{member.email}</p>
              </div>
              <Badge className={style.badge}>{style.label}</Badge>
            </Card>
          );
        })}
      </div>

      {/* Invite */}
      <Card className="mt-6">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
          <UserPlus className="h-5 w-5 text-primary-deep" aria-hidden />
          Invite a family member
        </h3>
        <p className="mb-4 text-sm text-ink-soft">
          Share the code over iMessage or WhatsApp. It works once and
          expires in 48 hours.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="inviteRole">Their role</Label>
            <Select
              id="inviteRole"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="ADULT">Adult — sees and manages everything</option>
              <option value="CHILD">Child — sees family items only</option>
            </Select>
          </div>
          <Button onClick={createInvite} loading={creating} className="shrink-0">
            <Ticket className="h-5 w-5" aria-hidden />
            Create invite
          </Button>
        </div>

        {newCode && (
          <div className="mt-4 rounded-xl bg-primary-soft p-4">
            <p className="mb-2 text-sm font-bold text-primary-deep">
              Here&apos;s the invite — copy it now, it won&apos;t be shown
              again:
            </p>
            <div className="flex items-center gap-2">
              <code className="min-h-11 flex-1 content-center rounded-xl bg-surface px-3 py-2 text-center font-mono text-lg font-bold tracking-wider text-ink">
                {newCode}
              </code>
              <button
                onClick={() => copyToClipboard(newCode, 'code')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-primary-deep"
                aria-label="Copy invite code"
              >
                {copied === 'code' ? (
                  <Check className="h-5 w-5 text-leaf-deep" aria-hidden />
                ) : (
                  <Copy className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => copyToClipboard(inviteLink, 'link')}
            >
              {copied === 'link' ? (
                <>
                  <Check className="h-4 w-4 text-leaf-deep" aria-hidden />
                  Link copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  Copy registration link
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Pending invites */}
      {invites.length > 0 && (
        <Card className="mt-4">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Users className="h-5 w-5 text-primary-deep" aria-hidden />
            Pending invites
          </h3>
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-cream-deep px-4 py-3"
              >
                <span className="text-sm font-bold text-ink-soft">
                  {roleStyles[invite.role]?.label || invite.role} invite ·
                  expires {new Date(invite.expiresAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => revokeInvite(invite.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-danger-deep hover:bg-danger-soft"
                  aria-label="Revoke invite"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
