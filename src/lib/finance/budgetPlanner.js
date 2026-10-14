/**
 * FinFlow Budget Planner Engine
 */

import { validateBudget } from "./validators.js";

export function proposeBudget({ income, categorySpending = [], savingsTarget = 0 }) {
  if (!Number.isFinite(income) || income <= 0) {
    throw new Error("A positive monthly income is required.");
  }
  if (
    !Number.isFinite(savingsTarget) ||
    savingsTarget < 0 ||
    savingsTarget > income
  ) {
    throw new Error("Invalid savings target.");
  }

  const availableForSpending = income - savingsTarget;
  const historicalTotal = categorySpending.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const budgets = categorySpending.map((item) => {
    const share = historicalTotal > 0 ? item.amount / historicalTotal : 0;
    return {
      category: item.category,
      amount: Math.round(availableForSpending * share)
    };
  });

  // Correct rounding drift by adjusting the largest category.
  const difference =
    availableForSpending - budgets.reduce((sum, item) => sum + item.amount, 0);
  if (budgets.length > 0) {
    budgets[0].amount += difference;
  }

  const validation = validateBudget({ income, budgets, savingsTarget });

  return {
    income,
    savingsTarget,
    budgets,
    validation,
    note:
      historicalTotal === 0
        ? "No historical expense categories were provided; this proposal needs manual category allocation."
        : "Category proportions are based on historical expenses, scaled to the available spending limit."
  };
}
