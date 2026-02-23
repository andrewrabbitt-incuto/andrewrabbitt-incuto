import type {
  LoanApplication,
  Scorecard,
  Rule,
  RuleResult,
  LoanDecision,
  Decision,
  Operator,
} from '../types';

function getFieldValue(application: LoanApplication, fieldId: string): number | boolean {
  const parts = fieldId.split('.');
  const [source, key] = parts;

  if (source === 'member') {
    const m = application.memberData as Record<string, unknown>;
    return (m[key] ?? 0) as number | boolean;
  }
  if (source === 'bureau') {
    const b = application.bureauData as Record<string, unknown>;
    return (b[key] ?? 0) as number | boolean;
  }
  if (source === 'ob') {
    const o = application.openBankingData as Record<string, unknown>;
    return (o[key] ?? 0) as number | boolean;
  }
  return 0;
}

function evaluateCondition(
  operator: Operator,
  actual: number | boolean,
  threshold: number | boolean
): boolean {
  switch (operator) {
    case 'gt':
      return (actual as number) > (threshold as number);
    case 'gte':
      return (actual as number) >= (threshold as number);
    case 'lt':
      return (actual as number) < (threshold as number);
    case 'lte':
      return (actual as number) <= (threshold as number);
    case 'eq':
      return actual === threshold;
    case 'neq':
      return actual !== threshold;
    case 'is_true':
      return actual === true;
    case 'is_false':
      return actual === false;
    default:
      return false;
  }
}

function buildRuleReason(rule: Rule, triggered: boolean, actual: number | boolean): string {
  if (!triggered) return `Not triggered (value: ${formatValue(actual)})`;

  if (rule.action === 'hard_decline') {
    return `Hard decline triggered: ${formatValue(actual)} ${operatorLabel(rule.operator)} ${formatValue(rule.value)}`;
  }

  const adj = rule.scoreAdjustment ?? 0;
  const sign = adj >= 0 ? '+' : '';
  return `Score ${sign}${adj} pts — ${formatValue(actual)} ${operatorLabel(rule.operator)} ${formatValue(rule.value)}`;
}

function formatValue(v: number | boolean): string {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(1);
}

function operatorLabel(op: Operator): string {
  const map: Record<Operator, string> = {
    gt: '>',
    gte: '≥',
    lt: '<',
    lte: '≤',
    eq: '=',
    neq: '≠',
    is_true: 'is true',
    is_false: 'is false',
  };
  return map[op] ?? op;
}

export function evaluateApplication(
  application: LoanApplication,
  scorecard: Scorecard
): LoanDecision {
  const ruleResults: RuleResult[] = [];
  let scoreAdjustments = 0;
  let hardDeclineRule: string | undefined;

  const enabledRules = scorecard.rules.filter(r => r.enabled);

  for (const rule of enabledRules) {
    const actualValue = getFieldValue(application, rule.fieldId);
    const triggered = evaluateCondition(rule.operator, actualValue, rule.value);

    const result: RuleResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      fieldId: rule.fieldId,
      triggered,
      action: rule.action,
      scoreAdjustment: triggered && rule.action === 'score' ? (rule.scoreAdjustment ?? 0) : undefined,
      actualValue,
      operator: rule.operator,
      thresholdValue: rule.value,
      reason: buildRuleReason(rule, triggered, actualValue),
    };

    ruleResults.push(result);

    if (triggered && rule.action === 'hard_decline') {
      hardDeclineRule = rule.name;
      break;
    }

    if (triggered && rule.action === 'score') {
      scoreAdjustments += rule.scoreAdjustment ?? 0;
    }
  }

  const finalScore = hardDeclineRule
    ? 0
    : scorecard.baseScore + scoreAdjustments;

  let decision: Decision;
  if (hardDeclineRule) {
    decision = 'decline';
  } else if (finalScore >= scorecard.thresholds.approveAbove) {
    decision = 'approve';
  } else if (finalScore < scorecard.thresholds.declineBelow) {
    decision = 'decline';
  } else {
    decision = 'refer';
  }

  return {
    applicationId: application.id,
    scorecardId: scorecard.id,
    scorecardVersion: scorecard.version,
    decision,
    finalScore,
    baseScore: scorecard.baseScore,
    scoreAdjustments,
    ruleResults,
    hardDeclineRule,
    decidedAt: application.appliedAt,
  };
}

export function batchEvaluate(
  applications: LoanApplication[],
  scorecard: Scorecard
) {
  return applications.map(app => ({
    ...app,
    decision: evaluateApplication(app, scorecard),
  }));
}
