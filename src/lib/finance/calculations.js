/**
 * FinFlow Financial Calculations Engine
 * 
 * Deterministic routines for calculating cashflows, category distributions,
 * savings ratios, and monthly aggregations.
 */

export const NEED_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Health', 'Education'];
export const WANT_CATEGORIES = ['Shopping', 'Entertainment', 'Other'];

export function calculateTotals(transactions = []) {
  return transactions.reduce(
    (result, transaction) => {
      const amount = Number(transaction.amount);
      if (!Number.isFinite(amount) || amount < 0) return result;
      if (transaction.type === "income") {
        result.income += amount;
      } else if (transaction.type === "expense") {
        result.expenses += amount;
      }
      return result;
    },
    { income: 0, expenses: 0 }
  );
}

export function calculateSavingsRate(income, expenses) {
  if (!Number.isFinite(income) || income <= 0) return null;
  return Number((((income - expenses) / income) * 100).toFixed(1));
}

export function calculateCategorySpending(transactions = []) {
  const categories = {};
  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount) || amount < 0) continue;
    const category = transaction.category || "Uncategorized";
    categories[category] = (categories[category] || 0) + amount;
  }
  return Object.entries(categories)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function calculateMonthlySummary(transactions = [], month) {
  const filtered = transactions.filter((transaction) => {
    return typeof transaction.date === "string" && transaction.date.startsWith(month);
  });
  const totals = calculateTotals(filtered);
  return {
    month,
    ...totals,
    net: totals.income - totals.expenses,
    savingsRate: calculateSavingsRate(totals.income, totals.expenses)
  };
}

export function formatINR(amount) {
  return `₹${Math.round(Number(amount) || 0).toLocaleString("en-IN")}`;
}

export function calculateFinancialSummary(transactions = [], budgets = {}) {
  const totals = calculateTotals(transactions);
  const netSavings = totals.income - totals.expenses;
  const savingsRatePct = calculateSavingsRate(totals.income, totals.expenses) || 0;
  const totalBudgeted = Object.values(budgets).reduce((sum, b) => sum + (Number(b) || 0), 0);

  let totalNeeds = 0;
  let totalWants = 0;
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const amt = Number(t.amount) || 0;
    if (NEED_CATEGORIES.includes(t.category)) {
      totalNeeds += amt;
    } else {
      totalWants += amt;
    }
  });

  return {
    totalIncome: totals.income,
    totalExpense: totals.expenses,
    netSavings,
    savingsRatePct,
    totalNeeds,
    totalWants,
    totalBudgeted
  };
}
