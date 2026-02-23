import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/rules': {
    title: 'Rules Engine',
    subtitle: 'Configure scorecards and decisioning rules per product',
  },
  '/loans': {
    title: 'Loan Decision Review',
    subtitle: 'Drill into individual loan decisions and identify gaps',
  },
  '/sandbox': {
    title: 'Sandbox',
    subtitle: 'Simulate rule changes against historical application data',
  },
};

export function Header() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] ?? { title: 'Loan Decisioning', subtitle: '' };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{meta.title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <HelpCircle size={18} />
        </button>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
        <div className="ml-1 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-indigo-700 text-xs font-semibold">AR</span>
        </div>
      </div>
    </header>
  );
}
