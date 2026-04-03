

const FINFLOW_CONFIG = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  GEMINI_MODEL: 'gemini-1.5-flash',
  RAG_MAX_TRANSACTIONS: 50,
  BUDGET_ANALYSIS_MONTHS: 3,
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
};

if (typeof window !== 'undefined') window.FINFLOW_CONFIG = FINFLOW_CONFIG;

export default FINFLOW_CONFIG;
