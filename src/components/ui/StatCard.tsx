import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'approve' | 'refer' | 'decline';
  className?: string;
}

const VARIANT_STYLES = {
  default: {
    icon: 'bg-slate-100 text-slate-600',
    trend_up: 'text-emerald-600',
    trend_down: 'text-rose-600',
  },
  approve: {
    icon: 'bg-emerald-50 text-emerald-600',
    trend_up: 'text-emerald-600',
    trend_down: 'text-rose-600',
  },
  refer: {
    icon: 'bg-amber-50 text-amber-600',
    trend_up: 'text-emerald-600',
    trend_down: 'text-rose-600',
  },
  decline: {
    icon: 'bg-rose-50 text-rose-600',
    trend_up: 'text-emerald-600',
    trend_down: 'text-rose-600',
  },
};

export function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-start gap-4',
        className
      )}
    >
      {Icon && (
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', styles.icon)}>
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 leading-none">{value}</p>
        {(subValue || trend) && (
          <div className="flex items-center gap-2 mt-1.5">
            {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
            {trend && (
              <span
                className={clsx(
                  'text-xs font-medium',
                  trend.value >= 0 ? styles.trend_up : styles.trend_down
                )}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
