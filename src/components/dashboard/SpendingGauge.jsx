import { computeTotals } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function SpendingGauge() {
  const { state } = useStore();
  const { income, expenses } = computeTotals(state.transactions);
  const pct = income > 0 ? (expenses / income) * 100 : 0;
  const isDark = state.theme === 'dark';

  const R = 70, CX = 80, CY = 80;
  const startAngle = Math.PI;
  const endAngle   = 2 * Math.PI;
  const angle = startAngle + (Math.min(pct / 100, 1)) * Math.PI;
  const x1 = CX + R * Math.cos(startAngle);
  const y1 = CY + R * Math.sin(startAngle);
  const x2 = CX + R * Math.cos(angle);
  const y2 = CY + R * Math.sin(angle);
  const largeArc = angle - startAngle > Math.PI ? 1 : 0;
  const trackX2  = CX + R * Math.cos(endAngle);
  const trackY2  = CY + R * Math.sin(endAngle);

  let color, statusText, statusBg;
  if (pct < 50) {
    color = isDark ? '#00ff94' : '#10b981';
    statusText = '🟢 Healthy';
    statusBg = isDark ? 'rgba(0,255,148,0.12)' : 'rgba(16,185,129,0.12)';
  } else if (pct < 75) {
    color = isDark ? '#ffd60a' : '#f59e0b';
    statusText = '🟡 Caution';
    statusBg = isDark ? 'rgba(255,214,10,0.12)' : 'rgba(245,158,11,0.12)';
  } else {
    color = isDark ? '#ff4d6d' : '#ef4444';
    statusText = '🔴 High Risk';
    statusBg = isDark ? 'rgba(255,77,109,0.12)' : 'rgba(239,68,68,0.12)';
  }

  return (
    <div className="gauge-section">
      <div className="gauge-wrap">
        <svg className="gauge-svg" viewBox="0 0 160 100">
          <path
            d={`M ${x1} ${y1} A ${R} ${R} 0 1 1 ${trackX2} ${trackY2}`}
            fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round"
          />
          <path
            d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text x={CX} y={CY + 18} textAnchor="middle" fontSize="13" fontWeight="700"
            fontFamily="Inter,sans-serif" fill={color}>
            {pct.toFixed(1)}%
          </text>
          <text x={CX} y={CY + 32} textAnchor="middle" fontSize="9.5" fontWeight="500"
            fontFamily="Inter,sans-serif" fill="var(--text-muted)">
            of income
          </text>
        </svg>
      </div>
      <div className="gauge-info">
        <div className="gauge-title">⚡ Spending Health Gauge</div>
        <div className="gauge-pct" style={{ color, textShadow: isDark ? `0 0 20px ${color}` : 'none' }}>
          {pct.toFixed(1)}%
        </div>
        <div className="gauge-status" style={{ background: statusBg, color }}>{statusText}</div>
        <div className="gauge-thresholds">
          <div className="threshold-item">
            <div className="threshold-dot" style={{ background: 'var(--gauge-green)' }} />
            Safe &lt; 50%
          </div>
          <div className="threshold-item">
            <div className="threshold-dot" style={{ background: 'var(--gauge-yellow)' }} />
            Caution 50–75%
          </div>
          <div className="threshold-item">
            <div className="threshold-dot" style={{ background: 'var(--gauge-red)' }} />
            High Risk &gt; 75%
          </div>
        </div>
      </div>
    </div>
  );
}
