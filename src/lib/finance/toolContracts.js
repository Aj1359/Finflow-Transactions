/**
 * FinFlow AI Copilot — Unified Tool Contracts & Function Declarations
 * 
 * Single source of truth for tool declarations matching both Google Gemini Function Calling
 * schemas and the executable Tool Registry.
 */

export const FINFLOW_TOOLS = [
  {
    name: 'get_financial_summary',
    description: 'Calculate income, expenses, net balance and savings rate from transactions.',
    isAction: false,
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  },
  {
    name: 'get_category_spending',
    description: 'Retrieve expense totals grouped and ranked by category.',
    isAction: false,
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  },
  {
    name: 'get_monthly_summary',
    description: 'Calculate income and expenses for a specific month.',
    isAction: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        month: {
          type: 'STRING',
          description: 'Month in YYYY-MM format (e.g. "2026-03").'
        }
      },
      required: ['month']
    }
  },
  {
    name: 'propose_budget',
    description: 'Create a balanced budget proposal scaled to available income and savings target using historical categories.',
    isAction: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        income: {
          type: 'NUMBER',
          description: 'Total monthly earnings in INR (e.g. 50000).'
        },
        savingsTarget: {
          type: 'NUMBER',
          description: 'Target amount to save each month in INR (e.g. 10000).'
        }
      },
      required: ['income', 'savingsTarget']
    }
  },
  {
    name: 'validate_budget',
    description: 'Mathematically verify proposed category budgets against available income and savings target.',
    isAction: false,
    parameters: {
      type: 'OBJECT',
      properties: {
        income: {
          type: 'NUMBER',
          description: 'Monthly income in INR.'
        },
        savingsTarget: {
          type: 'NUMBER',
          description: 'Target savings in INR.'
        },
        budgets: {
          type: 'ARRAY',
          description: 'Array of category allocations.',
          items: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING' },
              amount: { type: 'NUMBER' }
            },
            required: ['category', 'amount']
          }
        }
      },
      required: ['income', 'savingsTarget', 'budgets']
    }
  },
  {
    name: 'get_existing_budgets',
    description: 'Retrieve the user\'s current category budgets.',
    isAction: false,
    parameters: {
      type: 'OBJECT',
      properties: {}
    }
  }
];

export const toolDeclarations = FINFLOW_TOOLS.map(({ name, description, parameters }) => ({
  name,
  description,
  parameters
}));
