import React, { useState, useMemo } from 'react';
import {
  Plus,
  AlertTriangle,
  TrendingUp,
  Save,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { Scorecard, Rule } from '../../types';
import { RuleRow } from './RuleRow';
import { AddRuleModal } from './AddRuleModal';
import { ThresholdEditor } from './ThresholdEditor';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';

interface ScorecardEditorProps {
  scorecard: Scorecard;
  onChange: (sc: Scorecard) => void;
}

export function ScorecardEditor({ scorecard, onChange }: ScorecardEditorProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [saved, setSaved] = useState(false);

  const hardDeclineRules = useMemo(
    () => scorecard.rules.filter(r => r.action === 'hard_decline'),
    [scorecard.rules]
  );
  const scoreRules = useMemo(
    () => scorecard.rules.filter(r => r.action === 'score'),
    [scorecard.rules]
  );

  const positiveRules = scoreRules.filter(r => (r.scoreAdjustment ?? 0) > 0);
  const negativeRules = scoreRules.filter(r => (r.scoreAdjustment ?? 0) <= 0);

  const maxPossibleScore =
    scorecard.baseScore +
    positiveRules.filter(r => r.enabled).reduce((s, r) => s + (r.scoreAdjustment ?? 0), 0);
  const minPossibleScore =
    scorecard.baseScore +
    negativeRules.filter(r => r.enabled).reduce((s, r) => s + (r.scoreAdjustment ?? 0), 0);

  function updateRules(rules: Rule[]) {
    onChange({ ...scorecard, rules, updatedAt: new Date().toISOString() });
  }

  function handleToggle(id: string) {
    updateRules(
      scorecard.rules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }

  function handleDelete(id: string) {
    updateRules(scorecard.rules.filter(r => r.id !== id));
  }

  function handleSaveRule(rule: Rule) {
    if (editingRule) {
      updateRules(scorecard.rules.map(r => (r.id === rule.id ? rule : r)));
    } else {
      updateRules([...scorecard.rules, rule]);
    }
    setEditingRule(null);
  }

  function handleEdit(rule: Rule) {
    setEditingRule(rule);
    setAddModalOpen(true);
  }

  function handleSave() {
    onChange({ ...scorecard, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Scorecard header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-base font-semibold text-slate-900">{scorecard.name}</h2>
              <StatusBadge status={scorecard.status} />
              <span className="text-xs text-slate-400 font-medium">v{scorecard.version}</span>
            </div>
            {scorecard.description && (
              <p className="text-sm text-slate-500">{scorecard.description}</p>
            )}
          </div>
          <Button
            variant={saved ? 'success' : 'primary'}
            icon={saved ? CheckCircle2 : Save}
            onClick={handleSave}
          >
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        </div>

        {/* Score range summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-xs text-slate-500">Max possible score</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums">{maxPossibleScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Base score</p>
            <p className="text-lg font-bold text-slate-700 tabular-nums">{scorecard.baseScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Min possible score</p>
            <p className="text-lg font-bold text-rose-600 tabular-nums">{minPossibleScore}</p>
          </div>
        </div>
      </div>

      {/* Score thresholds */}
      <ThresholdEditor
        thresholds={scorecard.thresholds}
        baseScore={scorecard.baseScore}
        onChange={thresholds => onChange({ ...scorecard, thresholds })}
        onBaseScoreChange={baseScore => onChange({ ...scorecard, baseScore })}
      />

      {/* Hard Decline Rules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-800">Hard Decline Rules</h3>
            <span className="text-xs text-slate-400">({hardDeclineRules.length})</span>
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setAddModalOpen(true);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus size={12} />
            Add rule
          </button>
        </div>

        {hardDeclineRules.length === 0 ? (
          <EmptyRuleState
            label="No hard decline rules configured"
            description="Add rules here that will immediately decline an application regardless of score"
          />
        ) : (
          <div className="space-y-2">
            {hardDeclineRules.map(rule => (
              <RuleRow
                key={rule.id}
                rule={rule}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Score Rules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Scoring Rules</h3>
            <span className="text-xs text-slate-400">({scoreRules.length})</span>
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setAddModalOpen(true);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus size={12} />
            Add rule
          </button>
        </div>

        {scoreRules.length === 0 ? (
          <EmptyRuleState
            label="No scoring rules configured"
            description="Add rules that adjust an applicant's score up or down based on their data"
          />
        ) : (
          <div className="space-y-2">
            {[...positiveRules, ...negativeRules].map(rule => (
              <RuleRow
                key={rule.id}
                rule={rule}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info callout */}
      <div className="flex items-start gap-3 bg-indigo-50 rounded-lg px-4 py-3 border border-indigo-100">
        <Info size={15} className="text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Rules are evaluated in order. Hard decline rules are checked first — if any trigger, scoring stops immediately.
          Score adjustments accumulate and the final score determines the decision band.
          Use the <strong>Sandbox</strong> to simulate the impact of changes before going live.
        </p>
      </div>

      <AddRuleModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        editRule={editingRule}
      />
    </div>
  );
}

function EmptyRuleState({ label, description }: { label: string; description: string }) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-lg px-4 py-6 text-center">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}
