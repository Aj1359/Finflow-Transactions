import {
  calculateTotals,
  calculateCategorySpending,
  calculateMonthlySummary
} from "../../../src/lib/finance/calculations.js";
import { proposeBudget } from "../../../src/lib/finance/budgetPlanner.js";
import { validateBudget } from "../../../src/lib/finance/validators.js";

export function createToolRegistry(context) {
  const { transactions = [], budgets = [] } = context;

  return {
    get_financial_summary: () => {
      const totals = calculateTotals(transactions);
      return {
        ...totals,
        net: totals.income - totals.expenses,
        savingsRate:
          totals.income > 0
            ? Number((((totals.income - totals.expenses) / totals.income) * 100).toFixed(1))
            : null
      };
    },

    get_category_spending: () => ({
      categories: calculateCategorySpending(transactions)
    }),

    get_monthly_summary: ({ month }) => {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error("Month must use YYYY-MM format.");
      }
      return calculateMonthlySummary(transactions, month);
    },

    propose_budget: ({ income, savingsTarget = 0 }) => {
      const categorySpending = calculateCategorySpending(transactions);
      return proposeBudget({ income, savingsTarget, categorySpending });
    },

    validate_budget: ({ income, savingsTarget, budgets: proposed }) =>
      validateBudget({ income, savingsTarget, budgets: proposed }),

    get_existing_budgets: () => ({ budgets })
  };
}
