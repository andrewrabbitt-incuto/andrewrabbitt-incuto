import type { ApplicationWithDecision, GapAnalysisInsight } from '../types';

export function generateGapAnalysis(
  applications: ApplicationWithDecision[]
): GapAnalysisInsight[] {
  const declined = applications.filter(a => a.decision.decision === 'decline');
  const total = applications.length;
  const declineCount = declined.length;

  if (declineCount === 0) {
    return [
      {
        type: 'pattern',
        title: 'No declines in selected period',
        description: 'All applications in this period resulted in approvals or referrals.',
        affectedCount: 0,
        affectedPct: 0,
      },
    ];
  }

  const insights: GapAnalysisInsight[] = [];

  // Hard decline analysis
  const hardDeclines = declined.filter(a => a.decision.hardDeclineRule);
  if (hardDeclines.length > 0) {
    const hardDeclinePct = Math.round((hardDeclines.length / declineCount) * 100);
    const hardDeclineReasons = hardDeclines.reduce((acc, a) => {
      const reason = a.decision.hardDeclineRule ?? 'Unknown';
      acc[reason] = (acc[reason] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topReason = Object.entries(hardDeclineReasons).sort(([, a], [, b]) => b - a)[0];

    insights.push({
      type: 'pattern',
      title: 'Hard Decline Rules Dominate',
      description: `${hardDeclinePct}% of declines are triggered by hard decline rules. The most common is "${topReason[0]}" (${topReason[1]} applications). These cannot be scored — consider whether any hard decline thresholds could be relaxed for certain product tiers.`,
      affectedCount: hardDeclines.length,
      affectedPct: Math.round((hardDeclines.length / total) * 100),
      recommendation: `Review the "${topReason[0]}" rule — if it is triggering edge cases, consider converting to a score penalty with a very high negative value rather than a hard stop.`,
    });
  }

  // Credit score analysis
  const lowCreditDeclines = declined.filter(
    a => a.bureauData.creditScore < 400
  );
  if (lowCreditDeclines.length > 0) {
    const pct = Math.round((lowCreditDeclines.length / total) * 100);
    const avgScore = Math.round(
      lowCreditDeclines.reduce((s, a) => s + a.bureauData.creditScore, 0) /
        lowCreditDeclines.length
    );

    // How many of these have good payment history?
    const goodPaymentHistory = lowCreditDeclines.filter(
      a => a.memberData.paymentHistoryScore >= 70
    );

    insights.push({
      type: 'opportunity',
      title: 'Low Credit Score — Thin File Opportunity',
      description: `${lowCreditDeclines.length} declined applicants (${pct}% of all applications) have a credit score below 400 (average ${avgScore}). ${goodPaymentHistory.length} of these have good internal payment history (≥70/100), suggesting thin credit files rather than poor behaviour.`,
      affectedCount: lowCreditDeclines.length,
      affectedPct: pct,
      recommendation: `Create or review a "Credit Builder" product for members with TransUnion score 200–400 but internal payment score ≥70. Consider offering smaller amounts (£250–£1,000) with shorter terms to manage risk while helping members build their bureau profile.`,
    });
  }

  // High DTI analysis
  const highDtiDeclines = declined.filter(
    a => a.memberData.dtiRatio > 50 && !a.decision.hardDeclineRule
  );
  if (highDtiDeclines.length > 0) {
    const pct = Math.round((highDtiDeclines.length / total) * 100);
    const avgDisposable = Math.round(
      highDtiDeclines.reduce((s, a) => s + a.openBankingData.disposableIncome, 0) /
        highDtiDeclines.length
    );

    insights.push({
      type: 'pattern',
      title: 'High DTI Scoring Members',
      description: `${highDtiDeclines.length} score-based declines (${pct}% of applications) are primarily driven by a high debt-to-income ratio. The average disposable income for this group is £${avgDisposable}/month. Some may still be affordable for smaller loan amounts.`,
      affectedCount: highDtiDeclines.length,
      affectedPct: pct,
      recommendation: `Consider adding a disposable income minimum rule alongside DTI, rather than using DTI alone. A member with high DTI but £300+ monthly disposable income may be serviceable for a smaller loan.`,
    });
  }

  // Near-miss analysis (score between decline and refer threshold)
  const scorecardDeclines = declined.filter(a => !a.decision.hardDeclineRule);
  const nearMisses = scorecardDeclines.filter(a => {
    const gap = a.decision.finalScore;
    return gap >= 380 && gap < 450;
  });

  if (nearMisses.length > 0) {
    const pct = Math.round((nearMisses.length / total) * 100);
    const avgScore = Math.round(
      nearMisses.reduce((s, a) => s + a.decision.finalScore, 0) / nearMisses.length
    );

    insights.push({
      type: 'opportunity',
      title: 'Near-Miss Declines',
      description: `${nearMisses.length} applicants (${pct}%) scored within 70 points of the refer threshold (average score: ${avgScore}). These are borderline cases that may warrant individual review or a referral pathway.`,
      affectedCount: nearMisses.length,
      affectedPct: pct,
      recommendation: `Reduce the decline threshold by 30–50 points to refer these cases for manual underwriter review. This could convert up to ${nearMisses.length} declines into managed referrals, with underwriters approving lower-risk individuals.`,
    });
  }

  // Gambling concern analysis
  const gamblingDeclines = declined.filter(
    a => a.openBankingData.gamblingTransactions3m > 10
  );
  if (gamblingDeclines.length > 0) {
    const pct = Math.round((gamblingDeclines.length / total) * 100);
    insights.push({
      type: 'risk',
      title: 'Gambling Activity in Declines',
      description: `${gamblingDeclines.length} declined applications (${pct}% of all) show >10 gambling transactions in the last 3 months. The current rule applies a -75 point penalty. Verify this rule weight aligns with your risk appetite.`,
      affectedCount: gamblingDeclines.length,
      affectedPct: pct,
      recommendation: `Consider splitting the gambling rule into tiers: 5–10 transactions (-50 pts) and >10 transactions (-75 pts) to better differentiate casual from problematic gambling behaviour.`,
    });
  }

  // Membership duration insight
  const newMemberDeclines = declined.filter(a => a.memberData.monthsAsMember < 6);
  if (newMemberDeclines.length > 0) {
    const pct = Math.round((newMemberDeclines.length / total) * 100);
    insights.push({
      type: 'opportunity',
      title: 'New Members Being Declined',
      description: `${newMemberDeclines.length} declined applicants (${pct}% of applications) have been members for less than 6 months. This may reflect a gap in the product range for newly joined members.`,
      affectedCount: newMemberDeclines.length,
      affectedPct: pct,
      recommendation: `Consider a "New Member Starter Loan" product with a small amount (£250–£500) and bureau-weighted eligibility, allowing new members to begin their relationship with the credit union through lending.`,
    });
  }

  // Sort by affected count descending
  return insights.sort((a, b) => b.affectedCount - a.affectedCount);
}

export function getDeclineBreakdown(applications: ApplicationWithDecision[]) {
  const counts = { approve: 0, refer: 0, decline: 0 };
  applications.forEach(a => {
    counts[a.decision.decision]++;
  });
  const total = applications.length || 1;
  return {
    ...counts,
    approveRate: Math.round((counts.approve / total) * 100),
    referRate: Math.round((counts.refer / total) * 100),
    declineRate: Math.round((counts.decline / total) * 100),
    total: applications.length,
  };
}

export function getTopDeclineDrivers(applications: ApplicationWithDecision[]) {
  const declined = applications.filter(a => a.decision.decision === 'decline');
  const driverCounts: Record<string, number> = {};

  declined.forEach(a => {
    if (a.decision.hardDeclineRule) {
      const key = `Hard Decline: ${a.decision.hardDeclineRule}`;
      driverCounts[key] = (driverCounts[key] ?? 0) + 1;
    } else {
      // Find rules that had the most negative impact
      const negativeRules = a.decision.ruleResults
        .filter(r => r.triggered && r.action === 'score' && (r.scoreAdjustment ?? 0) < 0);
      negativeRules.forEach(r => {
        driverCounts[r.ruleName] = (driverCounts[r.ruleName] ?? 0) + 1;
      });
    }
  });

  return Object.entries(driverCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / (declined.length || 1)) * 100),
    }));
}
