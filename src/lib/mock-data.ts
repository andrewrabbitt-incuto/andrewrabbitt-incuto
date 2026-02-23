import type {
  Product,
  Scorecard,
  LoanApplication,
  MemberData,
  BureauData,
  OpenBankingData,
} from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Personal Loan',
    type: 'Personal',
    minAmount: 500,
    maxAmount: 10000,
    minTerm: 6,
    maxTerm: 60,
    apr: 12.9,
  },
  {
    id: 'prod-002',
    name: 'Car Loan',
    type: 'Secured',
    minAmount: 2000,
    maxAmount: 25000,
    minTerm: 12,
    maxTerm: 84,
    apr: 9.9,
  },
  {
    id: 'prod-003',
    name: 'Credit Builder',
    type: 'Starter',
    minAmount: 250,
    maxAmount: 1500,
    minTerm: 6,
    maxTerm: 24,
    apr: 18.9,
  },
  {
    id: 'prod-004',
    name: 'Home Improvement',
    type: 'Personal',
    minAmount: 1000,
    maxAmount: 20000,
    minTerm: 12,
    maxTerm: 84,
    apr: 11.4,
  },
];

export const SCORECARDS: Scorecard[] = [
  {
    id: 'sc-001',
    name: 'Personal Loan — Standard',
    productId: 'prod-001',
    version: 3,
    status: 'live',
    baseScore: 500,
    thresholds: { approveAbove: 650, declineBelow: 450 },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
    description: 'Primary scorecard for personal loan applicants.',
    rules: [
      {
        id: 'r-001',
        name: 'ID Not Verified',
        fieldId: 'bureau.idVerified',
        operator: 'is_false',
        value: false,
        action: 'hard_decline',
        enabled: true,
        description: 'Applicant must pass TransUnion ID check',
      },
      {
        id: 'r-002',
        name: 'Bankruptcy Flag',
        fieldId: 'bureau.bankruptcy',
        operator: 'is_true',
        value: true,
        action: 'hard_decline',
        enabled: true,
        description: 'Decline any applicant with a bankruptcy marker',
      },
      {
        id: 'r-003',
        name: 'Excessive CCJs',
        fieldId: 'bureau.ccjCount',
        operator: 'gt',
        value: 2,
        action: 'hard_decline',
        enabled: true,
        description: 'More than 2 active CCJs is an automatic decline',
      },
      {
        id: 'r-004',
        name: 'High Fraud Risk',
        fieldId: 'bureau.fraudScore',
        operator: 'gt',
        value: 70,
        action: 'hard_decline',
        enabled: true,
        description: 'Fraud risk score above 70 triggers a decline',
      },
      {
        id: 'r-005',
        name: 'Strong Credit Score',
        fieldId: 'bureau.creditScore',
        operator: 'gte',
        value: 580,
        action: 'score',
        scoreAdjustment: 150,
        enabled: true,
        description: 'Good TransUnion score adds significant points',
      },
      {
        id: 'r-006',
        name: 'Poor Credit Score',
        fieldId: 'bureau.creditScore',
        operator: 'lt',
        value: 350,
        action: 'score',
        scoreAdjustment: -100,
        enabled: true,
        description: 'Very low credit score penalises the application',
      },
      {
        id: 'r-007',
        name: 'Clean Arrears History',
        fieldId: 'member.arrearsCount12m',
        operator: 'eq',
        value: 0,
        action: 'score',
        scoreAdjustment: 75,
        enabled: true,
        description: 'No arrears in 12 months adds positive score',
      },
      {
        id: 'r-008',
        name: 'Multiple Arrears',
        fieldId: 'member.arrearsCount12m',
        operator: 'gt',
        value: 2,
        action: 'score',
        scoreAdjustment: -75,
        enabled: true,
        description: 'More than 2 arrears incidents penalises score',
      },
      {
        id: 'r-009',
        name: 'Strong Payment History',
        fieldId: 'member.paymentHistoryScore',
        operator: 'gte',
        value: 80,
        action: 'score',
        scoreAdjustment: 100,
        enabled: true,
        description: 'Excellent internal payment history boosts score',
      },
      {
        id: 'r-010',
        name: 'Low Debt-to-Income',
        fieldId: 'member.dtiRatio',
        operator: 'lt',
        value: 30,
        action: 'score',
        scoreAdjustment: 75,
        enabled: true,
        description: 'Low DTI ratio indicates strong affordability',
      },
      {
        id: 'r-011',
        name: 'High Debt-to-Income',
        fieldId: 'member.dtiRatio',
        operator: 'gt',
        value: 50,
        action: 'score',
        scoreAdjustment: -100,
        enabled: true,
        description: 'High DTI ratio indicates affordability stress',
      },
      {
        id: 'r-012',
        name: 'Long-standing Member',
        fieldId: 'member.monthsAsMember',
        operator: 'gte',
        value: 24,
        action: 'score',
        scoreAdjustment: 50,
        enabled: true,
        description: 'Members of 2+ years demonstrate loyalty',
      },
      {
        id: 'r-013',
        name: 'Open Banking Income Verified',
        fieldId: 'ob.incomeVerified',
        operator: 'is_true',
        value: true,
        action: 'score',
        scoreAdjustment: 50,
        enabled: true,
        description: 'Verified income via open banking adds confidence',
      },
      {
        id: 'r-014',
        name: 'Gambling Concerns',
        fieldId: 'ob.gamblingTransactions3m',
        operator: 'gt',
        value: 10,
        action: 'score',
        scoreAdjustment: -75,
        enabled: true,
        description: 'High gambling activity raises affordability concern',
      },
      {
        id: 'r-015',
        name: 'Positive Disposable Income',
        fieldId: 'ob.disposableIncome',
        operator: 'gte',
        value: 200,
        action: 'score',
        scoreAdjustment: 50,
        enabled: true,
        description: 'Positive monthly disposable income after all costs',
      },
      {
        id: 'r-016',
        name: 'Significant Savings',
        fieldId: 'member.savingsBalance',
        operator: 'gte',
        value: 500,
        action: 'score',
        scoreAdjustment: 25,
        enabled: true,
        description: 'Savings buffer demonstrates financial resilience',
      },
    ],
  },
  {
    id: 'sc-002',
    name: 'Car Loan — Standard',
    productId: 'prod-002',
    version: 2,
    status: 'live',
    baseScore: 500,
    thresholds: { approveAbove: 680, declineBelow: 480 },
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-10-05T11:00:00Z',
    description: 'Scorecard for secured car loan applicants. Higher thresholds due to larger amounts.',
    rules: [
      {
        id: 'r-c01',
        name: 'ID Not Verified',
        fieldId: 'bureau.idVerified',
        operator: 'is_false',
        value: false,
        action: 'hard_decline',
        enabled: true,
      },
      {
        id: 'r-c02',
        name: 'Bankruptcy Flag',
        fieldId: 'bureau.bankruptcy',
        operator: 'is_true',
        value: true,
        action: 'hard_decline',
        enabled: true,
      },
      {
        id: 'r-c03',
        name: 'CCJs Present',
        fieldId: 'bureau.ccjCount',
        operator: 'gt',
        value: 0,
        action: 'hard_decline',
        enabled: true,
        description: 'No CCJs permitted for car loan',
      },
      {
        id: 'r-c04',
        name: 'Strong Credit Score',
        fieldId: 'bureau.creditScore',
        operator: 'gte',
        value: 600,
        action: 'score',
        scoreAdjustment: 175,
        enabled: true,
      },
      {
        id: 'r-c05',
        name: 'Clean Arrears History',
        fieldId: 'member.arrearsCount12m',
        operator: 'eq',
        value: 0,
        action: 'score',
        scoreAdjustment: 80,
        enabled: true,
      },
      {
        id: 'r-c06',
        name: 'Strong Payment History',
        fieldId: 'member.paymentHistoryScore',
        operator: 'gte',
        value: 85,
        action: 'score',
        scoreAdjustment: 100,
        enabled: true,
      },
      {
        id: 'r-c07',
        name: 'Low Debt-to-Income',
        fieldId: 'member.dtiRatio',
        operator: 'lt',
        value: 35,
        action: 'score',
        scoreAdjustment: 80,
        enabled: true,
      },
      {
        id: 'r-c08',
        name: 'Long-standing Member',
        fieldId: 'member.monthsAsMember',
        operator: 'gte',
        value: 36,
        action: 'score',
        scoreAdjustment: 60,
        enabled: true,
      },
    ],
  },
  {
    id: 'sc-003',
    name: 'Credit Builder — Entry',
    productId: 'prod-003',
    version: 1,
    status: 'live',
    baseScore: 500,
    thresholds: { approveAbove: 550, declineBelow: 400 },
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
    description: 'Accessible product for members building credit. Relaxed criteria.',
    rules: [
      {
        id: 'r-b01',
        name: 'ID Not Verified',
        fieldId: 'bureau.idVerified',
        operator: 'is_false',
        value: false,
        action: 'hard_decline',
        enabled: true,
      },
      {
        id: 'r-b02',
        name: 'Bankruptcy Flag',
        fieldId: 'bureau.bankruptcy',
        operator: 'is_true',
        value: true,
        action: 'hard_decline',
        enabled: true,
      },
      {
        id: 'r-b03',
        name: 'High Fraud Risk',
        fieldId: 'bureau.fraudScore',
        operator: 'gt',
        value: 75,
        action: 'hard_decline',
        enabled: true,
      },
      {
        id: 'r-b04',
        name: 'Member Payment History',
        fieldId: 'member.paymentHistoryScore',
        operator: 'gte',
        value: 60,
        action: 'score',
        scoreAdjustment: 100,
        enabled: true,
      },
      {
        id: 'r-b05',
        name: 'Membership Loyalty',
        fieldId: 'member.monthsAsMember',
        operator: 'gte',
        value: 6,
        action: 'score',
        scoreAdjustment: 75,
        enabled: true,
      },
      {
        id: 'r-b06',
        name: 'Positive Disposable Income',
        fieldId: 'ob.disposableIncome',
        operator: 'gt',
        value: 100,
        action: 'score',
        scoreAdjustment: 50,
        enabled: true,
      },
    ],
  },
];

// ─── Mock Application Generator ────────────────────────────────────────────────

const FIRST_NAMES = [
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Claire',
  'Thomas', 'Rachel', 'Daniel', 'Sophie', 'Mark', 'Helen', 'Andrew', 'Karen',
  'Paul', 'Laura', 'John', 'Victoria', 'Chris', 'Natalie', 'Gary', 'Deborah',
  'Steven', 'Patricia', 'Kevin', 'Angela', 'Brian', 'Tracey', 'Peter', 'Sandra',
];

const LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson',
  'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson',
  'White', 'Watson', 'Jackson', 'Wright', 'Green', 'Harris', 'Cooper', 'King',
  'Lee', 'Martin', 'Clarke', 'Scott', 'Turner', 'Hill', 'Moore', 'Ward',
];

const PURPOSES = [
  'Debt Consolidation', 'Car Purchase', 'Home Improvement', 'Holiday',
  'Wedding', 'Essential Appliances', 'Education', 'Medical',
  'Business Start-up', 'Emergency', 'Christmas', 'Moving Costs',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateApplication(index: number, daysAgo: number): LoanApplication {
  const rand = seededRandom(index * 7919 + 31337);

  const firstName = pick(FIRST_NAMES, rand);
  const lastName = pick(LAST_NAMES, rand);
  const memberName = `${firstName} ${lastName}`;

  const product = pick(PRODUCTS.slice(0, 3), rand);
  const amount = Math.round(
    (product.minAmount + rand() * (product.maxAmount - product.minAmount)) / 100
  ) * 100;
  const termOptions = [6, 12, 18, 24, 36, 48, 60].filter(
    t => t >= product.minTerm && t <= product.maxTerm
  );
  const term = pick(termOptions, rand);

  const appliedDate = new Date();
  appliedDate.setDate(appliedDate.getDate() - daysAgo);
  appliedDate.setHours(Math.floor(rand() * 9) + 8, Math.floor(rand() * 60), 0, 0);

  // Generate realistic member data
  const monthsAsMember = Math.round(rand() * 84) + 1;
  const paymentHistoryScore = Math.round(50 + rand() * 50);
  const arrearsCount12m = rand() < 0.65 ? 0 : (rand() < 0.7 ? 1 : (rand() < 0.7 ? 2 : 3));
  const existingLoanBalance = rand() < 0.4 ? Math.round(rand() * 5000 / 100) * 100 : 0;
  const savingsBalance = Math.round(rand() * 3000 / 50) * 50;
  const dtiRatio = Math.round(20 + rand() * 50);
  const currentBalance = Math.round((100 + rand() * 2000) / 10) * 10;

  const memberData: MemberData = {
    currentBalance,
    savingsBalance,
    monthsAsMember,
    paymentHistoryScore,
    arrearsCount12m,
    existingLoanBalance,
    dtiRatio,
    employmentStatus: rand() < 0.72 ? 'employed' : rand() < 0.5 ? 'self_employed' : rand() < 0.5 ? 'retired' : 'unemployed',
  };

  // Generate bureau data (correlated with member data)
  const creditScore = Math.round(200 + rand() * 510);
  const ccjCount = rand() < 0.75 ? 0 : (rand() < 0.65 ? 1 : (rand() < 0.5 ? 2 : 3));
  const bankruptcy = rand() < 0.03;
  const defaultsCount = rand() < 0.7 ? 0 : (rand() < 0.6 ? 1 : 2);
  const missedPayments6m = rand() < 0.6 ? 0 : Math.ceil(rand() * 4);
  const totalDebt = Math.round((existingLoanBalance + rand() * 15000) / 100) * 100;
  const creditUtilisation = Math.round(rand() * 95);
  const idVerified = rand() > 0.05;
  const fraudScore = Math.round(rand() < 0.9 ? rand() * 40 : 60 + rand() * 40);

  const bureauData: BureauData = {
    creditScore,
    ccjCount,
    bankruptcy,
    defaultsCount,
    missedPayments6m,
    totalDebt,
    creditUtilisation,
    idVerified,
    fraudScore,
  };

  // Generate open banking data
  const monthlyIncome = Math.round((1200 + rand() * 3500) / 50) * 50;
  const housingCosts = Math.round((300 + rand() * 900) / 50) * 50;
  const monthlyExpenditure = Math.round((housingCosts + rand() * monthlyIncome * 0.7) / 50) * 50;
  const disposableIncome = monthlyIncome - monthlyExpenditure;
  const gamblingTransactions3m = rand() < 0.65 ? 0 : (rand() < 0.5 ? Math.ceil(rand() * 5) : Math.ceil(rand() * 20));
  const incomeStabilityScore = Math.round(50 + rand() * 50);
  const incomeVerified = rand() > 0.15;

  const openBankingData: OpenBankingData = {
    monthlyIncome,
    monthlyExpenditure,
    disposableIncome,
    gamblingTransactions3m,
    incomeStabilityScore,
    housingCosts,
    incomeVerified,
  };

  return {
    id: `app-${String(index).padStart(4, '0')}`,
    memberId: `mem-${String(Math.floor(rand() * 9000) + 1000)}`,
    memberName,
    productId: product.id,
    productName: product.name,
    amount,
    term,
    purpose: pick(PURPOSES, rand),
    appliedAt: appliedDate.toISOString(),
    memberData,
    bureauData,
    openBankingData,
  };
}

// Generate 200 applications spread over the last year
export const MOCK_APPLICATIONS: LoanApplication[] = Array.from({ length: 200 }, (_, i) => {
  const daysAgo = Math.floor((i / 200) * 365);
  return generateApplication(i + 1, daysAgo);
});

// Sort by date descending (most recent first)
MOCK_APPLICATIONS.sort(
  (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
);
