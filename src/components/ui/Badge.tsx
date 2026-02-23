import React from 'react';
import clsx from 'clsx';
import type { Decision, ScorecardStatus } from '../../types';

type BadgeVariant = 'approve' | 'refer' | 'decline' | 'draft' | 'testing' | 'live' | 'archived' | 'member' | 'bureau' | 'openbanking' | 'neutral';

const VARIANTS: Record<BadgeVariant, string> = {
  approve: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  refer: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  decline: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  draft: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  testing: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  live: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  archived: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  member: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  bureau: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  openbanking: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const LABELS: Record<string, string> = {
  approve: 'Approve',
  refer: 'Refer',
  decline: 'Decline',
  draft: 'Draft',
  testing: 'Testing',
  live: 'Live',
  archived: 'Archived',
  member: 'Member',
  bureau: 'Bureau',
  openbanking: 'Open Banking',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ variant, label, size = 'sm', className }: BadgeProps) {
  const displayLabel = label ?? LABELS[variant] ?? variant;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-sm',
        VARIANTS[variant],
        className
      )}
    >
      {displayLabel}
    </span>
  );
}

export function DecisionBadge({
  decision,
  size = 'sm',
}: {
  decision: Decision;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <Badge variant={decision} size={size} />;
}

export function StatusBadge({ status }: { status: ScorecardStatus }) {
  return <Badge variant={status} />;
}

export function SourceBadge({ source }: { source: string }) {
  const variant = (source as BadgeVariant) in VARIANTS ? (source as BadgeVariant) : 'neutral';
  const label = source === 'openbanking' ? 'Open Banking' : source === 'member' ? 'Member Data' : 'Bureau';
  return <Badge variant={variant} label={label} />;
}
