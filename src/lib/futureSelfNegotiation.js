/**
 * Future-Self Negotiation Engine
 * 
 * Calculates financial trade-offs against stored savings goals and 
 * generates conversational pushback arguments from "Future You".
 */

export const DEFAULT_GOAL = {
  name: 'Emergency & Vacation Reserve',
  targetAmount: 100000,
  currentSaved: 42000,
  targetDate: '2026-12-31'
};

/**
 * Calculates how a proposed transaction impacts savings velocity & target goal
 */
export function calculateFutureImpact(proposedTx, transactions = [], userGoal = DEFAULT_GOAL) {
  const amount = Number(proposedTx.amount || 0);
  const goal = userGoal || DEFAULT_GOAL;
  const remainingGoal = Math.max(0, goal.targetAmount - goal.currentSaved);

  // Compute daily net savings rate over last 30 days
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = Math.max(100, income - expenses);
  const dailySavingsRate = netSavings / 30; // approx daily rate

  // Days pushed back
  const delayInDays = Math.max(1, Math.ceil(amount / dailySavingsRate));

  // Goal percentage impact
  const goalImpactPct = remainingGoal > 0 ? ((amount / remainingGoal) * 100).toFixed(1) : 0;

  // Determine discretionary risk level
  const isDiscretionary = ['Shopping', 'Entertainment', 'Food', 'Other'].includes(proposedTx.category);
  const isHighValue = amount >= 1000;

  return {
    amount,
    delayInDays,
    goalImpactPct,
    goalName: goal.name,
    isDiscretionary,
    isHighValue,
    dailySavingsRate: Math.round(dailySavingsRate),
    shouldTriggerNegotiation: (isDiscretionary && isHighValue) || amount > netSavings * 0.2
  };
}

/**
 * Generates Future-Self persona negotiation script
 */
export function generateFutureSelfDialogue(impact, proposedTx) {
  const category = proposedTx.category || 'Purchase';
  const desc = proposedTx.desc || 'this expense';
  const fmtAmt = `₹${Number(proposedTx.amount).toLocaleString('en-IN')}`;

  const dialogues = [
    `Hold on a second! I'm **Future You** from 6 months ahead.\n\nYou're about to log **${fmtAmt}** for _"${desc}"_. This single purchase sets your **${impact.goalName}** back by **${impact.delayInDays} days** (${impact.goalImpactPct}% of remaining target).\n\nAre you sure you want to sacrifice ${impact.delayInDays} days of progress for this right now?`,
    `Hey there, this is **Future You** checking in!\n\nSpending **${fmtAmt}** on _"${desc}"_ (${category}) takes away **${impact.delayInDays} days** of compounding from our **${impact.goalName}**.\n\nLet's negotiate before committing: can we split this, downgrade the amount, or wait 48 hours?`,
    `Notice from **Future You**:\n\nIf you proceed with **${fmtAmt}** on _"${desc}"_, you'll consume **${impact.goalImpactPct}%** of what we need for our **${impact.goalName}** target.\n\nI recommend we negotiate down by 30% or set a cool-off period.`
  ];

  return dialogues[Math.floor(Math.random() * dialogues.length)];
}
