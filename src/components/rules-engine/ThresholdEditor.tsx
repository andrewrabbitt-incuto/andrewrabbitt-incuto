import React, { useState } from 'react';
import type { ScoreThresholds } from '../../types';
import clsx from 'clsx';

interface ThresholdEditorProps {
  thresholds: ScoreThresholds;
  baseScore: number;
  onChange: (thresholds: ScoreThresholds) => void;
  onBaseScoreChange: (score: number) => void;
}

export function ThresholdEditor({
  thresholds,
  baseScore,
  onChange,
  onBaseScoreChange,
}: ThresholdEditorProps) {
  const [editing, setEditing] = useState(false);
  const [approveAbove, setApproveAbove] = useState(String(thresholds.approveAbove));
  const [declineBelow, setDeclineBelow] = useState(String(thresholds.declineBelow));
  const [base, setBase] = useState(String(baseScore));

  function handleSave() {
    const a = parseInt(approveAbove, 10);
    const d = parseInt(declineBelow, 10);
    const b = parseInt(base, 10);
    if (isNaN(a) || isNaN(d) || isNaN(b) || d >= a) return;
    onChange({ approveAbove: a, declineBelow: d });
    onBaseScoreChange(b);
    setEditing(false);
  }

  // Visualise score bands as a horizontal bar
  const maxScore = 1000;
  const declinePct = (thresholds.declineBelow / maxScore) * 100;
  const referPct = ((thresholds.approveAbove - thresholds.declineBelow) / maxScore) * 100;
  const approvePct = 100 - declinePct - referPct;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Score Thresholds</h3>
          <p className="text-xs text-slate-500 mt-0.5">Define the bands for auto-approve, refer to underwriter, and auto-decline</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Visual score band */}
      <div className="mb-4">
        <div className="flex rounded-full overflow-hidden h-4 bg-slate-100">
          <div
            className="bg-rose-400 h-full transition-all duration-300"
            style={{ width: `${declinePct}%` }}
            title={`Decline: < ${thresholds.declineBelow}`}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-300"
            style={{ width: `${referPct}%` }}
            title={`Refer: ${thresholds.declineBelow}–${thresholds.approveAbove}`}
          />
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${approvePct}%` }}
            title={`Approve: ≥ ${thresholds.approveAbove}`}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-0.5">
          <span>0</span>
          <span>{maxScore}</span>
        </div>
      </div>

      {/* Threshold cards */}
      {editing ? (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Base Score</label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={base}
              onChange={e => setBase(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Starting score for all applicants</p>
          </div>
          <div>
            <label className="text-xs font-medium text-rose-600 block mb-1">Decline Below</label>
            <input
              type="number"
              className="w-full border border-rose-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              value={declineBelow}
              onChange={e => setDeclineBelow(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Score below this = auto-decline</p>
          </div>
          <div>
            <label className="text-xs font-medium text-emerald-600 block mb-1">Approve Above</label>
            <input
              type="number"
              className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={approveAbove}
              onChange={e => setApproveAbove(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Score above this = auto-approve</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <ThresholdCard
            label="Base Score"
            value={baseScore}
            color="slate"
            description="Starting point for all applicants"
          />
          <ThresholdCard
            label="Auto Decline"
            value={`< ${thresholds.declineBelow}`}
            color="rose"
            description="Score below this = declined"
          />
          <ThresholdCard
            label="Refer to Underwriter"
            value={`${thresholds.declineBelow}–${thresholds.approveAbove - 1}`}
            color="amber"
            description="Manual underwriter review"
          />
          <ThresholdCard
            label="Auto Approve"
            value={`≥ ${thresholds.approveAbove}`}
            color="emerald"
            description="Score above this = approved"
          />
        </div>
      )}
    </div>
  );
}

function ThresholdCard({
  label,
  value,
  color,
  description,
}: {
  label: string;
  value: string | number;
  color: 'slate' | 'rose' | 'amber' | 'emerald';
  description: string;
}) {
  const styles = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className={clsx('rounded-lg border p-3', styles[color])}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-lg font-bold mt-0.5 tabular-nums">{value}</p>
      <p className="text-xs opacity-60 mt-1 leading-tight">{description}</p>
    </div>
  );
}
