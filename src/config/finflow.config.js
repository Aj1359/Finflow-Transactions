/* ═══════════════════════════════════════════════════════════
   FinFlow — API Configuration
   Place your API keys here. Never commit real keys to GitHub.
   ═══════════════════════════════════════════════════════════ */

const FINFLOW_CONFIG = {
  // ── AI CONFIGURATION ──────────────────────────────────────────
  // Get free API key from: https://ai.google.dev/
  GEMINI_API_KEY: 'AIzaSyAmPtpq62iO8wxgX70x3RkRTaWBlCCXCIQ',
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
