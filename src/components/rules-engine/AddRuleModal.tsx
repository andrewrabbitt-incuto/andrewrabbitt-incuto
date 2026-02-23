import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DATA_FIELDS, OPERATORS_FOR_TYPE, getField } from '../../lib/fields';
import type { Rule, DataSource } from '../../types';
import clsx from 'clsx';

interface AddRuleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: Rule) => void;
  editRule?: Rule | null;
}

const SOURCE_LABELS: Record<DataSource, string> = {
  member: 'Member Data',
  bureau: 'Bureau / TransUnion',
  openbanking: 'Open Banking',
};

const SOURCE_COLORS: Record<DataSource, string> = {
  member: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  bureau: 'bg-purple-50 text-purple-700 border-purple-200',
  openbanking: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export function AddRuleModal({ open, onClose, onSave, editRule }: AddRuleModalProps) {
  const [name, setName] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [operator, setOperator] = useState('');
  const [value, setValue] = useState('');
  const [action, setAction] = useState<'hard_decline' | 'score'>('score');
  const [scoreAdjustment, setScoreAdjustment] = useState('');
  const [description, setDescription] = useState('');
  const [filterSource, setFilterSource] = useState<DataSource | 'all'>('all');

  useEffect(() => {
    if (editRule) {
      setName(editRule.name);
      setFieldId(editRule.fieldId);
      setOperator(editRule.operator);
      setValue(typeof editRule.value === 'boolean' ? String(editRule.value) : String(editRule.value));
      setAction(editRule.action);
      setScoreAdjustment(editRule.scoreAdjustment !== undefined ? String(editRule.scoreAdjustment) : '');
      setDescription(editRule.description ?? '');
    } else {
      setName('');
      setFieldId('');
      setOperator('');
      setValue('');
      setAction('score');
      setScoreAdjustment('');
      setDescription('');
    }
  }, [editRule, open]);

  const selectedField = fieldId ? getField(fieldId) : undefined;
  const fieldType = selectedField?.fieldType ?? 'number';
  const availableOperators = OPERATORS_FOR_TYPE[fieldType] ?? OPERATORS_FOR_TYPE.number;
  const filteredFields = filterSource === 'all'
    ? DATA_FIELDS
    : DATA_FIELDS.filter(f => f.source === filterSource);

  function handleSave() {
    if (!name || !fieldId || !operator) return;

    let parsedValue: number | boolean;
    if (fieldType === 'boolean') {
      parsedValue = operator === 'is_true';
    } else {
      parsedValue = parseFloat(value) || 0;
    }

    const rule: Rule = {
      id: editRule?.id ?? `r-${Date.now()}`,
      name,
      fieldId,
      operator: operator as Rule['operator'],
      value: parsedValue,
      action,
      scoreAdjustment: action === 'score' ? (parseFloat(scoreAdjustment) || 0) : undefined,
      enabled: editRule?.enabled ?? true,
      description: description || undefined,
    };

    onSave(rule);
    onClose();
  }

  const isValid = name.trim() && fieldId && operator && (fieldType === 'boolean' || value.trim()) &&
    (action === 'hard_decline' || scoreAdjustment.trim());

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editRule ? 'Edit Rule' : 'Add Rule'}
      subtitle="Define a condition and the action to take when it is met"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!isValid}>
            {editRule ? 'Save Changes' : 'Add Rule'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Rule name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Rule Name</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g. Strong Credit Score"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Data field selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Data Field</label>

          {/* Source filter */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {(['all', 'member', 'bureau', 'openbanking'] as const).map(src => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  filterSource === src
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                )}
              >
                {src === 'all' ? 'All Sources' : SOURCE_LABELS[src]}
              </button>
            ))}
          </div>

          <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 scrollbar-thin">
            {filteredFields.map(field => (
              <button
                key={field.id}
                onClick={() => {
                  setFieldId(field.id);
                  setOperator('');
                  setValue('');
                }}
                className={clsx(
                  'w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors',
                  fieldId === field.id
                    ? 'bg-indigo-50'
                    : 'hover:bg-slate-50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium', fieldId === field.id ? 'text-indigo-700' : 'text-slate-700')}>
                    {field.label}
                    {field.unit && <span className="text-slate-400 font-normal ml-1">({field.unit})</span>}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{field.description}</p>
                </div>
                <span
                  className={clsx(
                    'text-xs px-2 py-0.5 rounded-full border shrink-0 font-medium',
                    SOURCE_COLORS[field.source]
                  )}
                >
                  {SOURCE_LABELS[field.source]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        {fieldId && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Operator</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={operator}
                onChange={e => setOperator(e.target.value)}
              >
                <option value="">Select operator…</option>
                {availableOperators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>

            {fieldType === 'number' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Value{selectedField?.unit ? ` (${selectedField.unit})` : ''}
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter value…"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Action */}
        {fieldId && operator && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('score')}
                className={clsx(
                  'px-4 py-3 rounded-lg border-2 text-left transition-all',
                  action === 'score'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <p className={clsx('text-sm font-semibold', action === 'score' ? 'text-indigo-700' : 'text-slate-700')}>
                  Score Adjustment
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Add or subtract points from the applicant's score</p>
              </button>
              <button
                onClick={() => setAction('hard_decline')}
                className={clsx(
                  'px-4 py-3 rounded-lg border-2 text-left transition-all',
                  action === 'hard_decline'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <p className={clsx('text-sm font-semibold', action === 'hard_decline' ? 'text-rose-700' : 'text-slate-700')}>
                  Hard Decline
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Immediately decline — no further scoring</p>
              </button>
            </div>

            {action === 'score' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Score Adjustment (use negative for penalty)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. +150 or -75"
                  value={scoreAdjustment}
                  onChange={e => setScoreAdjustment(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
            placeholder="Explain the business rationale for this rule…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
