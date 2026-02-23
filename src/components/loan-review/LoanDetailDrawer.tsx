import React, { useState } from 'react';
import { X, User, CreditCard, Landmark, TrendingUp, ChevronRight } from 'lucide-react';
import type { ApplicationWithDecision } from '../../types';
import { DecisionBadge } from '../ui/Badge';
import { ScoreBreakdown } from './ScoreBreakdown';
import { SCORECARDS } from '../../lib/mock-data';
import clsx from 'clsx';

interface LoanDetailDrawerProps {
  application: ApplicationWithDecision | null;
  onClose: () => void;
}

type Tab = 'decision' | 'member' | 'bureau' | 'openbanking';

const TABS: Array<{ id: Tab; label: string; icon: typeof User }> = [
  { id: 'decision', label: 'Decision', icon: TrendingUp },
  { id: 'member', label: 'Member', icon: User },
  { id: 'bureau', label: 'Bureau', icon: CreditCard },
  { id: 'openbanking', label: 'Open Banking', icon: Landmark },
];

function formatCurrency(v: number) {
  return `£${v.toLocaleString('en-GB')}`;
}

function DataRow({ label, value, highlight }: { label: string; value: string | number; highlight?: 'good' | 'bad' | 'neutral' }) {
  const valueClass = highlight === 'good' ? 'text-emerald-600 font-semibold' : highlight === 'bad' ? 'text-rose-600 font-semibold' : 'text-slate-700';
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs ${valueClass}`}>{value}</span>
    </div>
  );
}

export function LoanDetailDrawer({ application, onClose }: LoanDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('decision');

  if (!application) return null;

  const { decision, memberData, bureauData, openBankingData } = application;
  const scorecard = SCORECARDS.find(sc => sc.id === decision.scorecardId);
  const thresholds = scorecard?.thresholds ?? { approveAbove: 650, declineBelow: 450 };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 z-30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[520px] bg-white shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-semibold text-slate-900 truncate">
                {application.memberName}
              </h2>
              <DecisionBadge decision={decision.decision} size="md" />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
              <span>{application.productName}</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="font-medium text-slate-700">{formatCurrency(application.amount)}</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span>{application.term} months</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span>{application.purpose}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Applied {new Date(application.appliedAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
              {' · '}ID {application.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {activeTab === 'decision' && (
            <ScoreBreakdown
              decision={decision}
              approveAbove={thresholds.approveAbove}
              declineBelow={thresholds.declineBelow}
            />
          )}

          {activeTab === 'member' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="Member ID" value={application.memberId} />
                <DataRow label="Months as Member" value={`${memberData.monthsAsMember} months`} highlight={memberData.monthsAsMember >= 24 ? 'good' : 'neutral'} />
                <DataRow label="Current Balance" value={formatCurrency(memberData.currentBalance)} />
                <DataRow label="Savings Balance" value={formatCurrency(memberData.savingsBalance)} highlight={memberData.savingsBalance >= 500 ? 'good' : 'neutral'} />
                <DataRow label="Existing Loan Balance" value={formatCurrency(memberData.existingLoanBalance)} highlight={memberData.existingLoanBalance > 0 ? 'neutral' : 'good'} />
                <DataRow label="Employment Status" value={memberData.employmentStatus.replace('_', ' ')} />
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Behaviour</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="Payment History Score" value={`${memberData.paymentHistoryScore}/100`} highlight={memberData.paymentHistoryScore >= 80 ? 'good' : memberData.paymentHistoryScore < 60 ? 'bad' : 'neutral'} />
                <DataRow label="Arrears Count (12m)" value={memberData.arrearsCount12m} highlight={memberData.arrearsCount12m === 0 ? 'good' : memberData.arrearsCount12m > 2 ? 'bad' : 'neutral'} />
                <DataRow label="Debt-to-Income Ratio" value={`${memberData.dtiRatio}%`} highlight={memberData.dtiRatio < 30 ? 'good' : memberData.dtiRatio > 50 ? 'bad' : 'neutral'} />
              </div>
            </div>
          )}

          {activeTab === 'bureau' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Identity</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="ID Verified" value={bureauData.idVerified ? 'Yes' : 'No'} highlight={bureauData.idVerified ? 'good' : 'bad'} />
                <DataRow label="Fraud Risk Score" value={`${bureauData.fraudScore}/100`} highlight={bureauData.fraudScore < 40 ? 'good' : bureauData.fraudScore > 70 ? 'bad' : 'neutral'} />
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Credit History</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="TransUnion Score" value={`${bureauData.creditScore}/710`} highlight={bureauData.creditScore >= 580 ? 'good' : bureauData.creditScore < 350 ? 'bad' : 'neutral'} />
                <DataRow label="CCJ Count" value={bureauData.ccjCount} highlight={bureauData.ccjCount === 0 ? 'good' : bureauData.ccjCount > 2 ? 'bad' : 'neutral'} />
                <DataRow label="Bankruptcy" value={bureauData.bankruptcy ? 'Yes' : 'No'} highlight={bureauData.bankruptcy ? 'bad' : 'good'} />
                <DataRow label="Defaults Count" value={bureauData.defaultsCount} highlight={bureauData.defaultsCount === 0 ? 'good' : 'bad'} />
                <DataRow label="Missed Payments (6m)" value={bureauData.missedPayments6m} highlight={bureauData.missedPayments6m === 0 ? 'good' : bureauData.missedPayments6m > 2 ? 'bad' : 'neutral'} />
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Exposure</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="Total External Debt" value={formatCurrency(bureauData.totalDebt)} />
                <DataRow label="Credit Utilisation" value={`${bureauData.creditUtilisation}%`} highlight={bureauData.creditUtilisation < 50 ? 'good' : bureauData.creditUtilisation > 80 ? 'bad' : 'neutral'} />
              </div>
            </div>
          )}

          {activeTab === 'openbanking' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Income</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="Income Verified" value={openBankingData.incomeVerified ? 'Yes' : 'No'} highlight={openBankingData.incomeVerified ? 'good' : 'neutral'} />
                <DataRow label="Monthly Income" value={formatCurrency(openBankingData.monthlyIncome)} />
                <DataRow label="Income Stability Score" value={`${openBankingData.incomeStabilityScore}/100`} highlight={openBankingData.incomeStabilityScore >= 75 ? 'good' : openBankingData.incomeStabilityScore < 50 ? 'bad' : 'neutral'} />
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Expenditure</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="Monthly Expenditure" value={formatCurrency(openBankingData.monthlyExpenditure)} />
                <DataRow label="Housing Costs" value={formatCurrency(openBankingData.housingCosts)} />
                <DataRow label="Disposable Income" value={formatCurrency(openBankingData.disposableIncome)} highlight={openBankingData.disposableIncome >= 200 ? 'good' : openBankingData.disposableIncome < 0 ? 'bad' : 'neutral'} />
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4">Risk Indicators</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-1 divide-y divide-slate-100">
                <DataRow label="Gambling Transactions (3m)" value={openBankingData.gamblingTransactions3m} highlight={openBankingData.gamblingTransactions3m === 0 ? 'good' : openBankingData.gamblingTransactions3m > 10 ? 'bad' : 'neutral'} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
