'use strict';

export const FinBot = (() => {

  /* ── Category & Amount Extraction ── */
  const CATEGORIES = ['Salary','Freelance','Investments','Housing','Food','Transport','Utilities','Entertainment','Health','Education','Shopping'];

  function extractAmount(text) {
    const m = text.match(/(?:₹|rs\.?|inr)?\s*(\d[\d,.]*)(?:\s*(?:k|thousand|lakh|crore))?/i);
    if (!m) return null;
    let val = parseFloat(m[1].replace(/,/g, ''));
    if (/k|thousand/i.test(text)) val *= 1000;
    if (/lakh/i.test(text)) val *= 100000;
    if (/crore/i.test(text)) val *= 10000000;
    return Math.round(val);
  }

  function extractCategory(text) {
    for (const c of CATEGORIES) {
      if (new RegExp(`\\b${c}\\b`, 'i').test(text)) return c;
    }
    if (/swiggy|zomato|grocer|restaurant|cafe|coffee|lunch|dinner|eat|meal|blinkit|zepto/i.test(text)) return 'Food';
    if (/rent|house|apartment|mortgage|emi|broker/i.test(text)) return 'Housing';
    if (/uber|ola|fuel|petrol|bus|metro|cab|taxi|rapido/i.test(text)) return 'Transport';
    if (/netflix|spotify|movie|game|pvr|club|pub|outing/i.test(text)) return 'Entertainment';
    if (/doctor|hospital|medicine|gym|pharma|dentist/i.test(text)) return 'Health';
    if (/course|book|study|tuition|udemy|coursera|college/i.test(text)) return 'Education';
    if (/amazon|flipkart|myntra|ajio|zara|clothes|shoes/i.test(text)) return 'Shopping';
    if (/electric|water|gas|internet|phone bill|recharge|jio|airtel|bescom/i.test(text)) return 'Utilities';
    if (/salary|paycheck|wages/i.test(text)) return 'Salary';
    if (/invest|mutual|sip|stock|dividend/i.test(text)) return 'Investments';
    return 'Other';
  }

  function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}`; }

  /* ── Intent Detection ── */
  function detectIntent(text) {
    const t = text.trim();

    // Budget set
    const budgetMatch =
      t.match(/(?:set|add|create|make|change|update|limit)\s+(?:the\s+)?(?:budget\s+for|budget)\s+([a-z\s]+?)\s+(?:to|at|is|of)\s+(?:₹|rs\.?|inr)?\s*(\d[\d,.]*)/i) ||
      t.match(/(?:set|add|create|change|update)\s+(?:₹|rs\.?|inr)?\s*(\d[\d,.]*)\s+(?:as\s+)?budget\s+(?:for)\s+([a-z\s]+)/i) ||
      t.match(/([a-z\s]+?)\s+budget\s+(?:to|at|is|of)\s+(?:₹|rs\.?|inr)?\s*(\d[\d,.]*)/i);
    if (budgetMatch) {
      const [, g1, g2] = budgetMatch;
      const catStr = isNaN(Number(g1.replace(/,/g,''))) ? g1 : g2;
      const amtStr = isNaN(Number(g1.replace(/,/g,''))) ? g2 : g1;
      return { action: 'set_budget', category: extractCategory(catStr), amount: parseFloat(amtStr.replace(/,/g,'')) };
    }

    // Delete relative transaction
    let relMatch = t.match(/delete.*(last|second last|first|previous).*transaction/i);
    if (relMatch) {
      return { action: 'delete_relative', which: relMatch[1].toLowerCase() };
    }

    // Delete transaction
    if (/(?:delete|remove|undo|erase|cancel)\s+(?:the\s+)?(?:transaction|expense|income)?/i.test(t)) {
      return { action: 'delete_transaction', query: t };
    }

    // Add transaction
    const amt = extractAmount(t);
    if (amt && /(?:add|spent|record|log|bought|paid|income|salary|freelance|got|received|earned|expense)/i.test(t)) {
      const type = /income|salary|freelance|gig|earned|deposit|credited|received/i.test(t) ? 'income' : 'expense';
      const category = extractCategory(t);
      const descRaw = t.replace(/(?:add|spent|record|log|bought|paid for|income|salary|freelance|received|earned|expense|of|for|on|to|the|a|an|\d+|₹|rs|inr|k|thousand|lakh)/gi, ' ').replace(/\s+/g, ' ').trim();
      const desc = descRaw || (type === 'income' ? 'Income' : `${category} expense`);
      return { action: 'add_transaction', tx: { id: Date.now(), date: new Date().toISOString().slice(0,10), desc, amount: amt, category, type } };
    }

    // Other intents
    if (/balance|how much.*(have|left|remaining|available)|net worth|current balance/i.test(t)) return { action: 'balance' };
    if (/top spend|most spent|highest.?categor|where.*money.*going|biggest expense|spending breakdown|category breakdown/i.test(t)) return { action: 'top_spend' };
    if (/best.*(transaction|tx|income)|top.*(transaction|tx|income)|highest.*amount|largest transaction/i.test(t)) return { action: 'top_tx' };
    if (/worst.*transaction|lowest.*income|smallest.*amount|bottom.*transaction/i.test(t)) return { action: 'worst_tx' };
    if (/forecast|predict|project|estimate.*future|next month|will.*spend|trending/i.test(t)) return { action: 'forecast' };
    if (/this month|last month|monthly|month report|mar|feb|jan|previous month|month comparison/i.test(t)) return { action: 'monthly' };
    if (/compar|versus|vs\.?|difference|growth|change.*between|month over month/i.test(t)) return { action: 'comparison' };
    if (/search|find|look for|show.*transaction|filter/i.test(t)) return { action: 'search', query: t };
    if (/categ|food|housing|transport|entertainment|health|education|shopping|utilities|breakdown by/i.test(t)) return { action: 'category', query: t };
    if (/budget|plan|50.?30.?20|saving goal|recommendation|suggest/i.test(t)) return { action: 'budget_view' };
    if (/insight|analys|summar|overview|trend|pattern|report|statistic|performance|audit/i.test(t)) return { action: 'insight' };
    if (/if.*(have|got|had|earn|income|get|i ve|ive|i've).*(\d)|how.*spend|how.*myust.*i.*spend|allocat|split.*money|divide.*salary|how.*invest/i.test(t)) {
      const planAmt = extractAmount(t) || 50000;
      return { action: 'plan_amount', amount: planAmt };
    }
    if (/delete.*conversation|clear.*chat|reset.*chat|remove.*history|wipe.*chat/i.test(t)) return { action: 'delete_conv' };
    if (/hello|hi|hey|greet|good morning|good evening|wassup|sup|what.*can.*you|help|commands|guide|tutorial/i.test(t)) return { action: 'help' };

    return null;
  }

  /* ── Financial Analysis Helpers ── */
  function buildAnalysis(txs, budgets) {
    const income = txs.filter(t => t.type === 'income');
    const expenses = txs.filter(t => t.type === 'expense');
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    const byCategory = {};
    const worthlessCats = ['Entertainment', 'Shopping'];
    let worthySum = 0, worthlessSum = 0;

    expenses.forEach(t => { 
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; 
      if (worthlessCats.includes(t.category)) worthlessSum += t.amount;
      else worthySum += t.amount;
    });
    const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    // Monthly breakdown
    const monthly = {};
    txs.forEach(t => {
      const mo = t.date?.slice(0, 7) || 'Unknown';
      if (!monthly[mo]) monthly[mo] = { income: 0, expense: 0 };
      monthly[mo][t.type] += t.amount;
    });

    return { totalIncome, totalExpense, balance, savingsRate, byCategory, topCategories, monthly, income, expenses, worthySum, worthlessSum };
  }

  /* ── RAG Response Engine (Offline) ── */
  function ragResponse(intent, txs, budgets, onAction) {
    const a = buildAnalysis(txs, budgets);

    switch (intent.action) {
      case 'balance':
        return [
          `**Your Financial Overview**`,
          `• Income  : **${fmt(a.totalIncome)}**`,
          `• Expenses: **${fmt(a.totalExpense)}**`,
          `• Balance : **${fmt(a.balance)}** ${a.balance >= 0 ? '[+]' : '[!]'}`,
          `• Savings : **${a.savingsRate}%**`,
          a.balance < 0 ? `\n[!] You are **overspending** by ${fmt(Math.abs(a.balance))}. Review your top expense categories.` : `\nYour finances are in good shape.`
        ].join('\n');

      case 'top_spend': {
        if (a.topCategories.length === 0) return 'No expense data to analyze.';
        const list = a.topCategories.slice(0, 5).map(([cat, amt], i) => {
          const pct = a.totalExpense > 0 ? ((amt / a.totalExpense) * 100).toFixed(1) : 0;
          const bar = '█'.repeat(Math.round(Number(pct) / 10)) + '░'.repeat(10 - Math.round(Number(pct) / 10));
          return `${i + 1}. **${cat}** — ${fmt(amt)} (${pct}%)\n   ${bar}`;
        }).join('\n');
        return `**Top Spending Categories**\n${list}\n\nYour biggest expense is **${a.topCategories[0][0]}** — is this within your budget?`;
      }

      case 'top_tx': {
        const top = [...a.expenses].sort((a, b) => b.amount - a.amount).slice(0, 3);
        if (!top.length) return 'No transactions found.';
        return `**Highest Transactions**\n${top.map((t,i) => `${i+1}. ${t.desc} — **${fmt(t.amount)}** (${t.category})`).join('\n')}`;
      }

      case 'worst_tx': {
        const worst = [...a.expenses].sort((a, b) => a.amount - b.amount).slice(0, 3);
        if (!worst.length) return 'No transactions found.';
        return `**Smallest Expense Transactions**\n${worst.map((t,i) => `${i+1}. ${t.desc} — **${fmt(t.amount)}** (${t.category})`).join('\n')}`;
      }

      case 'budget_view': {
        if (Object.keys(budgets).length === 0 && a.topCategories.length === 0)
          return 'No budgets set yet. Say _"Set budget for Food to 5000"_ to create one.';

        const budgetLines = a.topCategories.map(([cat, spent]) => {
          const limit = budgets[cat];
          if (limit) {
            const pct = ((spent / limit) * 100).toFixed(0);
            const status = spent > limit ? `[!] **OVER** by ${fmt(spent - limit)}` : `[OK] ${fmt(limit - spent)} remaining`;
            return `• **${cat}**: Spent ${fmt(spent)} / Budget ${fmt(limit)} — ${status}`;
          }
          return `• **${cat}**: ${fmt(spent)} spent (no budget set)`;
        });

        const advice = a.totalIncome > 0 ? [
          `\n**50/30/20 Recommendation** for ${fmt(a.totalIncome)}/month:`,
          `• Needs  (50%): ${fmt(a.totalIncome * 0.5)}`,
          `• Wants  (30%): ${fmt(a.totalIncome * 0.3)}`,
          `• Savings(20%): ${fmt(a.totalIncome * 0.2)}`
        ].join('\n') : '';

        return `**Budget Status**\n${budgetLines.join('\n')}${advice}`;
      }

      case 'insight': {
        const riskLevel = a.savingsRate < 10 ? 'Critical' : a.savingsRate < 25 ? 'Moderate' : 'Healthy';
        const tips = [];
        if (a.topCategories[0] && a.topCategories[0][1] > a.totalIncome * 0.4) tips.push(`• **${a.topCategories[0][0]}** is consuming over 40% of income — consider cutting back.`);
        if (a.totalExpense > a.totalIncome) tips.push('• You are spending more than you earn — immediate review recommended.');
        if (Number(a.savingsRate) < 20) tips.push(`• Your savings rate of **${a.savingsRate}%** is below the 20% target. Try reducing discretionary spending.`);
        if (!tips.length) tips.push('• Your financial habits look solid. Keep maintaining your savings rate!');
        return [
          `**FinBot Financial Intelligence Report**`,
          `• Health  : **${riskLevel}**`,
          `• Income  : ${fmt(a.totalIncome)} | Expenses: ${fmt(a.totalExpense)} | Balance: ${fmt(a.balance)}`,
          `• Savings : **${a.savingsRate}%**`,
          `• Top Exp : **${a.topCategories[0]?.[0] || 'N/A'}** at ${fmt(a.topCategories[0]?.[1] || 0)}`,
          `\n**Insights & Recommendations:**`,
          ...tips
        ].join('\n');
      }

      case 'monthly': {
        const months = Object.entries(a.monthly).sort().reverse().slice(0, 4);
        if (!months.length) return 'No monthly data available.';
        const lines = months.map(([mo, d]) => `• **${mo}**: Income ${fmt(d.income)} | Expenses ${fmt(d.expense)} | ${d.income >= d.expense ? 'Surplus' : 'Deficit'} ${fmt(Math.abs(d.income - d.expense))}`);
        return `**Monthly Breakdown**\n${lines.join('\n')}`;
      }

      case 'forecast': {
        const months = Object.entries(a.monthly).sort();
        if (months.length < 2) return 'Not enough data for a forecast. Add more transactions first.';
        const last = months.slice(-3);
        const avgExp = last.reduce((s, [,d]) => s + d.expense, 0) / last.length;
        const avgInc = last.reduce((s, [,d]) => s + d.income, 0) / last.length;
        const projected = avgInc - avgExp;
        return [
          `**Spending Forecast (Next Month)**`,
          `• Projected Income  : **${fmt(Math.round(avgInc))}**`,
          `• Projected Expenses: **${fmt(Math.round(avgExp))}**`,
          `• Projected Balance : **${fmt(Math.round(projected))}** ${projected >= 0 ? '[+]' : '[!]'}`,
          `\n_Based on your last ${last.length} month(s) of data._`,
          projected < 0 ? `\n[!] At this rate you'll be in deficit. Consider reducing ${a.topCategories[0]?.[0] || 'discretionary'} spending.` : `\nYour trajectory looks positive.`
        ].join('\n');
      }

      case 'comparison': {
        const months = Object.entries(a.monthly).sort().reverse();
        if (months.length < 2) return 'Not enough monthly data to compare.';
        const [m1k, m1] = months[0];
        const [m2k, m2] = months[1];
        const expChange = m1.expense - m2.expense;
        const incChange = m1.income - m2.income;
        return [
          `**Month-over-Month Comparison**`,
          `**${m1k}** vs **${m2k}**`,
          `• Income  : ${fmt(m1.income)} vs ${fmt(m2.income)} — ${fmt(Math.abs(incChange))} ${incChange >= 0 ? 'increase' : 'decrease'}`,
          `• Expenses: ${fmt(m1.expense)} vs ${fmt(m2.expense)} — ${expChange >= 0 ? 'Higher' : 'Lower'} by ${fmt(Math.abs(expChange))}`,
        ].join('\n');
      }

      case 'search': {
        const query = intent.query.replace(/search|find|look for|show|transaction/gi, '').trim().toLowerCase();
        if (!query) return 'Please specify what to search for. E.g., _"Find food transactions"_';
        const results = txs.filter(t => t.desc?.toLowerCase().includes(query) || t.category?.toLowerCase().includes(query));
        if (!results.length) return `No transactions found matching **"${query}"**.`;
        return `**Search Results for "${query}"**\n${results.slice(0,8).map(t => `• ${t.date}: ${t.desc} — **${fmt(t.amount)}** (${t.type})`).join('\n')}`;
      }

      case 'category': {
        const cat = extractCategory(intent.query);
        const catTxs = a.expenses.filter(t => t.category === cat);
        const total = catTxs.reduce((s, t) => s + t.amount, 0);
        if (!catTxs.length) return `No **${cat}** expenses found.`;
        return [
          `**${cat} Analysis**`,
          `• Total Spent  : **${fmt(total)}**`,
          `• Transactions : ${catTxs.length}`,
          `• Average      : **${fmt(Math.round(total / catTxs.length))}**`,
          `• Budget Limit : ${budgets[cat] ? fmt(budgets[cat]) : 'Not set'}`,
          `\nRecent:\n${catTxs.slice(-5).map(t => `• ${t.date}: ${t.desc} — ${fmt(t.amount)}`).join('\n')}`
        ].join('\n');
      }

      case 'add_transaction': {
        const tx = { ...intent.tx, id: Date.now() };
        
        let warningMsg = null;
        if (['Entertainment', 'Shopping'].includes(tx.category) && tx.amount > 500) {
          warningMsg = `[!] This is a high discretionary ("worthless") expense of ${fmt(tx.amount)}. Are you sure you want to log it? (Yes/No)`;
        } else if (budgets[tx.category]) {
          const spent = a.expenses.filter(t => t.category === tx.category && t.date.startsWith(tx.date.slice(0,7))).reduce((s,t)=>s+t.amount,0);
          if (spent + tx.amount > budgets[tx.category]) {
            warningMsg = `[!] Adding this will push your **${tx.category}** spending OVER your monthly budget limit of ${fmt(budgets[tx.category])}. Confirm add? (Yes/No)`;
          }
        }

        if (warningMsg) {
          return { requiresWarning: true, text: warningMsg, pendingTx: tx };
        }

        if (onAction) onAction({ action: 'add_transaction', tx });
        return `**Transaction Logged**\n• Description: ${tx.desc}\n• Amount     : **${fmt(tx.amount)}**\n• Category   : ${tx.category}\n• Type       : ${tx.type}\n• Date       : ${tx.date}`;
      }

      case 'delete_transaction': {
        const q = intent.query.replace(/delete|remove|undo|erase|cancel|transaction|expense|income|the/gi, '').trim().toLowerCase();
        const match = txs.find(t => t.desc?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q));
        if (!match) {
          const recent = txs.slice(-5).map(t => `• "${t.desc}" — ${fmt(t.amount)} (${t.date})`).join('\n');
          return `No transaction found matching **"${q}"**.\n\nRecent transactions:\n${recent || 'No transactions yet.'}\n\nTry: _"Delete [description]"_ or be more specific.`;
        }
        if (onAction) onAction({ action: 'delete_transaction', id: match.id });
        return `**Deleted:** ${match.desc} — ${fmt(match.amount)} (${match.date})`;
      }

      case 'delete_relative': {
        if (!txs.length) return 'No transactions available to delete.';
        const sorted = [...txs].sort((a,b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
        const which = intent.which;
        let target = sorted[0];
        if (which.includes('second')) target = sorted[1];
        
        if (!target) return `Could not find a ${which} transaction.`;
        if (onAction) onAction({ action: 'delete_transaction', id: target.id });
        return `**Deleted ${which}:** ${target.desc} — ${fmt(target.amount)} (${target.date})`;
      }

      case 'set_budget':
        if (onAction) onAction({ action: 'set_budget', category: intent.category, amount: intent.amount });
        return `**Budget Updated**\n• Category  : **${intent.category}**\n• New Limit : **${fmt(intent.amount)}**\n\nSpending will be tracked against this limit.`;

      case 'plan_amount': {
        const pa = intent.amount || a.totalIncome;
        if (!pa) return `Please specify an amount. E.g., "If I have 50000, how should I spend it?"`;
        
        let needsPct = 50, wantsPct = 30, savingsPct = 20;
        const basis = a.totalIncome || a.totalExpense;
        if (basis > 0) {
          needsPct = Math.max(0, Math.round((a.worthySum / basis) * 100));
          wantsPct = Math.max(0, Math.round((a.worthlessSum / basis) * 100));
          savingsPct = Math.max(0, 100 - needsPct - wantsPct);
        }

        const needs   = Math.round(pa * (needsPct/100));
        const wants   = Math.round(pa * (wantsPct/100));
        const savings = Math.round(pa * (savingsPct/100));
        
        return [
          `**Smart Budget Plan for ${fmt(pa)}/month**`,
          `_Trained on your historical spending patterns:_`,
          ``,
          `• Essential/Worthy (${needsPct}%) : **${fmt(needs)}**`,
          `  — Based on past needs (Housing, Utilities, etc.)`,
          `• Discretionary/Worthless (${wantsPct}%) : **${fmt(wants)}**`,
          `  — Based on past wants (Entertainment, Shopping)`,
          `• Savings (${savingsPct}%) : **${fmt(savings)}**`,
          `  — Suggested reserves`,
          ``,
          `_Tip: Keep discretionary spending under 30% for optimal financial health._`
        ].join('\n');
      }

      case 'delete_conv':
        if (onAction) onAction({ action: 'clear_chat' });
        return '';

      case 'help':
        return [
          `**Hello! I'm FinBot, your AI financial companion.**`,
          ``,
          `Here's what I can do:`,
          `**Analysis    :** "What's my balance?" | "Show insights" | "Spending forecast"`,
          `**Transactions :** "Add 500 food expense" | "Log 50000 salary income" | "Delete Swiggy transaction"`,
          `**Budget       :** "Set budget for Food to 5000" | "Show budget plan"`,
          `**Search       :** "Find transport transactions" | "Show this month's summary"`,
          `**Chat         :** "Clear chat"`,
        ].join('\n');

      default:
        return null;
    }
  }

  /* ── Gemini AI Call ── */
  async function callGemini(userMsg, txs, budgets) {
    const cfg = window.FINFLOW_CONFIG || {};
    const key = cfg.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key || key.length < 10) throw new Error('No API key');

    const a = buildAnalysis(txs, budgets);
    const context = `
FINFLOW FINANCIAL CONTEXT:
- Net Balance: ${fmt(a.balance)} (Income: ${fmt(a.totalIncome)}, Expenses: ${fmt(a.totalExpense)})
- Savings Rate: ${a.savingsRate}%
- Top Expense Categories: ${a.topCategories.slice(0,5).map(([c,v])=>`${c}: ${fmt(v)}`).join(', ')}
- Active Budgets: ${Object.entries(budgets).map(([c,a])=>`${c}: ${fmt(a)}`).join(', ') || 'None'}
- Recent Transactions: ${txs.slice(-8).map(t=>`${t.date}|${t.desc}|${fmt(t.amount)}|${t.type}`).join(' ; ')}
`;

    const systemPrompt = `You are FinBot, a world-class AI financial advisor trained on this user's personal financial data.
Your personality: professional, concise, insightful, helpful. Use ₹ for Indian currency.

When the user wants to ADD a transaction, output EXACTLY this JSON on its own line:
{"action":"add_transaction","amount":500,"category":"Food","desc":"Swiggy dinner","type":"expense"}

When the user wants to SET a budget, output EXACTLY this JSON on its own line:
{"action":"set_budget","amount":5000,"category":"Food"}

When the user wants to DELETE a transaction, output EXACTLY this JSON on its own line:
{"action":"delete_transaction","desc":"partial description"}

For all other queries, provide expert financial analysis using the context below.
Always use **bold** for numbers and key points. Keep response under 200 words.

${context}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 600 }
      })
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  function parseAction(text) {
    const m = text.match(/\{[^{}]*"action"\s*:\s*"(add_transaction|set_budget|delete_transaction)"[^{}]*\}/s);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    return null;
  }

  function isApiKeyConfigured() {
    const cfg = window.FINFLOW_CONFIG || {};
    const key = import.meta.env.VITE_GEMINI_API_KEY || cfg.GEMINI_API_KEY;
    return !!(key && key.length > 10);
  }

  /* ── Main processMessage ── */
  async function processMessage(userMsg, txs, onAction, role = 'admin', budgets = {}) {
    const intent = detectIntent(userMsg);

    // Handle clear chat immediately (no AI needed)
    if (intent?.action === 'delete_conv') {
      if (onAction) onAction({ action: 'clear_chat' });
      return { text: '' };
    }

    // Try Gemini AI first if configured
    if (isApiKeyConfigured()) {
      try {
        const aiText = await callGemini(userMsg, txs, budgets);
        const action = parseAction(aiText);
        if (action && role === 'admin') {
          if (action.action === 'add_transaction') {
            const tx = { ...action, id: Date.now(), date: new Date().toISOString().split('T')[0] };
            if (onAction) onAction({ action: 'add_transaction', tx });
          } else if (action.action === 'set_budget') {
            if (onAction) onAction({ action: 'set_budget', category: action.category, amount: action.amount });
          } else if (action.action === 'delete_transaction') {
            const match = txs.find(t => t.desc?.toLowerCase().includes((action.desc || '').toLowerCase()));
            if (match && onAction) onAction({ action: 'delete_transaction', id: match.id });
          }
        }
        const cleanText = aiText.replace(/\{[^{}]*"action"[^{}]*\}/gs, '').trim();
        return { text: cleanText || 'Action completed.' };
      } catch (err) {
        console.warn('FinBot AI error, using RAG fallback:', err.message);
      }
    }

    // Offline RAG fallback
    if (intent) {
      // For admin-only actions, check role
      if (['add_transaction', 'delete_transaction', 'set_budget'].includes(intent.action) && role !== 'admin') {
        return { text: 'This action requires **Admin** access. You are currently in Viewer mode.' };
      }
      const ragOutcome = ragResponse(intent, txs, budgets, onAction);
      if (ragOutcome !== null) {
        if (typeof ragOutcome === 'string') return { text: ragOutcome };
        return ragOutcome; // returns { requiresWarning, text, pendingTx }
      }
    }

    // Final fallback
    return { text: `I didn't quite understand that. Try:\n• "What's my balance?"\n• "Add 1500 food expense"\n• "Set budget for Transport to 3000"\n• "Show spending forecast"\n• "Help"` };
  }

  return { processMessage };

})();
