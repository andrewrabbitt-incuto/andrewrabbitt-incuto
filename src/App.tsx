import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AppShell } from './components/layout/AppShell';
import { RulesEnginePage } from './components/rules-engine/RulesEnginePage';
import { LoanReviewPage } from './components/loan-review/LoanReviewPage';
import { SandboxPage } from './components/sandbox/SandboxPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/rules" replace />} />
          <Route path="rules" element={<RulesEnginePage />} />
          <Route path="loans" element={<LoanReviewPage />} />
          <Route path="sandbox" element={<SandboxPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
