export type DataSource = 'member' | 'bureau' | 'openbanking';
export type FieldType = 'number' | 'boolean';
export type Operator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'is_true' | 'is_false';
export type RuleAction = 'hard_decline' | 'score';
export type Decision = 'approve' | 'refer' | 'decline';
export type ScorecardStatus = 'draft' | 'testing' | 'live' | 'archived';
export type SimulationPeriod = 'day' | 'week' | 'month' | 'year';

export interface DataField {
  id: string;
  label: string;
  source: DataSource;
  fieldType: FieldType;
  description: string;
  unit?: string;
  category?: string;
}

export interface Rule {
  id: string;
  name: string;
  fieldId: string;
  operator: Operator;
  value: number | boolean;
  action: RuleAction;
  scoreAdjustment?: number;
  enabled: boolean;
  description?: string;
}

export interface ScoreThresholds {
  approveAbove: number;
  declineBelow: number;
}

export interface Scorecard {
  id: string;
  name: string;
  productId: string;
  version: number;
  status: ScorecardStatus;
  rules: Rule[];
  baseScore: number;
  thresholds: ScoreThresholds;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  apr: number;
}

export interface MemberData {
  currentBalance: number;
  savingsBalance: number;
  monthsAsMember: number;
  paymentHistoryScore: number;
  arrearsCount12m: number;
  existingLoanBalance: number;
  dtiRatio: number;
  employmentStatus: string;
}

export interface BureauData {
  creditScore: number;
  ccjCount: number;
  bankruptcy: boolean;
  defaultsCount: number;
  missedPayments6m: number;
  totalDebt: number;
  creditUtilisation: number;
  idVerified: boolean;
  fraudScore: number;
}

export interface OpenBankingData {
  monthlyIncome: number;
  monthlyExpenditure: number;
  disposableIncome: number;
  gamblingTransactions3m: number;
  incomeStabilityScore: number;
  housingCosts: number;
  incomeVerified: boolean;
}

export interface LoanApplication {
  id: string;
  memberId: string;
  memberName: string;
  productId: string;
  productName: string;
  amount: number;
  term: number;
  purpose: string;
  appliedAt: string;
  memberData: MemberData;
  bureauData: BureauData;
  openBankingData: OpenBankingData;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  fieldId: string;
  triggered: boolean;
  action: RuleAction;
  scoreAdjustment?: number;
  actualValue: number | boolean;
  operator: Operator;
  thresholdValue: number | boolean;
  reason: string;
}

export interface LoanDecision {
  applicationId: string;
  scorecardId: string;
  scorecardVersion: number;
  decision: Decision;
  finalScore: number;
  baseScore: number;
  scoreAdjustments: number;
  ruleResults: RuleResult[];
  hardDeclineRule?: string;
  decidedAt: string;
}

export interface ApplicationWithDecision extends LoanApplication {
  decision: LoanDecision;
}

export interface GapAnalysisInsight {
  type: 'pattern' | 'opportunity' | 'risk';
  title: string;
  description: string;
  affectedCount: number;
  affectedPct: number;
  recommendation?: string;
  ruleId?: string;
}

export interface SimulationResult {
  period: SimulationPeriod;
  totalApplications: number;
  dailyBreakdown: Array<{
    date: string;
    approve: number;
    refer: number;
    decline: number;
    propApprove: number;
    propRefer: number;
    propDecline: number;
  }>;
  baseline: {
    approveCount: number;
    referCount: number;
    declineCount: number;
    approveRate: number;
    referRate: number;
    declineRate: number;
  };
  proposed: {
    approveCount: number;
    referCount: number;
    declineCount: number;
    approveRate: number;
    referRate: number;
    declineRate: number;
  };
  changes: Array<{
    applicationId: string;
    memberName: string;
    amount: number;
    baselineDecision: Decision;
    proposedDecision: Decision;
    baselineScore: number;
    proposedScore: number;
  }>;
}
