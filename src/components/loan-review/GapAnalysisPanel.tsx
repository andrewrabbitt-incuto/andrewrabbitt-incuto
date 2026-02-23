import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Lightbulb,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { ApplicationWithDecision } from '../../types';
import { generateGapAnalysis, getTopDeclineDrivers } from '../../lib/gap-analysis';
import { Button } from '../ui/Button';
import clsx from 'clsx';

interface GapAnalysisPanelProps {
  applications: ApplicationWithDecision[];
}

const INSIGHT_STYLES = {
  opportunity: {
    bg: 'bg-indigo-50 border-indigo-200',
    icon: Lightbulb,
    iconClass: 'text-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    label: 'Opportunity',
  },
  pattern: {
    bg: 'bg-slate-50 border-slate-200',
    icon: TrendingDown,
    iconClass: 'text-slate-400',
    badgeClass: 'bg-slate-200 text-slate-600',
    label: 'Pattern',
  },
  risk: {
    bg: 'bg-amber-50 border-amber-200',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700',
    label: 'Risk',
  },
};

export function GapAnalysisPanel({ applications }: GapAnalysisPanelProps) {
  const [analysisRun, setAnalysisRun] = useState(false);
  const [loading, setLoading] = useState(false);

  const declined = useMemo(
    () => applications.filter(a => a.decision.decision === 'decline'),
    [applications]
  );

  const insights = useMemo(
    () => (analysisRun ? generateGapAnalysis(applications) : []),
    [analysisRun, applications]
  );

  const topDrivers = useMemo(
    () => (analysisRun ? getTopDeclineDrivers(applications) : []),
    [analysisRun, applications]
  );

  function runAnalysis() {
    setLoading(true);
    // Simulate an async AI analysis call
    setTimeout(() => {
      setAnalysisRun(true);
      setLoading(false);
    }, 1200);
  }

  if (!analysisRun) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-indigo-500" size={24} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-2">AI Gap Analysis</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-2">
          Analyse the <strong>{declined.length} declined applications</strong> in the current view to identify
          patterns, opportunities, and product design recommendations.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Powered by Claude AI — analyses decline drivers, near-misses, and identifies underserved member segments.
        </p>
        <Button
          variant="primary"
          icon={Sparkles}
          loading={loading}
          onClick={runAnalysis}
          disabled={declined.length === 0}
        >
          {loading ? 'Analysing…' : 'Run Gap Analysis'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-500" />
            Gap Analysis Results
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on {declined.length} declined applications out of {applications.length} total
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={() => {
            setAnalysisRun(false);
            setTimeout(runAnalysis, 100);
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Top decline drivers chart */}
      {topDrivers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Top Decline Drivers
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={topDrivers}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={160}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value} applications`, 'Count']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topDrivers.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name.startsWith('Hard Decline') ? '#f43f5e' : '#f97316'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const style = INSIGHT_STYLES[insight.type];
          const Icon = style.icon;
          return (
            <div
              key={i}
              className={clsx('rounded-xl border p-4', style.bg)}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <Icon size={16} className={style.iconClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-slate-800">{insight.title}</h4>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', style.badgeClass)}>
                      {style.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {insight.affectedCount} applications ({insight.affectedPct}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>

                  {insight.recommendation && (
                    <div className="mt-3 flex items-start gap-2 bg-white/70 rounded-lg px-3 py-2.5 border border-white">
                      <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-indigo-700">Recommendation: </span>
                        {insight.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No significant patterns detected in the current dataset.</p>
        </div>
      )}
    </div>
  );
}
