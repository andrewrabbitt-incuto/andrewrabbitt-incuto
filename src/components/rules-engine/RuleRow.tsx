import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  GripVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { Rule } from '../../types';
import { FIELD_MAP, OPERATOR_LABELS } from '../../lib/fields';
import { SourceBadge } from '../ui/Badge';

interface RuleRowProps {
  rule: Rule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (rule: Rule) => void;
}

function formatValue(value: number | boolean): string {
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toFixed(1);
}

export function RuleRow({ rule, onToggle, onDelete, onEdit }: RuleRowProps) {
  const [expanded, setExpanded] = useState(false);
  const field = FIELD_MAP.get(rule.fieldId);

  const isHardDecline = rule.action === 'hard_decline';
  const score = rule.scoreAdjustment ?? 0;
  const isPositive = score > 0;

  return (
    <div
      className={clsx(
        'rounded-lg border transition-all duration-150',
        !rule.enabled && 'opacity-50',
        isHardDecline
          ? 'border-rose-200 bg-rose-50/30'
          : isPositive
          ? 'border-emerald-200 bg-emerald-50/20'
          : score < 0
          ? 'border-amber-200 bg-amber-50/20'
          : 'border-slate-200 bg-white'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <div className="text-slate-300 cursor-grab hover:text-slate-400 shrink-0">
          <GripVertical size={16} />
        </div>

        {/* Rule type indicator */}
        <div
          className={clsx(
            'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
            isHardDecline
              ? 'bg-rose-100 text-rose-600'
              : isPositive
              ? 'bg-emerald-100 text-emerald-600'
              : score < 0
              ? 'bg-amber-100 text-amber-600'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          {isHardDecline ? (
            <AlertTriangle size={14} />
          ) : isPositive ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
        </div>

        {/* Rule content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-800">{rule.name}</span>
            {field && <SourceBadge source={field.source} />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-mono text-slate-600">
              {field?.label ?? rule.fieldId}
            </span>{' '}
            <span className="text-slate-400">{OPERATOR_LABELS[rule.operator]}</span>{' '}
            <span className="font-mono text-slate-600">
              {formatValue(rule.value)}
              {field?.unit ? ` ${field.unit}` : ''}
            </span>
          </p>
        </div>

        {/* Action badge */}
        <div className="shrink-0">
          {isHardDecline ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
              <AlertTriangle size={10} />
              Hard Decline
            </span>
          ) : (
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums',
                score > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : score < 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {score > 0 ? '+' : ''}
              {score} pts
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Details"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <button
            onClick={() => onEdit(rule)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit rule"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onToggle(rule.id)}
            className={clsx(
              'p-1.5 rounded transition-colors',
              rule.enabled
                ? 'text-emerald-500 hover:text-slate-400 hover:bg-slate-100'
                : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'
            )}
            title={rule.enabled ? 'Disable rule' : 'Enable rule'}
          >
            {rule.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete rule"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded description */}
      {expanded && rule.description && (
        <div className="px-4 pb-3 pt-0">
          <div className="ml-10 text-xs text-slate-500 bg-white/60 rounded px-3 py-2 border border-slate-100">
            {rule.description}
          </div>
        </div>
      )}
    </div>
  );
}
