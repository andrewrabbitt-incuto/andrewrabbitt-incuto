import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { LoanDecision } from '../../types';
import { AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  decision: LoanDecision;
  approveAbove: number;
  declineBelow: number;
}

interface TooltipPayload {
  value: number;
  payload: { name: string; reason: string; isBase: boolean };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2.5 max-w-xs">
      <p className="text-xs font-semibold text-slate-800 mb-0.5">{d.payload.name}</p>
      <p className="text-xs text-slate-500">{d.payload.reason}</p>
      <p className={`text-sm font-bold mt-1 tabular-nums ${d.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {d.value > 0 ? '+' : ''}{d.value} pts
      </p>
    </div>
  );
}

export function ScoreBreakdown({ decision, approveAbove, declineBelow }: ScoreBreakdownProps) {
  if (decision.hardDeclineRule) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="text-rose-600 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-rose-800">Hard Decline — No Score Calculated</h3>
            <p className="text-xs text-rose-600 mt-0.5">
              The application was declined immediately due to a hard decline rule trigger
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-rose-100 px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">Triggered rule</p>
          <p className="text-sm font-semibold text-rose-700">{decision.hardDeclineRule}</p>
        </div>

        <div className="mt-4 space-y-2">
          {decision.ruleResults.map(r => (
            <div
              key={r.ruleId}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                r.triggered && r.action === 'hard_decline' ? 'bg-rose-100' : 'bg-white border border-slate-100'
              }`}
            >
              {r.triggered && r.action === 'hard_decline' ? (
                <AlertTriangle size={14} className="text-rose-600 shrink-0" />
              ) : (
                <MinusCircle size={14} className="text-slate-300 shrink-0" />
              )}
              <span className="text-xs text-slate-700 flex-1">{r.ruleName}</span>
              {r.triggered && r.action === 'hard_decline' && (
                <span className="text-xs font-semibold text-rose-600">Triggered</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Build waterfall chart data
  const chartData = [
    {
      name: 'Base Score',
      value: decision.baseScore,
      cumulative: decision.baseScore,
      reason: 'Starting score for all applicants',
      isBase: true,
    },
    ...decision.ruleResults
      .filter(r => r.triggered && r.action === 'score' && r.scoreAdjustment !== undefined)
      .map(r => ({
        name: r.ruleName,
        value: r.scoreAdjustment ?? 0,
        cumulative: 0, // calculated below
        reason: r.reason,
        isBase: false,
      })),
  ];

  // Calculate running cumulative
  let running = 0;
  chartData.forEach((d) => {
    running += d.value;
    d.cumulative = running;
  });

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Final Score</p>
            {decision.decision === 'approve' ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 size={12} />
                Above approve threshold
              </span>
            ) : decision.decision === 'decline' ? (
              <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                <AlertTriangle size={12} />
                Below decline threshold
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                <MinusCircle size={12} />
                In refer band
              </span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-slate-900 tabular-nums">{decision.finalScore}</p>
            <p className="text-sm text-slate-500 mb-1">
              {decision.scoreAdjustments > 0 ? '+' : ''}
              {decision.scoreAdjustments} from rules
            </p>
          </div>

          {/* Score meter */}
          <div className="mt-3">
            <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="bg-rose-400" style={{ width: `${(declineBelow / 1000) * 100}%` }} />
                <div className="bg-amber-400" style={{ width: `${((approveAbove - declineBelow) / 1000) * 100}%` }} />
                <div className="bg-emerald-400" style={{ flex: 1 }} />
              </div>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 transition-all"
                style={{ left: `${Math.min(100, (decision.finalScore / 1000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Decline &lt;{declineBelow}</span>
              <span>{declineBelow}–{approveAbove - 1} Refer</span>
              <span>Approve ≥{approveAbove}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Waterfall chart */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Score Build-up</h4>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={0}
                height={35}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={approveAbove} stroke="#10b981" strokeDasharray="4 2" label={{ value: 'Approve', fontSize: 9, fill: '#10b981', position: 'insideTopRight' }} />
              <ReferenceLine y={declineBelow} stroke="#f43f5e" strokeDasharray="4 2" label={{ value: 'Decline', fontSize: 9, fill: '#f43f5e', position: 'insideBottomRight' }} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isBase
                        ? '#6366f1'
                        : entry.value > 0
                        ? '#10b981'
                        : '#f43f5e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rule results table */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">All Rules</h4>
        <div className="space-y-1.5">
          {decision.ruleResults.map(r => (
            <div
              key={r.ruleId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                r.triggered
                  ? r.action === 'score' && (r.scoreAdjustment ?? 0) > 0
                    ? 'bg-emerald-50 border-emerald-100'
                    : r.action === 'score' && (r.scoreAdjustment ?? 0) < 0
                    ? 'bg-rose-50 border-rose-100'
                    : 'border-slate-100 bg-white'
                  : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700">{r.ruleName}</p>
                <p className="text-xs text-slate-400 truncate">{r.reason}</p>
              </div>
              {r.triggered && r.action === 'score' && r.scoreAdjustment !== undefined && (
                <span
                  className={`text-xs font-bold tabular-nums shrink-0 ${
                    r.scoreAdjustment > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {r.scoreAdjustment > 0 ? '+' : ''}
                  {r.scoreAdjustment} pts
                </span>
              )}
              {!r.triggered && (
                <span className="text-xs text-slate-300 shrink-0">Not triggered</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
