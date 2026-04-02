/* ═══════════════════════════════════════════════════════════
   FinFlow — Utility Functions  |  src/lib/utils.js
   ═══════════════════════════════════════════════════════════ */

import { CAT_COLORS_DARK, CAT_COLORS_LIGHT } from './constants';

/** Format as Indian Rupee */
export const fmt = n =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

/** Short format: ₹1.5L, ₹2.3K */
export const fmtShort = n => {
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n;
};

/** Unique ID */
export const uid = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

/** Today's date string YYYY-MM-DD */
export const today = () => new Date().toISOString().split('T')[0];

/** Month key YYYY-MM from date string */
export const monthKey = d => d.slice(0, 7);

/** Compute income / expenses / balance from transactions array */
export function computeTotals(transactions) {
  let income = 0, expenses = 0;
  transactions.forEach(t => {
    if (t.type === 'income')  income   += t.amount;
    if (t.type === 'expense') expenses += t.amount;
  });
  return { income, expenses, balance: income - expenses };
}

/** Get category color map based on theme */
export function getCatColors(theme) {
  return theme === 'dark' ? CAT_COLORS_DARK : CAT_COLORS_LIGHT;
}

/** Download a file */
export function download(filename, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Build last N months array as YYYY-MM strings */
export function getLastMonths(n, anchor = '2026-04-01') {
  const months = [];
  const now = new Date(anchor);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  return months;
}

/** Month label from YYYY-MM string */
export function monthLabel(m, fmt = { month: 'short', year: '2-digit' }) {
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1, 1).toLocaleString('default', fmt);
}
