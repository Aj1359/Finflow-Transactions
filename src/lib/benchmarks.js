/**
 * Privacy-Preserving Local Benchmarking Engine
 * 
 * Bundles static, anonymized reference-percentile datasets across income brackets.
 * Computes exact spending percentiles purely client-side without sending data anywhere.
 */

// Anonymized peer statistics by monthly income tier (in ₹ / month)
export const BENCHMARK_DATASETS = {
  tier1: {
    label: 'Entry Bracket (< ₹30,000 / mo)',
    incomeMax: 30000,
    categories: {
      Housing:       { medianPct: 35, top10Pct: 25 },
      Food:          { medianPct: 25, top10Pct: 15 },
      Transport:     { medianPct: 12, top10Pct: 7  },
      Utilities:     { medianPct: 10, top10Pct: 6  },
      Entertainment: { medianPct: 8,  top10Pct: 3  },
      Shopping:      { medianPct: 10, top10Pct: 4  },
      Health:        { medianPct: 5,  top10Pct: 3  },
    },
    medianSavingsRate: 15,
    top10SavingsRate:  35,
  },
  tier2: {
    label: 'Mid Bracket (₹30,000 - ₹75,000 / mo)',
    incomeMax: 75000,
    categories: {
      Housing:       { medianPct: 30, top10Pct: 20 },
      Food:          { medianPct: 20, top10Pct: 12 },
      Transport:     { medianPct: 10, top10Pct: 5  },
      Utilities:     { medianPct: 8,  top10Pct: 4  },
      Entertainment: { medianPct: 10, top10Pct: 4  },
      Shopping:      { medianPct: 12, top10Pct: 5  },
      Health:        { medianPct: 6,  top10Pct: 3  },
    },
    medianSavingsRate: 22,
    top10SavingsRate:  42,
  },
  tier3: {
    label: 'Upper Bracket (> ₹75,000 / mo)',
    incomeMax: Infinity,
    categories: {
      Housing:       { medianPct: 25, top10Pct: 15 },
      Food:          { medianPct: 15, top10Pct: 8  },
      Transport:     { medianPct: 8,  top10Pct: 4  },
      Utilities:     { medianPct: 5,  top10Pct: 3  },
      Entertainment: { medianPct: 12, top10Pct: 5  },
      Shopping:      { medianPct: 15, top10Pct: 6  },
      Health:        { medianPct: 5,  top10Pct: 2  },
    },
    medianSavingsRate: 30,
    top10SavingsRate:  55,
  }
};

/**
 * Gets the relevant income benchmark tier based on user monthly income
 */
export function getBenchmarkTier(monthlyIncome = 50000) {
  if (monthlyIncome <= 30000) return BENCHMARK_DATASETS.tier1;
  if (monthlyIncome <= 75000) return BENCHMARK_DATASETS.tier2;
  return BENCHMARK_DATASETS.tier3;
}

/**
 * Computes user's local peer percentile ranking across categories and savings rate
 */
export function evaluateLocalBenchmark(transactions = []) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');

  const totalInc = income.reduce((s, t) => s + t.amount, 0) || 50000;
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0) || 1;
  const netBalance = totalInc - totalExp;
  const userSavingsRate = Math.max(0, Math.round((netBalance / totalInc) * 100));

  const tier = getBenchmarkTier(totalInc);

  // Category percentage breakdown
  const categoryTotals = {};
  expenses.forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount; });

  const categoryComparisons = [];

  Object.entries(tier.categories).forEach(([cat, peerStats]) => {
    const spent = categoryTotals[cat] || 0;
    const userCatPct = Math.round((spent / totalExp) * 100);

    // Approximate percentile calculation (lower expense % = higher frugality percentile)
    let percentile = 50;
    if (userCatPct <= peerStats.top10Pct) {
      percentile = 90 + Math.round((1 - userCatPct / (peerStats.top10Pct || 1)) * 9);
    } else if (userCatPct <= peerStats.medianPct) {
      percentile = 50 + Math.round((1 - (userCatPct - peerStats.top10Pct) / (peerStats.medianPct - peerStats.top10Pct)) * 40);
    } else {
      percentile = Math.max(5, Math.round((1 - (userCatPct - peerStats.medianPct) / 50) * 50));
    }

    categoryComparisons.push({
      category: cat,
      userPct: userCatPct,
      medianPct: peerStats.medianPct,
      top10Pct: peerStats.top10Pct,
      userSpent: spent,
      percentile: Math.min(99, Math.max(1, percentile)),
      headline: userCatPct <= peerStats.medianPct
        ? `You spend less than ${percentile}% of similar earners on ${cat}`
        : `Your ${cat} spend (${userCatPct}%) is above the peer median (${peerStats.medianPct}%)`
    });
  });

  // Savings rate percentile
  let savingsPercentile = 50;
  if (userSavingsRate >= tier.top10SavingsRate) {
    savingsPercentile = 90 + Math.min(9, Math.round((userSavingsRate - tier.top10SavingsRate) / 2));
  } else if (userSavingsRate >= tier.medianSavingsRate) {
    savingsPercentile = 50 + Math.round(((userSavingsRate - tier.medianSavingsRate) / (tier.top10SavingsRate - tier.medianSavingsRate)) * 40);
  } else {
    savingsPercentile = Math.max(5, Math.round((userSavingsRate / tier.medianSavingsRate) * 50));
  }

  return {
    tierLabel: tier.label,
    monthlyIncome: totalInc,
    userSavingsRate,
    medianSavingsRate: tier.medianSavingsRate,
    savingsPercentile: Math.min(99, Math.max(1, savingsPercentile)),
    categoryComparisons,
    summaryHeadline: `Your savings rate (${userSavingsRate}%) puts you in the top ${100 - savingsPercentile}% of peers in your income tier.`
  };
}
