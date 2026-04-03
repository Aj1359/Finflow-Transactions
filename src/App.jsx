

import { useState, useCallback, createContext, useContext } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage from './pages/InsightsPage';
import Toast from './components/ui/Toast';
import { useToast } from './hooks/useToast';

// Toast context so any component can trigger toasts
export const ToastContext = createContext(null);
export const useAppToast = () => useContext(ToastContext);

export default function App() {
  const { toasts, toast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <AppLayout>
        <DashboardPage />
        <TransactionsPage />
        <InsightsPage />
      </AppLayout>
      <Toast toasts={toasts} />
    </ToastContext.Provider>
  );
}
