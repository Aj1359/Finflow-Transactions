'use strict';

export const FinBot = (() => {

  const INTENTS = [
    { name: 'add_income',  patterns: [/(?:add|create|record|log|entered|got|incme|insome).*(?:income|earn|deposit|salary|bonus|payment|credit)/i, /got paid|received|earned|salary|deposit|credited|added income/i] },
    { name: 'add_expense', patterns: [/(?:add|create|record|log|entered|spent|expen|epense).*(?:expense|spend|bill|cost|pay|payment|paid|charge|bought|purchased)/i, /spent|paid for|bought|purchase|bill|fee|cost me|charged/i] },
    { name: 'balance',     patterns: [/balance|how much.*(have|left|do i have|remaining|available)/i, /total|net worth|how much money|current balance|savings/i] },
    { name: 'top_spend',   patterns: [/top spend|most spent|highest.*categor|where.*money.*going|biggest expense|spending breakdown|category breakdown/i] },
    { name: 'top_tx',      patterns: [/best.*(transaction|tx|income|expense)|top.*(transaction|tx|income|expense)|worthy|highest|biggest.*transaction|largest.*amount/i] },
    { name: 'worst_tx',    patterns: [/worst.*transaction|lowest.*income|smallest.*amount|least spent|bottom.*transaction|lowest earnings/i] },
    { name: 'budget',      patterns: [/budget|plan|how much.*should|recommend|advice|50[./]?30[./]?20|saving goal|expense plan/i] },
    { name: 'insight',     patterns: [/insight|analys|summar|overview|trend|pattern|report|analysis|statistics|performance/i] },
    { name: 'monthly',     patterns: [/this month|last month|monthly|month report|march|february|january|previous month|month comparison/i] },
    { name: 'category',    patterns: [/category|food|housing|transport|entertainment|health|education|shopping|utilities|breakdown by category/i] },
    { name: 'search',      patterns: [/search|find|look for|show.*transaction|filter|where.*spend/i] },
    { name: 'comparison',  patterns: [/compare|vs|versus|difference|growth|change|increase|decrease between|month over month/i] },
    { name: 'forecast',    patterns: [/forecast|predict|project|estimate.*future|next month|trending|will spend/i] },
    { name: 'delete_conv', patterns: [/delete.*conversation|clear.*chat|reset.*chat|remove.*history/i] },
    { name: 'delete',      patterns: [/delete|remove|undo|erase|clear.*transaction|forget|cancel.*transaction/i] },
    { name: 'help',        patterns: [/help|what can you|commands|hi|hello|hey|assist|support|guide|tutorial/i] },
  ];

  function extractAmount(text) {
    const m = text.match(/(?:₹|rs|rs\.|inr)?[\s]*(\d[\d,\.]*)[\s]*(?:k|K|thousand|crore)?/i);
    if (!m) return null;
    let val = parseFloat(m[1].replace(/,/g, ''));
    if (/k|K|thousand/i.test(m[0])) val *= 1000;
    if (/crore/i.test(m[0])) val *= 10000000;
    return Math.round(val);
  }

  function extractCategory(text) {
    const cats = ['Salary','Freelance','Investments','Housing','Food','Transport','Utilities','Entertainment','Health','Education','Shopping'];
    for (const c of cats) {
      if (new RegExp(c, 'i').test(text)) return c;
    }
    if (/swiggy|zomato|grocer|restaurant|cafe|coffee|lunch|dinner|food|eat|meal|blinkit|zepto/i.test(text)) return 'Food';
    if (/rent|house|apartment|mortgage|emi|broker/i.test(text)) return 'Housing';
    if (/uber|ola|fuel|petrol|bus|metro|cab|taxi|rapido|petroleum/i.test(text)) return 'Transport';
    if (/netflix|spotify|movie|game|outing|pvr|club|pub/i.test(text)) return 'Entertainment';
    if (/doctor|hospital|medicine|gym|pharma|tata 1mg|dentist/i.test(text)) return 'Health';
    if (/course|book|study|tuition|udemy|coursera|college/i.test(text)) return 'Education';
    if (/amazon|flipkart|shopping|clothes|shoes|myntra|ajio|zara/i.test(text)) return 'Shopping';
    if (/electric|water|gas|internet|phone bill|recharge|jio|airtel|vi|bescom/i.test(text)) return 'Utilities';
    return 'Other';
  }

  function detectIntent(text) {
    const budgetMatch = text.match(/(?:set|create|add|make|change|update|limit).*budget.*(?:for|of)?\s+([a-z\s]+)\s+(?:to|is|of|at|be|limit|limit of)\s+?(?:₹|rs|inr)?\s*(\d[\d,\.]*)/i) ||
                        text.match(/(?:set|create|add|make|change|update|limit)\s+?(?:₹|rs|inr)?\s*(\d[\d,\.]*)\s+budget.*(?:for|of)?\s+([a-z\s]+)/i) ||
                        text.match(/(?:set|limit)\s+([a-z\s]+)\s+(?:budget|limit)\s+(?:to|is|of|at)\s+?(?:₹|rs|inr)?\s*(\d[\d,\.]*)/i);
    if (budgetMatch) {
      if (budgetMatch[1] && isNaN(budgetMatch[1])) {
         return { action: 'set_budget', category: extractCategory(budgetMatch[1]), amount: parseFloat(budgetMatch[2].replace(/,/g, '')) };
      } else {
         return { action: 'set_budget', category: extractCategory(budgetMatch[2]), amount: parseFloat(budgetMatch[1].replace(/,/g, '')) };
      }
    }

    const amt = extractAmount(text);
    if (amt && /(?:add|spent|record|log|spent|bought|purchased|income|salary|freelance|got|received|earned|expen|epense|insome|incme)/i.test(text)) {
      const type = /income|salary|freelance|gig|earned|deposit|credited|received|insome|incme/i.test(text) ? 'income' : 'expense';
      return {
        action: 'add_transaction',
        tx: {
          id: Date.now(),
          date: new Date().toISOString().slice(0, 10),
          desc: text.replace(/\d+|₹|rs|inr|add|spent|log|record|for|on|income|salary|freelance|of|to/gi, '').trim() || (type === 'income' ? 'Income' : 'Expense'),
          amount: amt,
          category: extractCategory(text),
          type
        }
      };
    }

    for (const { name, patterns } of INTENTS) {
      if (patterns.some(p => p.test(text))) return { action: name };
    }
    return null;
  }

  function buildContext(txs, budgets = {}) {
    const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const bal = inc - exp;
    
    return `
FINANCIAL DATA CONTEXT:
Net Balance: ₹${bal}
Total Income: ₹${inc}
Total Expenses: ₹${exp}

BUDGET SETTINGS:
${Object.entries(budgets).map(([c, a]) => `  - ${c}: ₹${a}`).join('\n') || '  No budgets set.'}

RECENT HISTORY:
${txs.slice(-5).map(t => `  - ${t.date}: ${t.desc} | ₹${t.amount} (${t.type})`).join('\n')}
`;
  }

  async function callGemini(userMsg, context) {
    const cfg = window.FINFLOW_CONFIG || {};
    const key = cfg.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key || key.length < 10) throw new Error('Invalid API Key');

    const systemPrompt = `You are FinBot, an elite financial auditor.
1. JSON COMMANDS: For actions, output ONLY the JSON block.
   - Transactions: {"action": "add_transaction", "amount": 500, "category": "Food", "desc": "Lunch", "type": "expense"}
   - Budgets: {"action": "set_budget", "amount": 5000, "category": "Education"}
2. REASONING: Explain your logic professionally after the JSON block.

CONTEXT:
${context}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
      })
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  function parseAction(text) {
    const m = text.match(/\{.*?"action"\s*:\s*"(add_transaction|set_budget)".*?\}/s);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    return null;
  }

  function isApiKeyConfigured() {
    const cfg = window.FINFLOW_CONFIG || {};
    const key = import.meta.env.VITE_GEMINI_API_KEY || cfg.GEMINI_API_KEY;
    return !!(key && key.length > 10);
  }

  async function processMessage(userMsg, txs, onAction, role = 'admin', budgets = {}) {
    const intent = detectIntent(userMsg);
    const context = buildContext(txs, budgets);

    if (isApiKeyConfigured()) {
      try {
        const aiText = await callGemini(userMsg, context);
        const action = parseAction(aiText);
        if (action && role === 'admin') {
          if (action.action === 'set_budget') {
             if (onAction) onAction({ action: 'set_budget', category: action.category, amount: action.amount });
             return { text: aiText.replace(/\{.*?\}/s, '').trim() || `Budget for ${action.category} set to ₹${action.amount}` };
          }
          if (action.action === 'add_transaction') {
             const tx = { ...action, id: Date.now(), date: new Date().toISOString().split('T')[0] };
             if (onAction) onAction({ action: 'add_transaction', tx });
             return { text: aiText.replace(/\{.*?\}/s, '').trim() || `Transaction logged: ${tx.desc} (₹${tx.amount})` };
          }
        }
        return { text: aiText };
      } catch (err) {
        console.warn("AI Error:", err.message);
      }
    }

    if (intent) {
      if (intent.action === 'set_budget' && role === 'admin') {
        if (onAction) onAction({ action: 'set_budget', category: intent.category, amount: intent.amount });
        return { text: `✅ **Budget Set!** ${intent.category} limit now ₹${intent.amount}` };
      }
      if (intent.action === 'add_transaction' && role === 'admin') {
        const tx = { ...intent.tx, id: Date.now() };
        if (onAction) onAction({ action: 'add_transaction', tx });
        return { text: `✅ **Logged!** ${tx.desc} (₹${tx.amount})` };
      }
      if (intent.action === 'help') return { text: "I can help you audit your finances. Try 'add expense 500' or 'set budget for Food to 5000'." };
    }

    return { text: "I'm not sure about that. Try asking: 'What is my balance?' or 'Show budget plan'." };
  }

  return { processMessage };

})();
