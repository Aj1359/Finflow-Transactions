import test from "node:test";
import assert from "node:assert/strict";
import { calculateTotals } from "./calculations.js";
import { validateBudget } from "./validators.js";

test("calculates income and expenses", () => {
  const result = calculateTotals([
    { type: "income", amount: 50000 },
    { type: "expense", amount: 10000 },
    { type: "expense", amount: 5000 }
  ]);
  assert.deepEqual(result, { income: 50000, expenses: 15000 });
});

test("rejects a budget that exceeds income", () => {
  const result = validateBudget({
    income: 50000,
    savingsTarget: 10000,
    budgets: [
      { category: "Food", amount: 20000 },
      { category: "Shopping", amount: 25000 }
    ]
  });
  assert.equal(result.valid, false);
});

test("accepts a feasible budget", () => {
  const result = validateBudget({
    income: 50000,
    savingsTarget: 10000,
    budgets: [
      { category: "Food", amount: 15000 },
      { category: "Transport", amount: 5000 },
      { category: "Other", amount: 20000 }
    ]
  });
  assert.equal(result.valid, true);
  assert.equal(result.targetMet, true);
  assert.equal(result.projectedSavings, 10000);
});
