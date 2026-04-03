import { useState } from 'react';
import { fmt, fmtShort, getCatColors } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function CategoryBars({ maxItems = 6, containerId }) {
  const { state } = useStore();
  const { transactions, theme } = state;
  const [expanded, setExpanded] = useState({});
  const colors = getCatColors(theme);

  const catMap = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const total  = Object.values(catMap).reduce((s, v) => s + v, 0);
  const sorted = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]).slice(0, maxItems);

  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];

  const toggle = cat => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  if (sorted.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 20 }}>
        <div className="empty-icon">📊</div>
        <p>No expense data</p>
      </div>
    );
  }

  return (
    <div id={containerId}>
      {sorted.map(cat => {
        const pct = total > 0 ? (catMap[cat] / total) * 100 : 0;
        const lastMonthAmt = transactions.filter(t => t.category === cat && t.type === 'expense' && t.date >= oneMonthAgo).reduce((s, t) => s + t.amount, 0);
        const isOpen = expanded[cat];

        return (
          <div key={cat} className={`cat-bar-row interactive-bar${isOpen ? ' expanded' : ''}`} onClick={() => toggle(cat)}>
            <div className="cat-bar-top">
              <div className="cat-bar-label">
                {cat} <span className="cat-expand-icon">▾</span>
              </div>
              <div className="cat-bar-track">
                <div className="cat-bar-fill" style={{ width: `${pct.toFixed(1)}%`, background: colors[cat] || '#94a3b8' }} />
              </div>
              <div className="cat-bar-val">{fmtShort(catMap[cat])}</div>
            </div>
            <div className="cat-bar-details">
              <div className="cat-stat"><span>Last 30 days:</span> <strong>{fmt(lastMonthAmt)}</strong></div>
              <div className="cat-stat"><span>Overall:</span> <strong>{fmt(catMap[cat])}</strong></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
