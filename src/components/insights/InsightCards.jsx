/* ═══════════════════════════════════════════════════════════
   FinFlow — Insight Cards  |  src/components/insights/InsightCards.jsx
   ═══════════════════════════════════════════════════════════ */

import { fmt, computeTotals } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function InsightCards() {
  const { state } = useStore();
  const txs = state.transactions;
  const { income, expenses, balance } = computeTotals(txs);
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0';

  const catMap = {};
  txs.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const topCat = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0] || 'N/A';
  const topAmt = catMap[topCat] || 0;

  const curMonth  = '2026-03';
  const prevMonth = '2026-02';
  const curInc  = txs.filter(t => t.type === 'income'  && t.date.slice(0,7) === curMonth).reduce((s,t)=>s+t.amount,0);
  const curExp  = txs.filter(t => t.type === 'expense' && t.date.slice(0,7) === curMonth).reduce((s,t)=>s+t.amount,0);
  const prevInc = txs.filter(t => t.type === 'income'  && t.date.slice(0,7) === prevMonth).reduce((s,t)=>s+t.amount,0);
  const prevExp = txs.filter(t => t.type === 'expense' && t.date.slice(0,7) === prevMonth).reduce((s,t)=>s+t.amount,0);
  const expDiff = curExp - prevExp;

  return (
    <div className="insights-grid">
      {/* Highest Spending */}
      <div className="insight-card">
        <div className="insight-card-icon">🏆</div>
        <h4>Highest Spending Category</h4>
        <div className="insight-value" style={{ color: 'var(--accent-orange)' }}>{topCat}</div>
        <div className="insight-sub">{fmt(topAmt)}</div>
        <div className="insight-accent-bar" style={{ background: 'linear-gradient(90deg,var(--accent-orange),var(--accent-yellow))' }} />
      </div>

      {/* Savings Rate */}
      <div className="insight-card">
        <div className="insight-card-icon">💸</div>
        <h4>Savings Rate</h4>
        <div className="insight-value" style={{ color: 'var(--accent-green)' }}>{savingsRate}%</div>
        <div className="insight-sub">Saved {fmt(balance)} of {fmt(income)} earned</div>
        <div className="insight-accent-bar" style={{ background: 'linear-gradient(90deg,var(--accent-green),var(--accent-cyan))' }} />
      </div>

      {/* Monthly Comparison */}
      <div className="insight-card">
        <div className="insight-card-icon">📅</div>
        <h4>Monthly Comparison</h4>
        <div className="monthly-compare">
          <div className="month-col">
            <h4>Mar Income</h4><div className="val">{fmt(curInc)}</div>
            <h4 style={{ marginTop: 8 }}>Mar Expenses</h4><div className="val">{fmt(curExp)}</div>
          </div>
          <div className="month-col">
            <h4>Feb Income</h4><div className="val">{fmt(prevInc)}</div>
            <h4 style={{ marginTop: 8 }}>Feb Expenses</h4><div className="val">{fmt(prevExp)}</div>
          </div>
        </div>
        <div className="insight-sub" style={{ marginTop: 10, color: expDiff > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
          {(expDiff >= 0 ? '+' : '') + fmt(expDiff)} vs last month
        </div>
        <div className="insight-accent-bar" style={{ background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-purple))' }} />
      </div>
    </div>
  );
}
