

import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { getLastMonths, monthLabel, fmt, fmtShort } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function MonthlyChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const { state } = useStore();
  const { transactions, theme } = state;
  const isDark = theme === 'dark';

  useEffect(() => {
    const months = getLastMonths(4);
    const labels   = months.map(m => monthLabel(m, { month: 'short' }));
    const incData  = months.map(m => transactions.filter(t => t.type === 'income'  && t.date.slice(0,7) === m).reduce((s,t) => s + t.amount, 0));
    const expData  = months.map(m => transactions.filter(t => t.type === 'expense' && t.date.slice(0,7) === m).reduce((s,t) => s + t.amount, 0));

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Income',   data: incData, backgroundColor: isDark ? 'rgba(0,255,148,0.7)'  : 'rgba(16,185,129,0.75)', borderRadius: 8, borderSkipped: false },
          { label: 'Expenses', data: expData, backgroundColor: isDark ? 'rgba(255,77,109,0.7)' : 'rgba(239,68,68,0.75)',  borderRadius: 8, borderSkipped: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: isDark ? '#8892b0' : '#5a6478', font: { size: 11, family: 'Inter' }, boxWidth: 12, boxHeight: 12 } },
          tooltip: { backgroundColor: isDark ? '#111827' : '#ffffff', titleColor: isDark ? '#e8eaf6' : '#0d1117', bodyColor: isDark ? '#8892b0' : '#5a6478', borderColor: isDark ? '#1e2d4a' : '#e2e6f0', borderWidth: 1, padding: 12, cornerRadius: 12, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: isDark ? '#4a5568' : '#8b92a5', font: { size: 11, family: 'Inter' } } },
          y: { grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#4a5568' : '#8b92a5', font: { size: 11, family: 'Inter' }, callback: v => fmtShort(v) } }
        }
      }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions, theme]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>📊 Monthly Income vs Expenses</h3>
        <span>Last 4 months</span>
      </div>
      <div className="chart-wrap monthly-chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
