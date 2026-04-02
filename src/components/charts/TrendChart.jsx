/* ═══════════════════════════════════════════════════════════
   FinFlow — Trend Chart  |  src/components/charts/TrendChart.jsx
   ═══════════════════════════════════════════════════════════ */

import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { getLastMonths, monthLabel, fmt, fmtShort } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function TrendChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const { state } = useStore();
  const { transactions, theme } = state;
  const isDark = theme === 'dark';

  useEffect(() => {
    const months = getLastMonths(6);
    const incByMonth = {}, expByMonth = {};
    transactions.forEach(t => {
      const mk = t.date.slice(0, 7);
      if (!incByMonth[mk]) incByMonth[mk] = 0;
      if (!expByMonth[mk]) expByMonth[mk] = 0;
      if (t.type === 'income') incByMonth[mk] += t.amount;
      else expByMonth[mk] += t.amount;
    });
    const labels   = months.map(m => monthLabel(m));
    const incData  = months.map(m => incByMonth[m] || 0);
    const expData  = months.map(m => expByMonth[m] || 0);
    const incColor = isDark ? '#00f5ff' : '#0ea5e9';
    const expColor = isDark ? '#ff4d6d' : '#ef4444';

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Income', data: incData, borderColor: incColor, backgroundColor: isDark ? 'rgba(0,245,255,0.1)' : 'rgba(14,165,233,0.1)', fill: true, tension: 0.45, pointBackgroundColor: incColor, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 },
          { label: 'Expenses', data: expData, borderColor: expColor, backgroundColor: isDark ? 'rgba(255,77,109,0.1)' : 'rgba(239,68,68,0.1)', fill: true, tension: 0.45, pointBackgroundColor: expColor, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: isDark ? '#111827' : '#ffffff', titleColor: isDark ? '#e8eaf6' : '#0d1117', bodyColor: isDark ? '#8892b0' : '#5a6478', borderColor: isDark ? '#1e2d4a' : '#e2e6f0', borderWidth: 1, padding: 12, cornerRadius: 12, callbacks: { label: ctx => ' ' + fmt(ctx.parsed.y) } }
        },
        scales: {
          x: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#4a5568' : '#8b92a5', font: { size: 11, family: 'Inter' } } },
          y: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#4a5568' : '#8b92a5', font: { size: 11, family: 'Inter' }, callback: v => fmtShort(v) } }
        }
      }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions, theme]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>📈 Balance Trend</h3>
        <span>Last 6 months</span>
      </div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
