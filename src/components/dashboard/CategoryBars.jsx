import { useState } from 'react';
import { fmt, fmtShort, getCatColors } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';
import { 
  Home, ShoppingBag, Coffee, Car, Zap, 
  Film, Heart, GraduationCap, Package, MoreHorizontal,
  TrendingUp, Landmark
} from 'lucide-react';

const ICON_MAP = {
  'Housing': Home,
  'Shopping': ShoppingBag,
  'Food': Coffee,
  'Transport': Car,
  'Utilities': Zap,
  'Entertainment': Film,
  'Health': Heart,
  'Education': GraduationCap,
  'Salary': TrendingUp,
  'Freelance': Package,
  'Investments': Landmark,
  'Other': MoreHorizontal
};

export default function CategoryBars({ maxItems = 6, containerId }) {
  const { state } = useStore();
  const { transactions, theme } = state;
  const [expanded, setExpanded] = useState({});
  const colors = getCatColors(theme);
  const isDark = theme === 'dark';

  const catMap = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const total = Object.values(catMap).reduce((s, v) => s + v, 0);
  const sorted = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]).slice(0, maxItems);

  const toggle = cat => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));

  if (sorted.length === 0) {
    return (
      <div className="empty-state-pro" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Package size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expenditure data model available.</p>
      </div>
    );
  }

  return (
    <div id={containerId} className="pro-category-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {sorted.map(cat => {
        const Icon = ICON_MAP[cat] || ICON_MAP.Other;
        const pct = total > 0 ? (catMap[cat] / total) * 100 : 0;
        const isOpen = expanded[cat];
        const baseColor = colors[cat] || '#94a3b8';

        return (
          <div 
            key={cat} 
            className={`pro-category-row pro-3d-card ${isOpen ? 'expanded' : ''}`}
            onClick={() => toggle(cat)}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '12px 16px',
              cursor: 'pointer',
              border: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <div className="pro-cat-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div className="pro-cat-icon" style={{ 
                width: '32px', height: '32px', borderRadius: '8px', 
                background: `${baseColor}15`, color: baseColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div className="pro-cat-info" style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{pct.toFixed(0)}% of total</div>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {fmtShort(catMap[cat])}
              </div>
            </div>

            <div className="pro-cat-track" style={{ 
              height: '8px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '4px', 
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div 
                className="pro-cat-fill" 
                style={{ 
                  height: '100%',
                  width: `${pct.toFixed(1)}%`,
                  background: `linear-gradient(to bottom, ${baseColor}, ${baseColor}dd)`,
                  borderRadius: '4px',
                  boxShadow: `0 0 10px ${baseColor}40`,
                  transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
