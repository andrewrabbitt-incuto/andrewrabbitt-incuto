import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sliders, Search, FlaskConical, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  {
    to: '/rules',
    icon: Sliders,
    label: 'Rules Engine',
    description: 'Build & manage scorecards',
  },
  {
    to: '/loans',
    icon: Search,
    label: 'Loan Decisions',
    description: 'Review individual decisions',
  },
  {
    to: '/sandbox',
    icon: FlaskConical,
    label: 'Sandbox',
    description: 'Simulate rule changes',
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">i</span>
          </div>
          <div>
            <span className="text-white font-semibold text-sm tracking-tight">incuto</span>
            <p className="text-slate-400 text-xs">Loan Decisioning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label, description }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={clsx(isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300')}
                />
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium', isActive ? 'text-white' : '')}>{label}</p>
                  <p
                    className={clsx(
                      'text-xs truncate',
                      isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'
                    )}
                  >
                    {description}
                  </p>
                </div>
                {isActive && <ChevronRight size={14} className="text-indigo-300 shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-slate-300 text-xs font-semibold">AR</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-300 text-xs font-medium truncate">Andrew Rabbitt</p>
            <p className="text-slate-500 text-xs truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
