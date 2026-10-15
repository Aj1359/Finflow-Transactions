/**
 * FinFlow Budget & Financial Validators
 */

export const BUDGETS_STORAGE_KEY = 'finflow_budgets';

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

/**
 * Validates tool execution arguments against formal schemas
 */
export function validateToolArgs(toolName, args = {}) {
  const errors = [];

  switch (toolName) {
    case 'get_monthly_summary':
      if (!args.month || !/^\d{4}-\d{2}$/.test(args.month)) {
        errors.push('Parameter "month" must use YYYY-MM format.');
      }
      break;

    case 'propose_budget': {
      const income = args.income ?? args.monthlyIncome;
      const savingsTarget = args.savingsTarget ?? args.targetSavings ?? 0;
      if (!Number.isFinite(income) || income <= 0) {
        errors.push('A positive "income" number is required.');
      }
      if (!Number.isFinite(savingsTarget) || savingsTarget < 0) {
        errors.push('Parameter "savingsTarget" must be non-negative.');
      }
      if (Number.isFinite(income) && Number.isFinite(savingsTarget) && savingsTarget > income) {
        errors.push('Parameter "savingsTarget" cannot exceed "income".');
      }
      break;
    }

    case 'validate_budget': {
      const income = args.income ?? args.monthlyIncome;
      if (!Number.isFinite(income) || income < 0) {
        errors.push('Parameter "income" must be non-negative.');
      }
      if (!Array.isArray(args.budgets)) {
        errors.push('Parameter "budgets" must be an array.');
      }
      break;
    }

    case 'get_financial_summary':
    case 'get_category_spending':
    case 'get_existing_budgets':
      break;

    default:
      errors.push(`Unknown tool: "${toolName}".`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Explicitly verifies that budgets are accurately persisted in storage
 */
export function verifyPersistedBudgets(expectedBudgets, storageKey = BUDGETS_STORAGE_KEY) {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return false;
    const stored = JSON.parse(raw);
    const budgetsArray = Array.isArray(expectedBudgets)
      ? expectedBudgets
      : Object.entries(expectedBudgets).map(([category, amount]) => ({ category, amount }));

    for (const item of budgetsArray) {
      if (stored[item.category] !== item.amount) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
