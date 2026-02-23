import React, { useState, useMemo, useCallback } from 'react';
import {
  Play,
  Copy,
  FlaskConical,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useAppContext } from '../../store/AppContext';
import { ScorecardEditor } from '../rules-engine/ScorecardEditor';
import { Button } from '../ui/Button';
import { DecisionBadge } from '../ui/Badge';
import { runSimulation } from '../../lib/simulation';
import type { SimulationPeriod, SimulationResult, Scorecard } from '../../types';
import clsx from 'clsx';

const PERIODS: Array<{ value: SimulationPeriod; label: string }> = [
  { value: 'day', label: 'Last Day' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' },
];

export function SandboxPage() {
  const {
    products,
    scorecards,
    selectedProductId,
    setSelectedProductId,
    activeScorecard,
  } = useAppContext();

  const [period, setPeriod] = useState<SimulationPeriod>('month');
  const [proposedScorecard, setProposedScorecard] = useState<Scorecard | null>(null);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'results'>('editor');

  // Initialise proposed scorecard from active one when product changes
  const baseScorecard = activeScorecard;

  function initProposed() {
    if (!baseScorecard) return;
    setProposedScorecard({
      ...baseScorecard,
      id: `${baseScorecard.id}-sandbox`,
      name: `${baseScorecard.name} (Proposed)`,
      status: 'draft',
    });
  }

  function handleRunSimulation() {
    if (!baseScorecard || !proposedScorecard) return;
    setRunning(true);
    setTimeout(() => {
      const result = runSimulation(period, baseScorecard, proposedScorecard);
      setSimResult(result);
      setActiveTab('results');
      setRunning(false);
    }, 800);
  }

  const decisionChangeSummary = useMemo(() => {
    if (!simResult) return null;
    const better = simResult.changes.filter(c =>
      (c.proposedDecision === 'approve' && c.baselineDecision !== 'approve') ||
      (c.proposedDecision === 'refer' && c.baselineDecision === 'decline')
    );
    const worse = simResult.changes.filter(c =>
      (c.proposedDecision === 'decline' && c.baselineDecision !== 'decline') ||
      (c.proposedDecision === 'refer' && c.baselineDecision === 'approve')
    );
    return { better, worse, total: simResult.changes.length };
  }, [simResult]);

  return (
    <div className="h-[calc(100vh-69px)] flex flex-col overflow-hidden">
      {/* Top controls */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 shrink-0 flex-wrap">
        {/* Product selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Product:</span>
          <div className="relative">
            <select
              value={selectedProductId}
              onChange={e => {
                setSelectedProductId(e.target.value);
                setProposedScorecard(null);
                setSimResult(null);
              }}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Period selector */}
        <div className="flex bg-slate-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={clsx(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                period === p.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!proposedScorecard && baseScorecard && (
            <Button variant="secondary" icon={Copy} size="sm" onClick={initProposed}>
              Clone Current Scorecard
            </Button>
          )}
          {proposedScorecard && (
            <Button
              variant="primary"
              icon={Play}
              size="sm"
              loading={running}
              onClick={handleRunSimulation}
            >
              {running ? 'Running…' : 'Run Simulation'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {!proposedScorecard ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Start a Simulation</h3>
              <p className="text-sm text-slate-500 mb-6">
                Clone the current scorecard for <strong>{products.find(p => p.id === selectedProductId)?.name}</strong>,
                make your proposed changes, then run a simulation to see the impact on historical applications.
              </p>
              {baseScorecard ? (
                <Button variant="primary" icon={Copy} onClick={initProposed}>
                  Clone Scorecard to Sandbox
                </Button>
              ) : (
                <p className="text-xs text-slate-400">No live scorecard found for this product</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Baseline summary */}
            <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
              <div className="px-4 py-3 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current (Baseline)</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{baseScorecard?.name}</p>
              </div>

              {baseScorecard && (
                <div className="p-4 space-y-3 overflow-y-auto scrollbar-thin flex-1">
                  {/* Threshold summary */}
                  <BaselineStat label="Approve above" value={baseScorecard.thresholds.approveAbove} color="emerald" />
                  <BaselineStat label="Decline below" value={baseScorecard.thresholds.declineBelow} color="rose" />
                  <BaselineStat label="Base score" value={baseScorecard.baseScore} color="slate" />

                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Rules ({baseScorecard.rules.filter(r => r.enabled).length} enabled)</p>
                    <div className="space-y-1">
                      {baseScorecard.rules.filter(r => r.enabled).map(rule => (
                        <div key={rule.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate flex-1 mr-2">{rule.name}</span>
                          {rule.action === 'hard_decline' ? (
                            <span className="text-rose-500 font-semibold shrink-0">HD</span>
                          ) : (
                            <span className={clsx('font-semibold tabular-nums shrink-0', (rule.scoreAdjustment ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-500')}>
                              {(rule.scoreAdjustment ?? 0) > 0 ? '+' : ''}{rule.scoreAdjustment}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Centre: proposed editor + results */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-slate-200 bg-white px-4 shrink-0">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={clsx(
                    'px-4 py-3 text-xs font-medium border-b-2 transition-colors',
                    activeTab === 'editor' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  Proposed Scorecard
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  disabled={!simResult}
                  className={clsx(
                    'px-4 py-3 text-xs font-medium border-b-2 transition-colors disabled:opacity-40',
                    activeTab === 'results' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  Simulation Results
                  {simResult && <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs">{simResult.changes.length} changes</span>}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                {activeTab === 'editor' && (
                  <ScorecardEditor
                    scorecard={proposedScorecard}
                    onChange={setProposedScorecard}
                  />
                )}

                {activeTab === 'results' && simResult && (
                  <SimulationResults result={simResult} summary={decisionChangeSummary!} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BaselineStat({ label, value, color }: { label: string; value: number; color: 'emerald' | 'rose' | 'slate' }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    slate: 'bg-white text-slate-700 border-slate-100',
  };
  return (
    <div className={clsx('rounded-lg border px-3 py-2 flex items-center justify-between', styles[color])}>
      <span className="text-xs">{label}</span>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}

function SimulationResults({
  result,
  summary,
}: {
  result: SimulationResult;
  summary: { better: SimulationResult['changes']; worse: SimulationResult['changes']; total: number };
}) {
  const [showChanges, setShowChanges] = useState<'all' | 'better' | 'worse'>('all');

  const approveRateChange = result.proposed.approveRate - result.baseline.approveRate;
  const declineRateChange = result.proposed.declineRate - result.baseline.declineRate;
  const referRateChange = result.proposed.referRate - result.baseline.referRate;

  const comparisons = [
    {
      label: 'Total Applications',
      baseline: result.totalApplications,
      proposed: result.totalApplications,
      unit: '',
    },
    {
      label: 'Approve Rate',
      baseline: `${result.baseline.approveRate}%`,
      proposed: `${result.proposed.approveRate}%`,
      change: approveRateChange,
      good: approveRateChange > 0,
    },
    {
      label: 'Refer Rate',
      baseline: `${result.baseline.referRate}%`,
      proposed: `${result.proposed.referRate}%`,
      change: referRateChange,
      good: null,
    },
    {
      label: 'Decline Rate',
      baseline: `${result.baseline.declineRate}%`,
      proposed: `${result.proposed.declineRate}%`,
      change: declineRateChange,
      good: declineRateChange < 0,
    },
  ];

  const chartData = [
    {
      name: 'Baseline',
      Approve: result.baseline.approveCount,
      Refer: result.baseline.referCount,
      Decline: result.baseline.declineCount,
    },
    {
      name: 'Proposed',
      Approve: result.proposed.approveCount,
      Refer: result.proposed.referCount,
      Decline: result.proposed.declineCount,
    },
  ];

  const visibleChanges =
    showChanges === 'better' ? summary.better : showChanges === 'worse' ? summary.worse : result.changes;

  return (
    <div className="space-y-5">
      {/* Summary comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stacked bar comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Decision Distribution</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="Approve" stackId="a" fill="#10b981" />
              <Bar dataKey="Refer" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Decline" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rate comparison table */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Rate Comparison</h4>
          <div className="space-y-3">
            {comparisons.slice(1).map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 shrink-0">{c.label}</span>
                <span className="text-sm font-semibold text-slate-400 tabular-nums">{c.baseline}</span>
                <ArrowRight size={12} className="text-slate-300 shrink-0" />
                <span className="text-sm font-semibold text-slate-800 tabular-nums">{c.proposed}</span>
                {c.change !== undefined && (
                  <span
                    className={clsx(
                      'ml-auto text-xs font-semibold flex items-center gap-0.5',
                      c.good === true ? 'text-emerald-600' : c.good === false ? 'text-rose-600' : 'text-amber-600'
                    )}
                  >
                    {c.change > 0 ? <TrendingUp size={11} /> : c.change < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                    {c.change > 0 ? '+' : ''}{c.change}pp
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline chart if enough data */}
      {result.dailyBreakdown.length > 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Daily Approve Rate — Baseline vs Proposed</h4>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart
              data={result.dailyBreakdown}
              margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="approve" name="Baseline Approve" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="propApprove" name="Proposed Approve" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Changed applications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Decision Changes ({result.changes.length})
          </h4>
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            {(['all', 'better', 'worse'] as const).map(f => (
              <button
                key={f}
                onClick={() => setShowChanges(f)}
                className={clsx(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  showChanges === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                )}
              >
                {f === 'all' ? `All (${result.changes.length})` :
                 f === 'better' ? `Better (${summary.better.length})` :
                 `Worse (${summary.worse.length})`}
              </button>
            ))}
          </div>
        </div>

        {visibleChanges.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Applicant</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Amount</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Baseline</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Proposed</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">Score Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleChanges.slice(0, 30).map(c => {
                  const scoreChange = c.proposedScore - c.baselineScore;
                  return (
                    <tr key={c.applicationId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-sm font-medium text-slate-700">{c.memberName}</p>
                        <p className="text-xs text-slate-400">{c.applicationId}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-slate-600">
                        £{c.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          <DecisionBadge decision={c.baselineDecision} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          <DecisionBadge decision={c.proposedDecision} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={clsx('text-xs font-semibold tabular-nums', scoreChange > 0 ? 'text-emerald-600' : 'text-rose-600')}>
                          {scoreChange > 0 ? '+' : ''}{scoreChange}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleChanges.length > 30 && (
              <div className="px-4 py-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-400">Showing 30 of {visibleChanges.length} changes</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
            <RefreshCw size={20} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No changes in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
