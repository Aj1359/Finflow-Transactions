import { fmt } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function RecentTransactions() {
  const { state } = useStore();
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const isDark = state.theme === 'dark';

  if (recent.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💸</div>
        <h3>No Transactions</h3>
      </div>
    );
  }

  return (
    <div id="recent-tx-list">
      {recent.map(t => (
        <div key={t.id} className="alert-item">
          <div
            className="alert-dot"
            style={{
              background: t.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
              boxShadow: isDark ? `0 0 6px ${t.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)'}` : 'none',
            }}
          />
          <div style={{ flex: 1 }}>
            <div className="alert-text">{t.desc}</div>
            <div className="alert-date">
              {new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {t.category}
            </div>
          </div>
          <div className={`alert-amount ${t.type === 'income' ? 'tx-amount-income' : 'tx-amount-expense'}`}>
            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
