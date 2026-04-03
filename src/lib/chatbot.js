'use strict';

export const FinBot = (() => {

  const INTENTS = [
    { name: 'add_income',  patterns: [/(?:add|create|record|log|entered|got).*(?:income|earn|deposit|salary|bonus|payment|credit)/i, /got paid|received|earned|salary|deposit|credited|added income/i] },
    { name: 'add_expense', patterns: [/(?:add|create|record|log|entered|spent).*(?:expense|spend|bill|cost|pay|payment|paid|charge)/i, /spent|paid for|bought|purchase|bill|fee|cost me|charged/i] },
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
    { name: 'delete',      patterns: [/delete|remove|undo|erase|clear.*transaction|forget|cancel.*transaction/i] },
    { name: 'improve_advice', patterns: [/how.*spend better|improve.*spending|what to improve/i, /could.*have spent better/i, /better spend/i] },
    { name: 'post_income_plan', patterns: [/received.*(income|salary).*how/i, /got.*(income|salary).*how/i, /what to do with.*salary/i, /now that i.*(received|got)/i] },
    { name: 'excessive_warnings', patterns: [/drained|worthless|excessive|warning.*excess|wasted/i, /mark expense which drained/i] },
    { name: 'help',        patterns: [/help|what can you|commands|hi|hello|hey|assist|support|guide|tutorial/i] },
  ];

  function getValueScore(tx) {
    const valueByCategory = {
      Housing: 90, Health: 85, Utilities: 80, Education: 85, Food: 60,
      Entertainment: 20, Shopping: 30, Transport: 50,
      Salary: 100, Freelance: 95, Investments: 90, Other: 50
    };
    const categoryValue = valueByCategory[tx.category] || 50;
    const amountScore = Math.max(0, 100 - (tx.amount / 100));
    return (categoryValue * 0.7) + (amountScore * 0.3);
  }

  function extractAmount(text) {
    const m = text.match(/(?:₹|rs|rs\.)?[\s]*(\d[\d,\.]*)[\s]*(?:k|K|thousand|crore)?/);
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
    if (/grocer|restaurant|cafe|coffee|lunch|dinner|food/i.test(text)) return 'Food';
    if (/rent|house|apartment|mortgage/i.test(text)) return 'Housing';
    if (/uber|ola|fuel|petrol|bus|metro|cab/i.test(text)) return 'Transport';
    if (/netflix|spotify|movie|game|outing/i.test(text)) return 'Entertainment';
    if (/doctor|hospital|medicine|gym|pharma/i.test(text)) return 'Health';
    if (/course|book|study|tuition/i.test(text)) return 'Education';
    if (/amazon|flipkart|shopping|clothes|shoes/i.test(text)) return 'Shopping';
    if (/electric|water|gas|internet|phone bill/i.test(text)) return 'Utilities';
    if (/freelance|client|project|contract/i.test(text)) return 'Freelance';
    if (/divid|stock|mutual fund|invest/i.test(text)) return 'Investments';
    return 'Other';
  }

  function detectIntent(text) {
    for (const { name, patterns } of INTENTS) {
      if (patterns.some(p => p.test(text))) return name;
    }
    return 'general';
  }

  function buildContext(txs) {
    const cfg = window.FINFLOW_CONFIG || {};
    const limit = cfg.RAG_MAX_TRANSACTIONS || 50;
    const recent = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
    const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;
    const catMap = {};
    txs.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const catSummary = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `  ${k}: ₹${v}`).join('\n');
    const months = ['2026-03','2026-02','2026-01'];
    const monthSummary = months.map(m => {
      const mInc = txs.filter(t=>t.type==='income'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
      const mExp = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
      return `  ${m}: Income ₹${mInc}, Expenses ₹${mExp}, Saved ₹${mInc-mExp}`;
    }).join('\n');
    return `
FINANCIAL DATA CONTEXT:
Total Income: ₹${income}
Total Expenses: ₹${expenses}
Net Balance: ₹${balance}
Savings Rate: ${income > 0 ? ((balance/income)*100).toFixed(1) : 0}%

SPENDING BY CATEGORY:
${catSummary || '  No expenses yet'}

MONTHLY SUMMARY (last 3 months):
${monthSummary}

RECENT TRANSACTIONS (last ${Math.min(recent.length, 10)}):
${recent.slice(0,10).map(t=>`  ${t.date} | ${t.type.toUpperCase()} | ${t.category} | ${t.desc} | ₹${t.amount}`).join('\n')}
`;
  }

  function buildBudgetPlan(txs, userAmt) {
    const cfg = window.FINFLOW_CONFIG || {};
    const months = cfg.BUDGET_ANALYSIS_MONTHS || 3;
    const allMonthsInData = [...new Set(txs.map(t => t.date.slice(0,7)))].sort();
    const analysisMonths = allMonthsInData.slice(-Math.max(months, 1));
    
    let avgInc = userAmt; 
    let basisText = userAmt ? `given input` : `last ${analysisMonths.length} month${analysisMonths.length!==1?'s':''} average income`;
    
    if (!avgInc) {
      avgInc = analysisMonths.length > 0
        ? analysisMonths.map(m => txs.filter(t=>t.type==='income'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0)).reduce((a,b)=>a+b,0) / analysisMonths.length
        : 0;
    }
    const catMap = {};
    const recentTxs = txs.filter(t => t.type==='expense' && analysisMonths.some(m=>t.date.startsWith(m)));
    recentTxs.forEach(t => { catMap[t.category] = (catMap[t.category]||0) + t.amount; });
    Object.keys(catMap).forEach(k => { catMap[k] = catMap[k] / Math.max(analysisMonths.length, 1); });
    const needs = (catMap.Housing||0) + (catMap.Food||0) + (catMap.Utilities||0) + (catMap.Transport||0) + (catMap.Health||0);
    const wants = (catMap.Entertainment||0) + (catMap.Shopping||0) + (catMap.Education||0);
    const actual_savings = avgInc - needs - wants;
    const budget50 = avgInc * 0.50;
    const budget30 = avgInc * 0.30;
    const budget20 = avgInc * 0.20;
    const fmtN = n => `₹${Math.round(n).toLocaleString('en-IN')}`;
    const lines = [];
    lines.push(`📊 **Budget Plan** (based on ${basisText}: ${fmtN(avgInc)})`);
    lines.push('');
    lines.push('**50/30/20 Rule Recommendation:**');
    lines.push(`• **Needs** (50%): ${fmtN(budget50)} → You spent ${fmtN(needs)} ${needs>budget50?'⚠️ Over!':'✅ Good'}`);
    lines.push(`• **Wants** (30%): ${fmtN(budget30)} → You spent ${fmtN(wants)} ${wants>budget30?'⚠️ Over!':'✅ Good'}`);
    lines.push(`• **Savings** (20%): ${fmtN(budget20)} → Actual ${fmtN(actual_savings)} ${actual_savings<budget20?'⚠️ Low!':'✅ Great'}`);
    lines.push('');
    const tips = [];
    if ((catMap.Food||0) > 3000) tips.push('🍽  Food spending is high — try meal prepping');
    if ((catMap.Entertainment||0) > 1000) tips.push('🎬 Entertainment is a big chunk — review subscriptions');
    if ((catMap.Shopping||0) > 1500) tips.push('🛍 Shopping trend up — try 24-hour rule before purchases');
    if (actual_savings < budget20 && avgInc>0) tips.push(`💰 Boost savings by cutting ${fmtN(budget20-actual_savings)} from wants`);
    if (tips.length) { lines.push('**Personalized Tips:**'); tips.forEach(t => lines.push(t)); }
    return lines.join('\n');
  }

  function localResponse(intent, userMsg, txs, role) {
    const income   = txs.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expenses = txs.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const balance  = income - expenses;
    const pct      = income > 0 ? (expenses/income*100).toFixed(1) : 0;
    const fmtN     = n => `₹${Math.round(n).toLocaleString('en-IN')}`;
    const catMap = {};
    txs.filter(t=>t.type==='expense').forEach(t=>{ catMap[t.category]=(catMap[t.category]||0)+t.amount; });
    const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
    function healthEmoji(p) { return p < 50 ? '🟢' : p < 75 ? '🟡' : '🔴'; }

    switch(intent) {
      case 'balance':
        return '💰 **Your Financial Snapshot**\n• Net Balance: **' + fmtN(balance) + '**\n• Total Income: ' + fmtN(income) + '\n• Total Expenses: ' + fmtN(expenses) + '\n• Spending rate: ' + pct + '% of income ' + healthEmoji(+pct);

      case 'top_spend': {
        if (!topCat) return '📊 No expense data yet. Add some transactions first!';
        const topList = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5)
          .map(([k,v],i)=>`${i+1}. **${k}**: ${fmtN(v)}`).join('\n');
        return '📊 **Top Spending Categories:**\n' + topList + '\n\n💡 Your biggest expense is **' + topCat[0] + '** at ' + fmtN(topCat[1]);
      }

      case 'top_tx': {
        const numMatch = userMsg.match(/(\d+)/);
        const num = numMatch ? Math.min(parseInt(numMatch[1]), 10) : 3;
        let filtered = txs;
        if (/income/i.test(userMsg)) filtered = txs.filter(t => t.type === 'income');
        else if (/expense/i.test(userMsg)) filtered = txs.filter(t => t.type === 'expense');
        const topTxs = [...filtered].sort((a, b) => getValueScore(b) - getValueScore(a)).slice(0, num);
        if (topTxs.length === 0) return `📋 No transactions found. Try adding some first!`;
        const list = topTxs.map((t, i) => {
          const score = getValueScore(t);
          const scoreEmoji = score > 70 ? '⭐⭐⭐' : score > 50 ? '⭐⭐' : '⭐';
          return `${i+1}. **${t.date}** | ${t.type === 'income' ? '📈' : '📉'} ${t.category} | **${fmtN(t.amount)}** | ${t.desc} ${scoreEmoji}`;
        }).join('\n');
        return `⭐ **Best ${num} Value Transactions:**\n${list}`;
      }

      case 'worst_tx': {
        const numMatch = userMsg.match(/(\d+)/);
        const num = numMatch ? Math.min(parseInt(numMatch[1]), 10) : 3;
        let filtered = txs;
        if (/income/i.test(userMsg)) filtered = txs.filter(t => t.type === 'income');
        else if (/expense/i.test(userMsg)) filtered = txs.filter(t => t.type === 'expense');
        const worstTxs = [...filtered].sort((a, b) => getValueScore(a) - getValueScore(b)).slice(0, num);
        if (worstTxs.length === 0) return `📋 No transactions found. Try adding some first!`;
        const list = worstTxs.map((t, i) => {
          const score = getValueScore(t);
          const scoreEmoji = score < 30 ? '❌❌❌' : score < 50 ? '❌❌' : '❌';
          return `${i+1}. **${t.date}** | ${t.type === 'income' ? '📈' : '📉'} ${t.category} | **${fmtN(t.amount)}** | ${t.desc} ${scoreEmoji}`;
        }).join('\n');
        return `📉 **Worst ${num} Value Transactions:**\n${list}\n\n💡 **Tip:** Consider alternatives for these categories.`;
      }

      case 'search': {
        const searchTerm = userMsg.replace(/(?:search|find|look for|show|filter|where)/gi, '').trim();
        if (!searchTerm) return `🔍 What would you like to search for?`;
        const results = txs.filter(t =>
          new RegExp(searchTerm, 'i').test(t.desc) ||
          new RegExp(searchTerm, 'i').test(t.category) ||
          t.amount.toString() === searchTerm
        ).slice(0, 10);
        if (results.length === 0) return `❌ No transactions found matching "${searchTerm}"`;
        const list = results.map((t, i) =>
          `${i+1}. **${t.date}** | ${t.type === 'income' ? '📈' : '📉'} ${t.category} | **${fmtN(t.amount)}** | ${t.desc}`
        ).join('\n');
        return `🔍 **Found ${results.length} transaction${results.length!==1?'s':''}:**\n${list}`;
      }

      case 'comparison': {
        const months = ['2026-03', '2026-02', '2026-01'];
        const comparisons = [];
        for (let i = 0; i < months.length - 1; i++) {
          const m1 = months[i], m2 = months[i+1];
          const exp1 = txs.filter(t => t.type === 'expense' && t.date.startsWith(m1)).reduce((s, t) => s + t.amount, 0);
          const exp2 = txs.filter(t => t.type === 'expense' && t.date.startsWith(m2)).reduce((s, t) => s + t.amount, 0);
          const inc1 = txs.filter(t => t.type === 'income' && t.date.startsWith(m1)).reduce((s, t) => s + t.amount, 0);
          const inc2 = txs.filter(t => t.type === 'income' && t.date.startsWith(m2)).reduce((s, t) => s + t.amount, 0);
          const expChange = exp1 - exp2;
          const incChange = inc1 - inc2;
          comparisons.push(`**${m1} vs ${m2}:**\n• Expenses: ${fmtN(exp1)} → ${fmtN(exp2)} (${expChange > 0 ? '📈 +' : '📉 '}${fmtN(Math.abs(expChange))})\n• Income: ${fmtN(inc1)} → ${fmtN(inc2)} (${incChange > 0 ? '📈 +' : '📉 '}${fmtN(Math.abs(incChange))})\n`);
        }
        return `📊 **Month-over-Month Comparison:**\n${comparisons.join('\n')}`;
      }

      case 'forecast': {
        const months = [...new Set(txs.map(t => t.date.slice(0,7)))].sort().slice(-3);
        if (months.length < 2) return `📈 Not enough data to forecast. Add more transactions!`;
        const exps = months.map(m => txs.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0));
        const avgMonthlyExp = exps.reduce((a, b) => a + b, 0) / exps.length;
        const trend = exps[exps.length - 1] > exps[exps.length - 2] ? 'increasing' : 'decreasing';
        const projected = avgMonthlyExp * 1.1;
        return `📈 **Expense Forecast (Next Month):**\n• Average Monthly: ${fmtN(avgMonthlyExp)}\n• Trend: ${trend} 📊\n• Projected: ${fmtN(projected)}\n\n💡 **Tip:** Budget around ${fmtN(projected)} to be safe.`;
      }

      case 'budget': {
        const amt = extractAmount(userMsg);
        return buildBudgetPlan(txs, amt || null);
      }

      case 'insight': {
        const savingsRate = income>0?((balance/income)*100).toFixed(1):0;
        const recent = [...txs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
        const insightCategoriesText = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map((c,i)=>`${i+1}. ${c[0]} (${fmtN(c[1])})`).join(', ') || 'N/A';
        return `🔍 **Financial Insights**\n\n• **Savings Rate**: ${savingsRate}%\n• **Spending Health**: ${pct<50?'🟢 Healthy':pct<75?'🟡 Caution':'🔴 High Risk'} (${pct}%)\n• **Top Categories**: ${insightCategoriesText}\n• **Transactions**: ${txs.length} total\n\n**Recent Activity:**\n${recent.map(t=>`• ${t.date}: ${t.desc} ${t.type==='income'?'+':'-'}${fmtN(t.amount)}`).join('\n')}`;
      }

      case 'monthly': {
        const months = ['2026-03','2026-02','2026-01'];
        const out = months.map(m => {
          const mI = txs.filter(t=>t.type==='income'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
          const mE = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m)).reduce((s,t)=>s+t.amount,0);
          const label = m==='2026-03'?'March':m==='2026-02'?'February':'January';
          return `**${label}**: Inc ${fmtN(mI)} | Exp ${fmtN(mE)} | Saved ${fmtN(mI-mE)}`;
        });
        return `📅 **Monthly Breakdown:**\n${out.join('\n')}\n\n📈 Trend: ${txs.filter(t=>t.date.startsWith('2026-03')&&t.type==='expense').reduce((s,t)=>s+t.amount,0) < txs.filter(t=>t.date.startsWith('2026-02')&&t.type==='expense').reduce((s,t)=>s+t.amount,0) ? 'Expenses ↓ down this month ✅':'Expenses ↑ up this month ⚠️'}`;
      }

      case 'improve_advice': {
        const wants = ['Entertainment', 'Shopping', 'Other'];
        const targetMonths = ['2026-03', '2026-02'];
        let adviceHtml = `💡 **How to spend better based on recent months:**\n\n`;
        targetMonths.forEach(m => {
            const mExps = txs.filter(t=>t.type==='expense'&&t.date.startsWith(m));
            if(mExps.length === 0) return;
            const mWants = mExps.filter(t => wants.includes(t.category));
            const wantTotal = mWants.reduce((s, t) => s + t.amount, 0);
            const mTotal = mExps.reduce((s, t) => s + t.amount, 0);
            if(mTotal > 0 && wantTotal / mTotal > 0.25) {
               adviceHtml += `• In **${m}**, you spent heavily on Non-Essentials (${fmtN(wantTotal)}, ${(wantTotal/mTotal*100).toFixed(0)}% of expenses). Try reallocating this to savings.\n`;
            } else {
               adviceHtml += `• In **${m}**, your essential to non-essential ratio was good! Look for minor cuts in utility bills.\n`;
            }
        });
        const worthless = txs.filter(t => t.type === 'expense' && wants.includes(t.category)).sort((a,b)=>b.amount-a.amount).slice(0, 3);
        if(worthless.length > 0) {
           adviceHtml += `\n🛒 **Transactions that drained your balance the most:**\n`;
           worthless.forEach(t => adviceHtml += `  - **${t.category}**: ${fmtN(t.amount)} on ${t.date} for '${t.desc}'\n`);
        }
        return adviceHtml;
      }

      case 'post_income_plan': {
        const lastIncome = txs.filter(t => t.type === 'income').sort((a,b)=>b.date.localeCompare(a.date))[0];
        if(!lastIncome) return "❌ You haven't recorded any income yet!";
        const amt = lastIncome.amount;
        return `🎉 **Income Received!**\nYou recently got ${fmtN(amt)} as ${lastIncome.category}.\n\nHere is how you can effectively allocate it (50/30/20 Rule):\n• **Needs** (50%): ${fmtN(amt * 0.50)} (Rent, Groceries, Utilities)\n• **Wants** (30%): ${fmtN(amt * 0.30)} (Entertainment, Shopping)\n• **Savings/Invest** (20%): ${fmtN(amt * 0.20)} (Emergency fund, Stocks)\n\n💡 Try to automate moving the 20% to your savings right away!`;
      }

      case 'excessive_warnings': {
        let warnings = `🚨 **Excessive Spending Alerts:**\n\n`;
        const categoryExtremes = {};
        txs.filter(t=>t.type==='expense').forEach(t=>{ categoryExtremes[t.category] = (categoryExtremes[t.category]||0) + t.amount; });
        const triggerPercent = 0.35; 
        let hasWarning = false;
        Object.entries(categoryExtremes).forEach(([cat, val]) => {
           if(income > 0 && val / income > triggerPercent) {
              warnings += `⚠️ **${cat}** consumed ${((val/income)*100).toFixed(0)}% of your total income!\n`;
              hasWarning = true;
           }
        });
        const worthlessCats = ['Entertainment', 'Shopping'];
        const worthlessSpend = txs.filter(t=>worthlessCats.includes(t.category)).reduce((s,t)=>s+t.amount,0);
        if(income > 0 && worthlessSpend / income > 0.15) {
           warnings += `📉 You had a massive income drain on **Shopping & Entertainment** (${fmtN(worthlessSpend)}). These are "worthless" items when in excess!\n`;
           hasWarning = true;
        }

        if(!hasWarning) return `✅ No excessive warnings. You are managing your money well!`;
        return warnings;
      }

      case 'help': {
        const apiStatus = isApiKeyConfigured() ? '✅ **AI-Powered Mode** (Gemini API enabled)' : '⚙️ **Local Mode** (No AI configured)';
        return `Welcome to **FinBot**, your enterprise financial assistant.\n${apiStatus}\n\n**ANALYTICS & INSIGHTS:**\n• "What's my balance?"\n• "Show budget plan"\n• "Top 5 transactions"\n• "Worst 3 expenses"\n• "Monthly insights"\n• "Category breakdown"\n• "Compare months"\n• "Forecast next month"\n\n**TRANSACTION MANAGEMENT:**\n• "Spent 2k on groceries"\n• "Add income of 5k"\n• "Log expense 500 for Netflix"\n• "Find coffee transactions"\n\n**ADMIN ONLY:**\n${role==='admin'?'• "Remove expense of ₹500"\n• "Clear new transactions"\n':''}\n**NATURAL EXAMPLES:**\n• "Best 3 worthy transactions"\n• "My worst spending"\n• "March vs February"\n• "Analyze my spending"`;
      }

      default:
        return `🤔 I'm not sure about that. Try asking:\n• "What's my balance?"\n• "Show budget plan"\n• "Top spending categories"\n• "Monthly insights"\n\nOr type **help** for all commands.`;
    }
  }

  async function callGemini(userMsg, context) {
    const cfg = window.FINFLOW_CONFIG || {};
    const key   = cfg.GEMINI_API_KEY;
    const model = cfg.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!key || key.trim().length < 10) {
      throw new Error('❌ Invalid API Key: missing or too short');
    }
    const systemPrompt = `You are FinBot, an expert personal finance assistant embedded in the FinFlow dashboard.
Your role is to help users track expenses, understand spending patterns, plan budgets, and get actionable financial insights.

CRITICAL INSTRUCTIONS:
1. Always be concise, friendly, and professional
2. Use ₹ for currency and Indian numbering
3. When user asks to ADD a transaction, ALWAYS respond with ONLY a JSON object like:
   {"action":"add_transaction","type":"expense","amount":500,"category":"Food","desc":"Grocery shopping","date":"2026-03-30"}
4. For all other requests, provide a helpful analysis
5. Use markdown for formatting with bold, bullet points, and emojis
6. Always reference actual numbers from the provided financial data

USER'S FINANCIAL DATA:
${context}

When analyzing:
- If spending > 75% of income: ⚠️ Red zone
- If spending 50-75%: 🟡 Caution zone
- If spending < 50%: 🟢 Safe zone

Provide personalized, actionable advice based on their specific data.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
    };

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const errData = await res.text();
      try {
        const jsonErr = JSON.parse(errData);
        const errorMsg = jsonErr.error?.message || JSON.stringify(jsonErr);
        if (res.status === 401) throw new Error(`❌ API Authentication Failed\n${errorMsg}`);
        if (res.status === 403) throw new Error(`❌ API Permission Denied\n${errorMsg}`);
        if (res.status === 429) throw new Error(`⏱️ Rate Limited. Try again in a moment.\n${errorMsg}`);
        throw new Error(`❌ API Error (${res.status}): ${errorMsg}`);
      } catch (e) {
        if (e.message.startsWith('❌') || e.message.startsWith('⏱')) throw e;
        throw new Error(`❌ Gemini API Error (${res.status}): ${errData || 'Unknown error'}`);
      }
    }
    const data = await res.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('❌ Invalid API Response: No content generated.');
    }
    return data.candidates[0].content.parts[0].text || '❌ Empty response from API.';
  }

  function isApiKeyConfigured() {
    const cfg = window.FINFLOW_CONFIG || {};
    const key = cfg.GEMINI_API_KEY;
    return key && typeof key === 'string' && key.trim().length > 10;
  }

  function parseAction(text) {
    const jsonBlock = text.match(/```(?:json)?\s*(\{.*?"action"\s*:\s*"add_transaction".*?\})\s*```/is);
    if (jsonBlock) { try { return JSON.parse(jsonBlock[1]); } catch {} }
    const m = text.match(/\{[^}]*"action"\s*:\s*"add_transaction"[^}]*\}/is);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    return null;
  }

  let pendingTx = null;

  async function processMessage(userMsg, txs, onAction, role = 'admin') {
    // Interactive State Handling (Red Zone Confirmation)
    if (pendingTx) {
      if (/^(yes|y|sure|ok|do it|confirm|yeah|yep)/i.test(userMsg.trim())) {
        const tx = pendingTx;
        pendingTx = null;
        if (onAction) onAction({ action: 'add_transaction', tx });
        return {
          text: `✅ **Confirmed!** Transaction Logged.\n• **📉 Expense**: ₹${tx.amount.toLocaleString('en-IN')}\n• **Category**: ${tx.category}\n• **Description**: ${tx.desc}`,
          action: { type: 'add_transaction', tx }
        };
      } else {
        pendingTx = null;
        return { text: `❌ **Cancelled.** Expense not added.`, action: null };
      }
    }

    const intent  = detectIntent(userMsg);
    const context = buildContext(txs);

    const checkRedZone = (tx) => {
      if (tx.type !== 'expense') return false;
      const inc = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
      const exp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      return inc > 0 && ((exp + tx.amount) / inc) >= 0.75;
    };

    const hasBalance = (tx) => {
      if (tx.type !== 'expense') return true;
      const bal = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) -
                  txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
      return tx.amount <= bal;
    };

    // Gemini API path
    if (isApiKeyConfigured()) {
      try {
        const aiText = await callGemini(userMsg, context);
        const action = parseAction(aiText);
        if (action && action.action === 'add_transaction') {
          if (!hasBalance(action)) {
            const bal = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) - txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
            return { text: `❌ **Insufficient balance!**\nAvailable: ₹${bal.toLocaleString('en-IN')}\nRequested: ₹${action.amount.toLocaleString('en-IN')}\n\nCan't add this expense.`, action: null };
          }
          const tx = {
            id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
            date: action.date || new Date().toISOString().split('T')[0],
            desc: action.desc || (action.category || 'Other'),
            category: action.category || 'Other',
            type: action.type || 'expense',
            amount: action.amount
          };
          if (checkRedZone(tx)) {
            pendingTx = tx;
            return { text: `⚠️ **Red Zone Alert!**\nAdding ₹${tx.amount.toLocaleString('en-IN')} will push your total spending above **75%** of your income.\n\nAre you sure you want to log this expense? (Yes / No)`, action: null };
          }
          if (onAction) onAction({ action: 'add_transaction', tx });
          let cleanText = aiText.replace(/```(?:json)?\s*\{.*?\}\s*```/is, '').replace(/\{[^}]*"action"[^}]*\}/is, '').trim();
          if (!cleanText) cleanText = `✅ **Transaction Added by FinBot AI!**\n• **${tx.type === 'income' ? '📈 Income' : '📉 Expense'}**: ₹${tx.amount.toLocaleString('en-IN')}\n• **Category**: ${tx.category}\n• **Description**: ${tx.desc}`;
          return { text: cleanText, action: { type: 'add_transaction', tx } };
        }
        return { text: aiText, action: null };
      } catch (err) {
        const errorMsg = err.message || 'Unknown API error';
        console.warn('Gemini API error:', errorMsg);
        if (errorMsg.includes('Invalid API Key') || errorMsg.includes('Authentication Failed') || errorMsg.includes('Permission')) {
          return { text: `🔴 **API Configuration Error:**\n${errorMsg}\n\n💡 Using Local Engine…`, action: null };
        }
        console.warn('Falling back to local Engine:', errorMsg);
      }
    }

    // Local fallback engine
    if (intent === 'add_income' || intent === 'add_expense') {
      const type   = intent === 'add_income' ? 'income' : 'expense';
      const amount = extractAmount(userMsg);
      const cat    = extractCategory(userMsg);
      const desc = userMsg
        .replace(/(?:add|create|record|log|spent|paid|entered|added|got)\s+(?:income|expense|earn|spend|deposit)/i, '')
        .replace(/₹?\s*\d[\d,\.]*\s*(?:k|K|thousand|crore)?/gi, '')
        .replace(/\b(for|from|on|in|at|to|of|and|got|paid|bought|spent|earned|received|worth|rupees|rs|rs\.)\b/gi, '')
        .trim().replace(/\s+/g,' ').trim() || (type === 'income' ? 'Income' : 'Expense');
      const dateStr = new Date().toISOString().split('T')[0];
      if (!amount || amount <= 0) {
        return { text: `⚠️ I couldn't understand the amount. Try: "Log an expense of ₹500 for supplies"`, action: null };
      }
      const tx = {
        id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
        date: dateStr, desc: desc || (cat === 'Salary' ? 'Salary' : cat),
        category: cat, type, amount
      };
      if (!hasBalance(tx)) {
        const bal = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0) - txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
        return { text: `❌ **Insufficient balance!**\nAvailable: ₹${bal.toLocaleString('en-IN')}\nRequested: ₹${amount.toLocaleString('en-IN')}`, action: null };
      }
      if (checkRedZone(tx)) {
        pendingTx = tx;
        return { text: `⚠️ **Red Zone Alert!**\nAdding ₹${tx.amount.toLocaleString('en-IN')} will push your total spending above **75%** of your income.\n\nAre you sure you want to log this expense? (Yes / No)`, action: null };
      }
      if (onAction) onAction({ action: 'add_transaction', tx });
      return {
        text: `✅ **Transaction Logged!**\n• **${type === 'income' ? '📈 Income' : '📉 Expense'}**: ₹${amount.toLocaleString('en-IN')}\n• **Category**: ${cat}\n• **Description**: ${tx.desc}`,
        action: { type: 'add_transaction', tx }
      };
    }

    if (intent === 'delete') {
      if (role !== 'admin') {
        return { text: `❌ **Access Denied.** Only admins can delete transactions.`, action: null };
      }

      // Enhanced delete last N logic
      const lastNMatch = userMsg.match(/(?:delete|remove|undo|erase|clear).*(?:last|recent)\s+(\d+)/i) || 
                         userMsg.match(/(?:last|recent)\s+(\d+).*(?:delete|remove|undo|erase|clear)/i);
      
      if (lastNMatch) {
         const n = parseInt(lastNMatch[1]);
         if (n > 0) {
            // Sort by date desc (if not already) and get top N
            const sorted = [...txs].sort((a,b) => b.date.localeCompare(a.date));
            const toDelete = sorted.slice(0, Math.min(n, 20));
            
            if (toDelete.length === 0) return { text: `📋 No transactions found to delete.`, action: null };
            
            toDelete.forEach(tx => {
               if(onAction) onAction({ action: 'delete_transaction', tx });
            });
            
            return {
               text: `✅ **Deleted!** Successfully removed the ${toDelete.length} most recent transaction(s).`,
               action: null
            };
         }
      }

      const amt = extractAmount(userMsg);
      let matching = [];
      if (amt) {
        matching = txs.filter(t => t.amount === amt).slice(-3);
      } else {
        const desc = userMsg.replace(/(?:delete|remove|undo|erase)/gi, '').trim();
        matching = txs.filter(t => new RegExp(desc, 'i').test(t.desc)).slice(-3);
      }
      if (matching.length === 0) {
        return { text: `📋 No matching transactions found.\n\nRecent transactions:\n${txs.slice(0,5).map(t=>`• ${t.date} | ${t.desc} | ₹${t.amount}`).join('\n')}`, action: null };
      }
      if (matching.length === 1) {
        const tx = matching[0];
        if (onAction) onAction({ action: 'delete_transaction', tx });
        return {
          text: `✅ **Deleted!** ${tx.type.toUpperCase()} of ₹${tx.amount.toLocaleString('en-IN')} (${tx.desc})`,
          action: { type: 'delete_transaction', tx }
        };
      }
      return {
        text: `🔍 Found ${matching.length} matching transactions:\n${matching.map((t,i)=>`${i+1}. ${t.date} | ${t.desc} | ₹${t.amount}`).join('\n')}\n\nBe more specific (use date or exact amount)`,
        action: null
      };
    }

    return { text: localResponse(intent, userMsg, txs, role), action: null };
  }

  return { processMessage, detectIntent, buildBudgetPlan };

})();
