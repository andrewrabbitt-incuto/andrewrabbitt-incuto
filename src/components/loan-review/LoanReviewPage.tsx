import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  ChevronDown,
  X,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { LoanDetailDrawer } from './LoanDetailDrawer';
import { GapAnalysisPanel } from './GapAnalysisPanel';
import { DecisionBadge } from '../ui/Badge';
import { StatCard } from '../ui/StatCard';
import type { Decision } from '../../types';
import clsx from 'clsx';

type ViewMode = 'decisions' | 'gap-analysis';

const DECISION_ICONS = {
  approve: CheckCircle2,
  refer: Clock,
  decline: AlertTriangle,
};

const DECISION_COLORS = {
  approve: 'text-emerald-600 bg-emerald-50',
  refer: 'text-amber-600 bg-amber-50',
  decline: 'text-rose-600 bg-rose-50',
};

function formatCurrency(v: number) {
  return `£${v.toLocaleString('en-GB')}`;
}

const PERIODS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
];

export function LoanReviewPage() {
  const { applications, selectedApplicationId, setSelectedApplicationId } = useAppContext();
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<Decision | 'all'>('all');
  const [productFilter, setProductFilter] = useState('all');
  const [periodDays, setPeriodDays] = useState(30);
  const [viewMode, setViewMode] = useState<ViewMode>('decisions');

  // Filter applications by period
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - periodDays);
    return d;
  }, [periodDays]);

  const periodApplications = useMemo(
    () => applications.filter(a => new Date(a.appliedAt) >= cutoff),
    [applications, cutoff]
  );

  // Get unique products
  const products = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ id: string; name: string }> = [];
    periodApplications.forEach(a => {
      if (!seen.has(a.productId)) {
        seen.add(a.productId);
        result.push({ id: a.productId, name: a.productName });
      }
    });
    return result;
  }, [periodApplications]);

  const filtered = useMemo(() => {
    return periodApplications.filter(a => {
      if (decisionFilter !== 'all' && a.decision.decision !== decisionFilter) return false;
      if (productFilter !== 'all' && a.productId !== productFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !a.memberName.toLowerCase().includes(q) &&
          !a.id.toLowerCase().includes(q) &&
          !a.memberId.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [periodApplications, decisionFilter, productFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const counts = { approve: 0, refer: 0, decline: 0 };
    periodApplications.forEach(a => counts[a.decision.decision]++);
    const total = periodApplications.length || 1;
    return {
      ...counts,
      approveRate: Math.round((counts.approve / total) * 100),
      referRate: Math.round((counts.refer / total) * 100),
      declineRate: Math.round((counts.decline / total) * 100),
      total: periodApplications.length,
    };
  }, [periodApplications]);

  const selectedApplication = selectedApplicationId
    ? applications.find(a => a.id === selectedApplicationId) ?? null
    : null;

  return (
    <div className="flex h-[calc(100vh-69px)] overflow-hidden">
      {/* Main panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Total Applications"
              value={stats.total}
              icon={BarChart2}
              subValue={`Last ${periodDays} days`}
            />
            <StatCard
              label="Approved"
              value={`${stats.approve}`}
              subValue={`${stats.approveRate}% of total`}
              icon={CheckCircle2}
              variant="approve"
            />
            <StatCard
              label="Referred"
              value={`${stats.refer}`}
              subValue={`${stats.referRate}% of total`}
              icon={Clock}
              variant="refer"
            />
            <StatCard
              label="Declined"
              value={`${stats.decline}`}
              subValue={`${stats.declineRate}% of total`}
              icon={TrendingDown}
              variant="decline"
            />
          </div>

          {/* View toggle and filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('decisions')}
                className={clsx(
                  'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  viewMode === 'decisions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Decisions
              </button>
              <button
                onClick={() => setViewMode('gap-analysis')}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  viewMode === 'gap-analysis' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <Sparkles size={11} className="text-indigo-400" />
                Gap Analysis
              </button>
            </div>

            {viewMode === 'decisions' && (
              <>
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Search by name or ID…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Decision filter */}
                <div className="relative">
                  <select
                    value={decisionFilter}
                    onChange={e => setDecisionFilter(e.target.value as Decision | 'all')}
                    className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">All decisions</option>
                    <option value="approve">Approve</option>
                    <option value="refer">Refer</option>
                    <option value="decline">Decline</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Product filter */}
                <div className="relative">
                  <select
                    value={productFilter}
                    onChange={e => setProductFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="all">All products</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </>
            )}

            {/* Period selector */}
            <div className="relative ml-auto">
              <select
                value={periodDays}
                onChange={e => setPeriodDays(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {PERIODS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Content */}
          {viewMode === 'decisions' ? (
            <div>
              {/* Results count */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{filtered.length}</span> applications
                </p>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicant</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Decision</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(app => {
                      const DecIcon = DECISION_ICONS[app.decision.decision];
                      const isSelected = app.id === selectedApplicationId;
                      return (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedApplicationId(isSelected ? null : app.id)}
                          className={clsx(
                            'cursor-pointer transition-colors',
                            isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                          )}
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-800">{app.memberName}</p>
                            <p className="text-xs text-slate-400">{app.memberId} · {app.purpose}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-600">{app.productName}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-medium text-slate-800">{formatCurrency(app.amount)}</p>
                            <p className="text-xs text-slate-400">{app.term}m</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <div className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', DECISION_COLORS[app.decision.decision])}>
                                <DecIcon size={11} />
                                <span className="capitalize">{app.decision.decision}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {app.decision.hardDeclineRule ? (
                              <span className="text-xs text-rose-500 font-medium">Hard Decline</span>
                            ) : (
                              <span className="text-sm font-medium text-slate-700 tabular-nums">
                                {app.decision.finalScore}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-xs text-slate-500">
                              {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(app.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-slate-400">No applications match your filters</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <GapAnalysisPanel applications={periodApplications} />
          )}
        </div>
      </div>

      {/* Detail drawer */}
      <LoanDetailDrawer
        application={selectedApplication}
        onClose={() => setSelectedApplicationId(null)}
      />
    </div>
  );
}
