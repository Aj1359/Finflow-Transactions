

import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { fmt, getCatColors } from '../../lib/utils';
import { useStore } from '../../store/useFinFlowStore';

export default function DonutChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const { state } = useStore();
  const { transactions, theme } = state;
  const isDark = theme === 'dark';

  useEffect(() => {
    const colors = getCatColors(theme);
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const cats = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]);
    const vals = cats.map(c => catMap[c]);
    const cols = cats.map(c => colors[c] || colors.Other);

    if (chartRef.current) chartRef.current.destroy();
    if (cats.length === 0) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: cats,
        datasets: [{ data: vals, backgroundColor: cols, borderColor: isDark ? '#111827' : '#ffffff', borderWidth: 3, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'right', labels: { color: isDark ? '#8892b0' : '#5a6478', font: { size: 11, family: 'Inter' }, padding: 12, boxWidth: 12, boxHeight: 12, usePointStyle: true, pointStyleWidth: 12 } },
          tooltip: { backgroundColor: isDark ? '#111827' : '#ffffff', titleColor: isDark ? '#e8eaf6' : '#0d1117', bodyColor: isDark ? '#8892b0' : '#5a6478', borderColor: isDark ? '#1e2d4a' : '#e2e6f0', borderWidth: 1, padding: 12, cornerRadius: 12, callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` } }
        }
      }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions, theme]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>Spending Category Breakdown</h3>
        <span>All time</span>
      </div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
