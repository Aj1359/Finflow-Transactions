
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

    const ctx = canvasRef.current.getContext('2d');
    const incGrad = ctx.createLinearGradient(0, 0, 0, 400);
    incGrad.addColorStop(0, isDark ? '#00f5ff' : '#7c3aed');
    incGrad.addColorStop(0.5, isDark ? 'rgba(0, 245, 255, 0.7)' : 'rgba(124, 58, 237, 0.7)');
    incGrad.addColorStop(1, isDark ? 'rgba(0, 245, 255, 0.3)' : 'rgba(124, 58, 237, 0.3)');

    const expGrad = ctx.createLinearGradient(0, 0, 0, 400);
    expGrad.addColorStop(0, isDark ? '#ff00ff' : '#f59e0b');
    expGrad.addColorStop(0.5, isDark ? 'rgba(255, 0, 255, 0.7)' : 'rgba(245, 158, 11, 0.7)');
    expGrad.addColorStop(1, isDark ? 'rgba(255, 0, 255, 0.3)' : 'rgba(245, 158, 11, 0.3)');

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incData,
            backgroundColor: incGrad,
            borderRadius: 8,
            barThickness: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(0, 245, 255, 0.4)' : 'transparent'
          },
          {
            label: 'Expenses',
            data: expData,
            backgroundColor: expGrad,
            borderRadius: 8,
            barThickness: 24,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 0, 255, 0.4)' : 'transparent'
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
          duration: 2200,
          easing: 'easeInOutQuart',
          delay: 200
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
