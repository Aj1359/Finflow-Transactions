/**
 * Spending DNA Engine — Generative Visual Fingerprint
 * 
 * Algorithmically generates a unique abstract polar SVG pattern
 * from 8 spending vectors (Entropy, Volatility, Discretionary Ratio,
 * Savings Rate, Tx Velocity, Max Amount Ratio, Impulse Ratio, Health Index).
 */

export function generateSpendingDNAVectors(transactions = [], budgets = {}) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');

  const totalInc = income.reduce((s, t) => s + t.amount, 0) || 1;
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0) || 1;
  const netBalance = totalInc - totalExp;

  // 1. Savings Rate (0 - 1)
  const savingsRate = Math.max(0, Math.min(1, netBalance / totalInc));

  // 2. Category Distribution Entropy (0 - 1)
  const categoryTotals = {};
  expenses.forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount; });
  const catKeys = Object.keys(categoryTotals);
  let entropy = 0;
  catKeys.forEach(k => {
    const p = categoryTotals[k] / totalExp;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  const maxEntropy = Math.log2(Math.max(1, catKeys.length));
  const normalizedEntropy = maxEntropy > 0 ? Math.min(1, entropy / maxEntropy) : 0.5;

  // 3. Volatility / Std Dev (0 - 1)
  const meanExp = expenses.length > 0 ? totalExp / expenses.length : 0;
  const variance = expenses.length > 0
    ? expenses.reduce((s, t) => s + Math.pow(t.amount - meanExp, 2), 0) / expenses.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const volatility = Math.min(1, stdDev / (meanExp || 1));

  // 4. Discretionary Ratio (0 - 1)
  const discSpend = expenses
    .filter(t => ['Shopping', 'Entertainment', 'Food'].includes(t.category))
    .reduce((s, t) => s + t.amount, 0);
  const discretionaryRatio = Math.min(1, discSpend / totalExp);

  // 5. Tx Velocity / Frequency (0 - 1)
  const txFrequency = Math.min(1, expenses.length / 30);

  // 6. Max Amount Spike Ratio (0 - 1)
  const maxTx = Math.max(...expenses.map(t => t.amount), 0);
  const maxSpikeRatio = Math.min(1, maxTx / totalExp);

  // 7. Regret / Impulse Ratio (0 - 1)
  const impulseCount = expenses.filter(t => t.emotionalTag === 'impulse' || t.emotionalTag === 'stress-bought').length;
  const impulseRatio = expenses.length > 0 ? impulseCount / expenses.length : 0.2;

  // 8. Financial Health Index (0 - 1)
  const healthIndex = Math.max(0, Math.min(1, (savingsRate * 0.5) + ((1 - discretionaryRatio) * 0.3) + ((1 - impulseRatio) * 0.2)));

  const vectors = [
    { name: 'Savings Velocity', val: savingsRate },
    { name: 'Category Entropy', val: normalizedEntropy },
    { name: 'Spend Volatility', val: volatility },
    { name: 'Discretionary Ratio', val: discretionaryRatio },
    { name: 'Tx Frequency', val: txFrequency },
    { name: 'Spike Magnitude', val: maxSpikeRatio },
    { name: 'Impulse Factor', val: impulseRatio },
    { name: 'Health Index', val: healthIndex },
  ];

  // Hash signature generator
  const rawHash = vectors.map(v => Math.round(v.val * 255).toString(16).padStart(2, '0')).join('');
  const hash = `DNA-${rawHash.slice(0, 4).toUpperCase()}-${rawHash.slice(4, 8).toUpperCase()}`;

  return { vectors, hash, healthIndex, savingsRate, discretionaryRatio };
}

/**
 * Computes SVG polar coordinate path d string for 8-axis bezier fingerprint
 */
export function buildDNAPath(vectors, centerX = 150, centerY = 150, baseRadius = 100, varianceMultiplier = 45) {
  const points = vectors.map((v, i) => {
    const angle = (i * 2 * Math.PI) / vectors.length - Math.PI / 2;
    const r = baseRadius + (v.val - 0.5) * varianceMultiplier;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, angle, r, val: v.val, name: v.name };
  });

  // Generate smooth closed cubic bezier curve points
  let pathD = '';
  const numPoints = points.length;

  for (let i = 0; i < numPoints; i++) {
    const p0 = points[(i - 1 + numPoints) % numPoints];
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    const p3 = points[(i + 2) % numPoints];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    if (i === 0) {
      pathD += `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
    }
    pathD += `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} `;
  }

  return { pathD, points };
}
