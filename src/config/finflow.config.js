/* ═══════════════════════════════════════════════════════════
   FinFlow — API Configuration
   Place your API keys here. Never commit real keys to GitHub.
   ═══════════════════════════════════════════════════════════ */

const FINFLOW_CONFIG = {
  // ── AI CONFIGURATION ──────────────────────────────────────────
  // Get free API key from: https://ai.google.dev/
  // Key is loaded from .env (VITE_GEMINI_API_KEY)
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  GEMINI_MODEL: 'gemini-1.5-flash',

  // ── RAG ENGINE SETTINGS ───────────────────────────────────────
  RAG_MAX_TRANSACTIONS: 50,
  BUDGET_ANALYSIS_MONTHS: 3,

  // ── REGIONAL SETTINGS ─────────────────────────────────────────
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
};

// Expose globally for chatbot compatibility
if (typeof window !== 'undefined') window.FINFLOW_CONFIG = FINFLOW_CONFIG;

export default FINFLOW_CONFIG;
