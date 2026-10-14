/**
 * Regret Index Engine (NLP Tone Mining & Sentiment Scoring)
 * 
 * Classifies self-authored transaction descriptions into emotional registers
 * and computes composite category & monthly Regret Scores.
 */

export const EMOTIONAL_REGISTERS = {
  impulse: { label: 'Impulse Buy', color: '#ef4444', scoreWeight: 90, badgeClass: 'bg-red-500/20 text-red-400' },
  'stress-bought': { label: 'Stress Bought', color: '#f97316', scoreWeight: 75, badgeClass: 'bg-orange-500/20 text-orange-400' },
  'treated-myself': { label: 'Treated Myself', color: '#a855f7', scoreWeight: 40, badgeClass: 'bg-purple-500/20 text-purple-400' },
  necessary: { label: 'Necessary / Essential', color: '#10b981', scoreWeight: 10, badgeClass: 'bg-emerald-500/20 text-emerald-400' },
  planned: { label: 'Planned Purchase', color: '#06b6d4', scoreWeight: 5, badgeClass: 'bg-cyan-500/20 text-cyan-400' }
};

/**
 * Classifies emotional tone of a transaction description & category
 */
export function classifyTransactionTone(description = '', category = '', amount = 0) {
  const desc = description.toLowerCase();

  // Pattern matching rules for sentiment classification
  if (/(impulse|flash sale|late night|craving|unplanned|bored|random|spotted|wanted it|guilty|useless)/i.test(desc)) {
    return {
      tag: 'impulse',
      score: Math.min(100, 80 + Math.round((amount / 500) * 10)),
      reason: 'Contains impulse trigger language (unplanned / craving / flash sale).'
    };
  }

  if (/(stress|rough day|long week|tired|venting|frustrated|exhausted|burnout|comfort food)/i.test(desc)) {
    return {
      tag: 'stress-bought',
      score: Math.min(95, 70 + Math.round((amount / 1000) * 10)),
      reason: 'Associated with emotional coping or stress-buying triggers.'
    };
  }

  if (/(treat|treated|celebrate|promotion|birthday|gift|reward|vacation|splurge|fun)/i.test(desc)) {
    return {
      tag: 'treated-myself',
      score: Math.min(60, 30 + Math.round((amount / 1000) * 10)),
      reason: 'Intentional self-reward or celebration expense.'
    };
  }

  if (/(rent|bill|grocery|groceries|electric|water|medicine|doctor|hospital|insurance|tuition|school|fuel|petrol|maintenance)/i.test(desc) || 
      ['Housing', 'Utilities', 'Health', 'Education'].includes(category)) {
    return {
      tag: 'necessary',
      score: 10,
      reason: 'Essential survival or utility requirement.'
    };
  }

  if (category === 'Shopping' || category === 'Entertainment') {
    return {
      tag: amount > 200 ? 'impulse' : 'treated-myself',
      score: amount > 200 ? 75 : 45,
      reason: amount > 200 ? 'High discretionary spend in non-essential category.' : 'Moderate discretionary spend.'
    };
  }

  return {
    tag: 'planned',
    score: 15,
    reason: 'Standard planned expenditure.'
  };
}

/**
 * Computes overall and category-level Regret Index statistics from a list of transactions
 */
export function calculateRegretIndex(transactions = []) {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) {
    return {
      overallScore: 0,
      riskLevel: 'Low',
      registerBreakdown: { impulse: 0, 'stress-bought': 0, 'treated-myself': 0, necessary: 0, planned: 0 },
      categoryScores: {},
      highRegretTransactions: [],
      totalRegretSpend: 0
    };
  }

  let totalWeightedScore = 0;
  let totalRegretSpend = 0;
  const categoryScores = {};
  const registerCounts = { impulse: 0, 'stress-bought': 0, 'treated-myself': 0, necessary: 0, planned: 0 };
  const enrichedExpenses = [];

  expenses.forEach(tx => {
    const tone = tx.emotionalTag 
      ? { tag: tx.emotionalTag, score: tx.regretScore || EMOTIONAL_REGISTERS[tx.emotionalTag]?.scoreWeight || 20, reason: tx.regretReason || '' }
      : classifyTransactionTone(tx.desc, tx.category, tx.amount);

    registerCounts[tone.tag] = (registerCounts[tone.tag] || 0) + 1;
    totalWeightedScore += tone.score * tx.amount;

    if (tone.score >= 60) {
      totalRegretSpend += tx.amount;
    }

    if (!categoryScores[tx.category]) {
      categoryScores[tx.category] = { totalScore: 0, totalAmount: 0, count: 0, impulseCount: 0 };
    }
    categoryScores[tx.category].totalScore += tone.score * tx.amount;
    categoryScores[tx.category].totalAmount += tx.amount;
    categoryScores[tx.category].count += 1;
    if (tone.tag === 'impulse' || tone.tag === 'stress-bought') {
      categoryScores[tx.category].impulseCount += 1;
    }

    enrichedExpenses.push({ ...tx, regretScore: tone.score, emotionalTag: tone.tag, regretReason: tone.reason });
  });

  const totalExpenseAmount = expenses.reduce((s, t) => s + t.amount, 0);
  const overallScore = totalExpenseAmount > 0 ? Math.round(totalWeightedScore / totalExpenseAmount) : 0;

  // Format category regret averages
  const formattedCategoryScores = Object.entries(categoryScores).map(([cat, val]) => ({
    category: cat,
    avgScore: Math.round(val.totalScore / val.totalAmount),
    totalSpent: val.totalAmount,
    impulseRatio: ((val.impulseCount / val.count) * 100).toFixed(0)
  })).sort((a, b) => b.avgScore - a.avgScore);

  const highRegretTransactions = enrichedExpenses
    .filter(t => t.regretScore >= 60)
    .sort((a, b) => b.regretScore - a.regretScore)
    .slice(0, 5);

  let riskLevel = 'Low';
  if (overallScore >= 65) riskLevel = 'Critical';
  else if (overallScore >= 40) riskLevel = 'Moderate';

  return {
    overallScore,
    riskLevel,
    registerBreakdown: registerCounts,
    categoryScores: formattedCategoryScores,
    highRegretTransactions,
    totalRegretSpend
  };
}
