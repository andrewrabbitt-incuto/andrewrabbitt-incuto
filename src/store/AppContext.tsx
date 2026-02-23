import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Scorecard, Product, ApplicationWithDecision, SimulationPeriod } from '../types';
import { SCORECARDS, PRODUCTS, MOCK_APPLICATIONS } from '../lib/mock-data';
import { batchEvaluate } from '../lib/scoring-engine';

interface AppContextValue {
  // Products & Scorecards
  products: Product[];
  scorecards: Scorecard[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  activeScorecard: Scorecard | undefined;
  updateScorecard: (sc: Scorecard) => void;

  // Applications with decisions
  applications: ApplicationWithDecision[];

  // Loan Review
  selectedApplicationId: string | null;
  setSelectedApplicationId: (id: string | null) => void;

  // Simulation
  simulationPeriod: SimulationPeriod;
  setSimulationPeriod: (p: SimulationPeriod) => void;
  proposedScorecard: Scorecard | null;
  setProposedScorecard: (sc: Scorecard | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products] = useState<Product[]>(PRODUCTS);
  const [scorecards, setScorecards] = useState<Scorecard[]>(SCORECARDS);
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [simulationPeriod, setSimulationPeriod] = useState<SimulationPeriod>('month');
  const [proposedScorecard, setProposedScorecard] = useState<Scorecard | null>(null);

  const activeScorecard = useMemo(
    () => scorecards.find(sc => sc.productId === selectedProductId && sc.status === 'live'),
    [scorecards, selectedProductId]
  );

  const applications = useMemo<ApplicationWithDecision[]>(() => {
    if (!activeScorecard) return [];
    // Evaluate all applications against any matching scorecard
    return MOCK_APPLICATIONS.map(app => {
      const sc = scorecards.find(
        s => s.productId === app.productId && s.status === 'live'
      );
      if (!sc) {
        return {
          ...app,
          decision: {
            applicationId: app.id,
            scorecardId: '',
            scorecardVersion: 0,
            decision: 'refer' as const,
            finalScore: 0,
            baseScore: 0,
            scoreAdjustments: 0,
            ruleResults: [],
            decidedAt: app.appliedAt,
          },
        };
      }
      const [withDecision] = batchEvaluate([app], sc);
      return withDecision;
    });
  }, [scorecards, activeScorecard]);

  function updateScorecard(updated: Scorecard) {
    setScorecards(prev => prev.map(sc => (sc.id === updated.id ? updated : sc)));
  }

  return (
    <AppContext.Provider
      value={{
        products,
        scorecards,
        selectedProductId,
        setSelectedProductId,
        activeScorecard,
        updateScorecard,
        applications,
        selectedApplicationId,
        setSelectedApplicationId,
        simulationPeriod,
        setSimulationPeriod,
        proposedScorecard,
        setProposedScorecard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
