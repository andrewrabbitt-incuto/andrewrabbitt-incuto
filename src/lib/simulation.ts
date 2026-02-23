import type { LoanApplication, Scorecard, SimulationPeriod, SimulationResult } from '../types';
import { evaluateApplication } from './scoring-engine';
import { MOCK_APPLICATIONS } from './mock-data';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

function getPeriodStart(period: SimulationPeriod): Date {
  const now = new Date();
  switch (period) {
    case 'day':   return subDays(now, 1);
    case 'week':  return subWeeks(now, 1);
    case 'month': return subMonths(now, 1);
    case 'year':  return subYears(now, 1);
  }
}

function getPeriodApplications(period: SimulationPeriod): LoanApplication[] {
  const start = getPeriodStart(period);
  return MOCK_APPLICATIONS.filter(a => new Date(a.appliedAt) >= start);
}

function groupByDate(apps: LoanApplication[], period: SimulationPeriod): string[] {
  const dates = new Set<string>();
  const fmt = period === 'year' ? 'MMM yy' : period === 'month' ? 'dd MMM' : 'HH:mm';
  apps.forEach(a => dates.add(format(new Date(a.appliedAt), fmt)));
  return Array.from(dates).sort();
}

export function runSimulation(
  period: SimulationPeriod,
  baseline: Scorecard,
  proposed: Scorecard
): SimulationResult {
  const apps = getPeriodApplications(period);

  const baselineDecisions = apps.map(app => ({
    app,
    decision: evaluateApplication(app, baseline),
  }));
  const proposedDecisions = apps.map(app => ({
    app,
    decision: evaluateApplication(app, proposed),
  }));

  // Count baseline
  const baselineCounts = { approve: 0, refer: 0, decline: 0 };
  baselineDecisions.forEach(d => baselineCounts[d.decision.decision]++);

  // Count proposed
  const proposedCounts = { approve: 0, refer: 0, decline: 0 };
  proposedDecisions.forEach(d => proposedCounts[d.decision.decision]++);

  const total = apps.length || 1;

  // Find changed decisions
  const changes = baselineDecisions
    .map((bd, i) => {
      const pd = proposedDecisions[i];
      if (bd.decision.decision === pd.decision.decision) return null;
      return {
        applicationId: bd.app.id,
        memberName: bd.app.memberName,
        amount: bd.app.amount,
        baselineDecision: bd.decision.decision,
        proposedDecision: pd.decision.decision,
        baselineScore: bd.decision.finalScore,
        proposedScore: pd.decision.finalScore,
      };
    })
    .filter(Boolean) as SimulationResult['changes'];

  // Build daily breakdown
  const dateFormat = period === 'year' ? 'MMM yy' : period === 'month' ? 'dd MMM' : 'HH:mm';
  const dateGroups: Record<string, {
    approve: number; refer: number; decline: number;
    propApprove: number; propRefer: number; propDecline: number;
  }> = {};

  baselineDecisions.forEach((bd, i) => {
    const key = format(new Date(bd.app.appliedAt), dateFormat);
    if (!dateGroups[key]) {
      dateGroups[key] = { approve: 0, refer: 0, decline: 0, propApprove: 0, propRefer: 0, propDecline: 0 };
    }
    dateGroups[key][bd.decision.decision]++;
    const pd = proposedDecisions[i];
    if (pd.decision.decision === 'approve') dateGroups[key].propApprove++;
    else if (pd.decision.decision === 'refer') dateGroups[key].propRefer++;
    else dateGroups[key].propDecline++;
  });

  const dailyBreakdown = Object.entries(dateGroups).map(([date, counts]) => ({
    date,
    ...counts,
  }));

  return {
    period,
    totalApplications: apps.length,
    dailyBreakdown,
    baseline: {
      ...baselineCounts,
      approveRate: Math.round((baselineCounts.approve / total) * 100),
      referRate: Math.round((baselineCounts.refer / total) * 100),
      declineRate: Math.round((baselineCounts.decline / total) * 100),
    },
    proposed: {
      ...proposedCounts,
      approveRate: Math.round((proposedCounts.approve / total) * 100),
      referRate: Math.round((proposedCounts.refer / total) * 100),
      declineRate: Math.round((proposedCounts.decline / total) * 100),
    },
    changes,
  };
}
