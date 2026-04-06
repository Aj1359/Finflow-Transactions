
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
    const incColor = isDark ? '#cdbdff' : '#7c3aed';
    const expColor = isDark ? '#00daf3' : '#0ea5e9';

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar', // Better for vertical growth visualization
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incData,
            backgroundColor: isDark ? 'rgba(0, 245, 255, 0.85)' : 'rgba(167, 139, 250, 0.85)',
            borderRadius: 6,
            barThickness: 24
          },
          {
            label: 'Expenses',
            data: expData,
            backgroundColor: isDark ? 'rgba(255, 0, 255, 0.85)' : 'rgba(251, 191, 36, 0.85)',
            borderRadius: 6,
            barThickness: 24
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 } } },
          y: { 
            beginAtZero: true, 
            grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', drawBorder: false },
            ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10 }, callback: v => '₹' + v.toLocaleString('en-IN') }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#050510',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            displayColors: false,
            callbacks: { label: ctx => ' ' + fmt(ctx.parsed.y) }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions, theme]);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>Financial Momentum</h3>
        <span>Last 6 months</span>
      </div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
