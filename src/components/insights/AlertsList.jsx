import { fmt, computeTotals } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

function AlertItem({ icon, text, sub, amount, color }) {
  return (
    <div className="alert-item">
      <div className="alert-dot" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      <div style={{ flex: 1 }}>
        <div className="alert-text">{icon} {text}</div>
        {sub && <div className="alert-date">{sub}</div>}
      </div>
      {amount && <div className="alert-amount" style={{ color }}>{amount}</div>}
    </div>
  );
}

export default function AlertsList() {
  const { state } = useStore();
  const txs = state.transactions;
  const { income, expenses } = computeTotals(txs);
  const pct = income > 0 ? (expenses / income) * 100 : 0;
  const large = [...txs].filter(t => t.type === 'expense' && t.amount >= 200).sort((a,b) => b.amount - a.amount).slice(0, 4);

  return (
    <div className="alerts-widget" style={{ marginTop: 20 }}>
      <div className="chart-card-header" style={{ marginBottom: 12 }}>
        <h3>🔔 Spending Alerts</h3>
        <span>Tracking large &amp; notable items</span>
      </div>
      <div id="alerts-list">
        {pct >= 75
          ? <AlertItem icon="🔴" text="High spending alert" sub="Your expenses exceed 75% of income!" color="#ef4444" />
          : pct >= 50
          ? <AlertItem icon="🟡" text="Caution zone" sub="You have crossed 50% of income spent." color="#f59e0b" />
          : <AlertItem icon="🟢" text="Spending healthy" sub="Your spending is within safe limits." color="#10b981" />
        }
        {large.map(t => (
          <AlertItem
            key={t.id}
            icon="💸"
            text={t.desc}
            sub={new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            amount={fmt(t.amount)}
            color="#8b5cf6"
          />
        ))}
      </div>
    </div>
  );
}
