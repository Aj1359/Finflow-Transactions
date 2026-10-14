/**
 * FinFlow Budget & Financial Validators
 */

export function validateBudget({ income, budgets, savingsTarget = 0 }) {
  const errors = [];

  if (!Number.isFinite(income) || income < 0) {
    errors.push("Income must be a non-negative number.");
  }

  if (!Array.isArray(budgets)) {
    errors.push("Budgets must be an array.");
    return { valid: false, errors };
  }

  let totalBudget = 0;
  for (const item of budgets) {
    if (
      !item.category ||
      !Number.isFinite(item.amount) ||
      item.amount < 0
    ) {
      errors.push("Every budget needs a category and valid amount.");
      continue;
    }
    totalBudget += item.amount;
  }

  if (!Number.isFinite(savingsTarget) || savingsTarget < 0) {
    errors.push("Savings target must be non-negative.");
  }

  if (totalBudget + savingsTarget > income) {
    errors.push(
      "Budget plus savings target exceeds the available income."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    totalBudget,
    projectedSavings: income - totalBudget,
    targetMet: errors.length === 0 && (income - totalBudget) >= savingsTarget
  };
}
