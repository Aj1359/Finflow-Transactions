/* ═══════════════════════════════════════════════════════════
   FinFlow — Summary Cards  |  src/components/dashboard/SummaryCards.jsx
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';
import { fmt, computeTotals } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

function AnimatedCounter({ value, id }) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const duration = 800;
    const startTime = performance.now();
    const update = now => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = fmt(Math.round(value * ease));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [value]);

  return <div className="card-value" id={id} ref={elRef}>{fmt(value)}</div>;
}

export default function SummaryCards() {
  const { state } = useStore();
  const txs = state.transactions;
  const { income, expenses, balance } = computeTotals(txs);
  const incCount = txs.filter(t => t.type === 'income').length;
  const expCount = txs.filter(t => t.type === 'expense').length;

  return (
    <div className="summary-grid">
      <div className="summary-card card-balance">
        <div className="card-top">
          <div className="card-label">Net Balance</div>
          <div className="card-icon">💰</div>
        </div>
        <AnimatedCounter value={balance} id="val-balance" />
        <div className="card-sub" id="sub-balance">Savings: {fmt(balance)}</div>
        <div className={`card-trend ${balance >= 0 ? 'trend-up' : 'trend-down'}`} id="trend-balance">
          {balance >= 0 ? '▲ Positive balance' : '▼ Negative balance'}
        </div>
      </div>

      <div className="summary-card card-income">
        <div className="card-top">
          <div className="card-label">Total Income</div>
          <div className="card-icon">📈</div>
        </div>
        <AnimatedCounter value={income} id="val-income" />
        <div className="card-sub" id="sub-income">{incCount} income transactions</div>
        <div className="card-trend trend-up">▲ Earnings tracked</div>
      </div>

      <div className="summary-card card-expense">
        <div className="card-top">
          <div className="card-label">Total Expenses</div>
          <div className="card-icon">📉</div>
        </div>
        <AnimatedCounter value={expenses} id="val-expenses" />
        <div className="card-sub" id="sub-expenses">{expCount} expense transactions</div>
        <div className="card-trend trend-down" id="trend-expense">▼ Outflows tracked</div>
      </div>
    </div>
  );
}
