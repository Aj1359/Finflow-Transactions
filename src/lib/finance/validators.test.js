import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotals,
  calculateSavingsRate,
  calculateCategorySpending,
  calculateMonthlySummary
} from "./calculations.js";
import { proposeBudget } from "./budgetPlanner.js";
import { validateBudget, validateToolArgs, verifyPersistedBudgets } from "./validators.js";

// 1. Basic Calculation Tests
test("calculates income and expenses correctly", () => {
  const result = calculateTotals([
    { type: "income", amount: 50000 },
    { type: "expense", amount: 10000 },
    { type: "expense", amount: 5000 }
  ]);
  assert.deepEqual(result, { income: 50000, expenses: 15000 });
});

// 2. Empty History Edge Cases
test("handles empty transaction history safely", () => {
  const totals = calculateTotals([]);
  assert.deepEqual(totals, { income: 0, expenses: 0 });

  const rate = calculateSavingsRate(0, 0);
  assert.equal(rate, null);

  const categories = calculateCategorySpending([]);
  assert.deepEqual(categories, []);

  const monthly = calculateMonthlySummary([], "2026-03");
  assert.equal(monthly.income, 0);
  assert.equal(monthly.expenses, 0);
  assert.equal(monthly.savingsRate, null);
});

// 3. Invalid & Non-Finite Numbers Handling
test("ignores negative or non-finite transaction amounts", () => {
  const totals = calculateTotals([
    { type: "income", amount: 50000 },
    { type: "income", amount: -500 },
    { type: "expense", amount: NaN },
    { type: "expense", amount: Infinity },
    { type: "expense", amount: 1200 }
  ]);
  assert.deepEqual(totals, { income: 50000, expenses: 1200 });
});

// 4. Budget Constraint Validation
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
  assert.equal(result.errors.length > 0, true);
});

test("rejects budget when savings target exceeds income", () => {
  const result = validateBudget({
    income: 50000,
    savingsTarget: 60000,
    budgets: [
      { category: "Food", amount: 5000 }
    ]
  });
  assert.equal(result.valid, false);
  assert.equal(result.targetMet, false);
});

test("rejects malformed budget items missing category or with negative amounts", () => {
  const result = validateBudget({
    income: 50000,
    savingsTarget: 10000,
    budgets: [
      { category: "", amount: 5000 },
      { category: "Food", amount: -100 }
    ]
  });
  assert.equal(result.valid, false);
  assert.equal(result.errors.length >= 2, true);
});

test("accepts a feasible budget and accurately calculates projected savings", () => {
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
  assert.equal(result.totalBudget, 40000);
});

// 5. Budget Proposal Engine Tests
test("proposeBudget throws error when income is non-positive or savingsTarget exceeds income", () => {
  assert.throws(() => {
    proposeBudget({ income: 0, savingsTarget: 5000 });
  }, /positive monthly income is required/i);

  assert.throws(() => {
    proposeBudget({ income: 50000, savingsTarget: 60000 });
  }, /invalid savings target/i);
});

test("proposeBudget eliminates rounding drift and balances allocations exactly to spendable pool", () => {
  const proposal = proposeBudget({
    income: 50000,
    savingsTarget: 10000,
    categorySpending: [
      { category: "Housing", amount: 1400 },
      { category: "Food", amount: 230 },
      { category: "Transport", amount: 95 },
      { category: "Entertainment", amount: 18 }
    ]
  });

  assert.equal(proposal.validation.valid, true);
  assert.equal(proposal.validation.targetMet, true);
  assert.equal(proposal.validation.totalBudget, 40000);
  assert.equal(proposal.validation.projectedSavings, 10000);

  const sumAllocations = proposal.budgets.reduce((s, b) => s + b.amount, 0);
  assert.equal(sumAllocations, 40000);
});

test("proposeBudget gracefully handles zero historical spending", () => {
  const proposal = proposeBudget({
    income: 50000,
    savingsTarget: 10000,
    categorySpending: []
  });

  assert.equal(proposal.validation.valid, true);
  assert.equal(proposal.budgets.length, 0);
  assert.match(proposal.note, /no historical expense categories/i);
});

// 6. Tool Argument Validation Tests
test("validateToolArgs identifies valid and invalid tool calls", () => {
  // Valid propose_budget
  const validCall = validateToolArgs("propose_budget", { income: 50000, savingsTarget: 10000 });
  assert.equal(validCall.valid, true);

  // Invalid savings target exceeding income
  const invalidCall = validateToolArgs("propose_budget", { income: 50000, savingsTarget: 60000 });
  assert.equal(invalidCall.valid, false);

  // Invalid month format
  const invalidMonth = validateToolArgs("get_monthly_summary", { month: "March-2026" });
  assert.equal(invalidMonth.valid, false);

  // Valid month format
  const validMonth = validateToolArgs("get_monthly_summary", { month: "2026-03" });
  assert.equal(validMonth.valid, true);

  // Unknown tool
  const unknown = validateToolArgs("execute_arbitrary_code", {});
  assert.equal(unknown.valid, false);
});

// 7. Budget Storage Persistence Verification Test
test("verifyPersistedBudgets confirms matched vs mismatched stored values", () => {
  // Mock localStorage in Node test environment
  const mockStorage = {
    finflow_budgets: JSON.stringify({
      Food: 8000,
      Housing: 15000
    })
  };

  globalThis.localStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = val; }
  };

  // Matching proposal
  const matchResult = verifyPersistedBudgets([
    { category: "Food", amount: 8000 },
    { category: "Housing", amount: 15000 }
  ]);
  assert.equal(matchResult, true);

  // Mismatched proposal (amount altered or category missing)
  const mismatchResult = verifyPersistedBudgets([
    { category: "Food", amount: 8000 },
    { category: "Housing", amount: 12000 } // expected 15000
  ]);
  assert.equal(mismatchResult, false);

  // Exact match succeeds when categories match exactly
  assert.equal(verifyPersistedBudgets([
    { category: "Food", amount: 8000 },
    { category: "Housing", amount: 15000 }
  ], { exact: true }), true);

  // Stale extra category causes exact match to fail (preventing zombie budget limits)
  mockStorage.finflow_budgets = JSON.stringify({
    Food: 8000,
    Housing: 15000,
    StaleOldCategory: 3000 // leftover category from previous month
  });

  const staleResult = verifyPersistedBudgets([
    { category: "Food", amount: 8000 },
    { category: "Housing", amount: 15000 }
  ], { exact: true });
  assert.equal(staleResult, false, "Must reject persistence when stale/extraneous categories remain in storage");
});

// 8. Shared Tool Schemas & Function Declarations Consistency Test
test("toolDeclarations correctly mirrors FINFLOW_TOOLS contracts without schema drift", async () => {
  const { FINFLOW_TOOLS, toolDeclarations } = await import("./toolSchemas.js");
  assert.equal(Array.isArray(toolDeclarations), true);
  assert.equal(toolDeclarations.length, FINFLOW_TOOLS.length);

  for (let i = 0; i < FINFLOW_TOOLS.length; i++) {
    const contract = FINFLOW_TOOLS[i];
    const decl = toolDeclarations[i];
    assert.equal(decl.name, contract.name);
    assert.equal(decl.description, contract.description);
    assert.deepEqual(decl.parameters, contract.parameters);
  }
});
