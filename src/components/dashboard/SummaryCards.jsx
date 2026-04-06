import { useEffect, useRef } from 'react';
import { fmt, computeTotals } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
          <div className="card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wallet size={20} /></div>
        </div>
        <AnimatedCounter value={balance} id="val-balance" />
        <div className="card-sub" id="sub-balance">Savings: {fmt(balance)}</div>
        <div className={`card-trend ${balance >= 0 ? 'trend-up' : 'trend-down'}`} id="trend-balance" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {balance >= 0 ? <><ArrowUpRight size={14} /> Positive balance</> : <><ArrowDownRight size={14} /> Negative balance</>}
        </div>
      </div>

      <div className="summary-card card-income">
        <div className="card-top">
          <div className="card-label">Total Income</div>
          <div className="card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={20} /></div>
        </div>
        <AnimatedCounter value={income} id="val-income" />
        <div className="card-sub" id="sub-income">{incCount} income transactions</div>
        <div className="card-trend trend-up" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={14} /> Earnings tracked</div>
      </div>

      <div className="summary-card card-expense">
        <div className="card-top">
          <div className="card-label">Total Expenses</div>
          <div className="card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingDown size={20} /></div>
        </div>
        <AnimatedCounter value={expenses} id="val-expenses" />
        <div className="card-sub" id="sub-expenses">{expCount} expense transactions</div>
        <div className="card-trend trend-down" id="trend-expense" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowDownRight size={14} /> Outflows tracked</div>
      </div>
    </div>
  );
}
