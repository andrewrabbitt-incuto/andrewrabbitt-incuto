import type { DataField } from '../types';

export const DATA_FIELDS: DataField[] = [
  // Member Data
  {
    id: 'member.currentBalance',
    label: 'Current Account Balance',
    source: 'member',
    fieldType: 'number',
    description: 'Current account balance held with the credit union',
    unit: '£',
    category: 'Account',
  },
  {
    id: 'member.savingsBalance',
    label: 'Savings Balance',
    source: 'member',
    fieldType: 'number',
    description: 'Total savings held with the credit union',
    unit: '£',
    category: 'Account',
  },
  {
    id: 'member.monthsAsMember',
    label: 'Months as Member',
    source: 'member',
    fieldType: 'number',
    description: 'Number of months the applicant has been a member',
    unit: 'months',
    category: 'Membership',
  },
  {
    id: 'member.paymentHistoryScore',
    label: 'Payment History Score',
    source: 'member',
    fieldType: 'number',
    description: 'Internal score based on payment history (0–100)',
    unit: '/100',
    category: 'Behaviour',
  },
  {
    id: 'member.arrearsCount12m',
    label: 'Arrears Count (12 months)',
    source: 'member',
    fieldType: 'number',
    description: 'Number of times in arrears in the last 12 months',
    unit: 'times',
    category: 'Behaviour',
  },
  {
    id: 'member.existingLoanBalance',
    label: 'Existing Loan Balance',
    source: 'member',
    fieldType: 'number',
    description: 'Outstanding balance of existing loans with the credit union',
    unit: '£',
    category: 'Lending',
  },
  {
    id: 'member.dtiRatio',
    label: 'Debt-to-Income Ratio',
    source: 'member',
    fieldType: 'number',
    description: 'Ratio of total monthly debt payments to monthly income',
    unit: '%',
    category: 'Affordability',
  },

  // Bureau / TransUnion Data
  {
    id: 'bureau.creditScore',
    label: 'TransUnion Credit Score',
    source: 'bureau',
    fieldType: 'number',
    description: 'TransUnion credit score (0–710)',
    unit: '/710',
    category: 'Credit',
  },
  {
    id: 'bureau.ccjCount',
    label: 'CCJ Count',
    source: 'bureau',
    fieldType: 'number',
    description: 'Number of County Court Judgements',
    unit: 'CCJs',
    category: 'Credit',
  },
  {
    id: 'bureau.bankruptcy',
    label: 'Bankruptcy Flag',
    source: 'bureau',
    fieldType: 'boolean',
    description: 'Has the applicant ever been declared bankrupt',
    category: 'Credit',
  },
  {
    id: 'bureau.defaultsCount',
    label: 'Defaults Count',
    source: 'bureau',
    fieldType: 'number',
    description: 'Number of credit defaults',
    unit: 'defaults',
    category: 'Credit',
  },
  {
    id: 'bureau.missedPayments6m',
    label: 'Missed Payments (6 months)',
    source: 'bureau',
    fieldType: 'number',
    description: 'Number of missed payments in the last 6 months across all credit',
    unit: 'payments',
    category: 'Credit',
  },
  {
    id: 'bureau.totalDebt',
    label: 'Total External Debt',
    source: 'bureau',
    fieldType: 'number',
    description: 'Total outstanding external debt across all credit facilities',
    unit: '£',
    category: 'Credit',
  },
  {
    id: 'bureau.creditUtilisation',
    label: 'Credit Utilisation',
    source: 'bureau',
    fieldType: 'number',
    description: 'Percentage of available revolving credit currently used',
    unit: '%',
    category: 'Credit',
  },
  {
    id: 'bureau.idVerified',
    label: 'ID Verified',
    source: 'bureau',
    fieldType: 'boolean',
    description: 'Has the applicant passed TransUnion ID verification',
    category: 'Identity',
  },
  {
    id: 'bureau.fraudScore',
    label: 'Fraud Risk Score',
    source: 'bureau',
    fieldType: 'number',
    description: 'Fraud risk score from TransUnion (0=low, 100=high risk)',
    unit: '/100',
    category: 'Identity',
  },

  // Open Banking Data
  {
    id: 'ob.monthlyIncome',
    label: 'Monthly Income (Open Banking)',
    source: 'openbanking',
    fieldType: 'number',
    description: 'Verified monthly income from categorised open banking data',
    unit: '£',
    category: 'Income',
  },
  {
    id: 'ob.monthlyExpenditure',
    label: 'Monthly Expenditure (Open Banking)',
    source: 'openbanking',
    fieldType: 'number',
    description: 'Total monthly expenditure from open banking',
    unit: '£',
    category: 'Expenditure',
  },
  {
    id: 'ob.disposableIncome',
    label: 'Disposable Income',
    source: 'openbanking',
    fieldType: 'number',
    description: 'Monthly disposable income after all expenditure',
    unit: '£',
    category: 'Affordability',
  },
  {
    id: 'ob.gamblingTransactions3m',
    label: 'Gambling Transactions (3 months)',
    source: 'openbanking',
    fieldType: 'number',
    description: 'Number of gambling-related transactions in last 3 months',
    unit: 'transactions',
    category: 'Risk',
  },
  {
    id: 'ob.incomeStabilityScore',
    label: 'Income Stability Score',
    source: 'openbanking',
    fieldType: 'number',
    description: 'Score representing income regularity and stability (0–100)',
    unit: '/100',
    category: 'Income',
  },
  {
    id: 'ob.housingCosts',
    label: 'Monthly Housing Costs',
    source: 'openbanking',
    fieldType: 'number',
    description: 'Monthly rent or mortgage payments identified from open banking',
    unit: '£',
    category: 'Expenditure',
  },
  {
    id: 'ob.incomeVerified',
    label: 'Income Verified',
    source: 'openbanking',
    fieldType: 'boolean',
    description: 'Has income been verified via open banking',
    category: 'Income',
  },
];

export const FIELD_MAP = new Map(DATA_FIELDS.map(f => [f.id, f]));

export const OPERATORS_FOR_TYPE: Record<string, Array<{ value: string; label: string }>> = {
  number: [
    { value: 'gt', label: 'is greater than (>)' },
    { value: 'gte', label: 'is greater than or equal to (≥)' },
    { value: 'lt', label: 'is less than (<)' },
    { value: 'lte', label: 'is less than or equal to (≤)' },
    { value: 'eq', label: 'is equal to (=)' },
    { value: 'neq', label: 'is not equal to (≠)' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' },
  ],
};

export const OPERATOR_LABELS: Record<string, string> = {
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  eq: '=',
  neq: '≠',
  is_true: 'is true',
  is_false: 'is false',
};

export function getFieldsBySource(source: string) {
  return DATA_FIELDS.filter(f => f.source === source);
}

export function getField(id: string): DataField | undefined {
  return FIELD_MAP.get(id);
}
