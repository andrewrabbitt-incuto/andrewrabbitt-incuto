import React, { useMemo } from 'react';
import { ChevronDown, BookOpen, Plus } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { ScorecardEditor } from './ScorecardEditor';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { batchEvaluate } from '../../lib/scoring-engine';
import { MOCK_APPLICATIONS } from '../../lib/mock-data';

export function RulesEnginePage() {
  const {
    products,
    scorecards,
    selectedProductId,
    setSelectedProductId,
    activeScorecard,
    updateScorecard,
  } = useAppContext();

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Live preview stats against last 30 applications for this product
  const previewStats = useMemo(() => {
    if (!activeScorecard) return null;
    const productApps = MOCK_APPLICATIONS.filter(a => a.productId === selectedProductId).slice(0, 50);
    const withDecisions = batchEvaluate(productApps, activeScorecard);
    const counts = { approve: 0, refer: 0, decline: 0 };
    withDecisions.forEach(a => counts[a.decision.decision]++);
    const total = withDecisions.length || 1;
    return {
      ...counts,
      approveRate: Math.round((counts.approve / total) * 100),
      referRate: Math.round((counts.refer / total) * 100),
      declineRate: Math.round((counts.decline / total) * 100),
      total: withDecisions.length,
    };
  }, [activeScorecard, selectedProductId]);

  const otherScorecards = scorecards.filter(
    sc => sc.productId === selectedProductId && sc.status !== 'live'
  );

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Product selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Product
            </label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-3 gap-x-6 gap-y-1">
              <ProductDetail label="Type" value={selectedProduct.type} />
              <ProductDetail label="Amount range" value={`£${selectedProduct.minAmount.toLocaleString()} – £${selectedProduct.maxAmount.toLocaleString()}`} />
              <ProductDetail label="APR" value={`${selectedProduct.apr}%`} />
              <ProductDetail label="Term" value={`${selectedProduct.minTerm}–${selectedProduct.maxTerm} months`} />
            </div>
          )}

          {previewStats && (
            <div className="flex gap-4 shrink-0">
              <PreviewStat label="Approve" value={`${previewStats.approveRate}%`} color="emerald" />
              <PreviewStat label="Refer" value={`${previewStats.referRate}%`} color="amber" />
              <PreviewStat label="Decline" value={`${previewStats.declineRate}%`} color="rose" />
              <div className="self-end">
                <p className="text-xs text-slate-400">based on last {previewStats.total} applications</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active scorecard editor */}
      {activeScorecard ? (
        <ScorecardEditor
          scorecard={activeScorecard}
          onChange={updateScorecard}
        />
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-600">No active scorecard</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            There is no live scorecard for this product. Create one to begin decisioning.
          </p>
          <Button variant="primary" icon={Plus}>
            Create Scorecard
          </Button>
        </div>
      )}

      {/* Other scorecards (draft / testing / archived) */}
      {otherScorecards.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Other Versions
          </h3>
          <div className="grid gap-3">
            {otherScorecards.map(sc => (
              <div
                key={sc.id}
                className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={sc.status} />
                  <span className="text-sm font-medium text-slate-700">{sc.name}</span>
                  <span className="text-xs text-slate-400">v{sc.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Updated {new Date(sc.updatedAt).toLocaleDateString('en-GB')}
                  </span>
                  <Button variant="ghost" size="sm">
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-slate-400">{label}: </span>
      <span className="text-xs font-medium text-slate-700">{value}</span>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'emerald' | 'amber' | 'rose';
}) {
  const styles = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    rose: 'text-rose-700 bg-rose-50 border-rose-100',
  };
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${styles[color]}`}>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}
