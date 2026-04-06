

import { useStore } from '../store/useFinFlowStore';
import SummaryCards from '../components/dashboard/SummaryCards';
import SpendingGauge from '../components/dashboard/SpendingGauge';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import CategoryBars from '../components/dashboard/CategoryBars';
import TrendChart from '../components/charts/TrendChart';
import DonutChart from '../components/charts/DonutChart';
import { Clock, PieChart } from 'lucide-react';

export default function DashboardPage() {
  const { state } = useStore();
  const isActive = state.activeSection === 'dashboard';

  return (
    <section className={`section${isActive ? ' active' : ''}`} id="section-dashboard">
      <div className="section-header">
        <div>
          <h2>Business Intelligence</h2>
          <p>Real-time analytics and financial performance metrics</p>
        </div>
      </div>

      <SummaryCards />
      <SpendingGauge />

      <div className="charts-grid">
        <TrendChart />
        <DonutChart />
      </div>

      <div className="bottom-grid">
        <div className="alerts-widget">
          <div className="chart-card-header" style={{ marginBottom: 10 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} /> Recent Transactions</h3>
            <span>Latest 5</span>
          </div>
          <RecentTransactions />
        </div>

        <div className="chart-card">
          <div className="chart-card-header" style={{ marginBottom: 10 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><PieChart size={18} /> Top Spending Categories</h3>
            <span>Expense breakdown</span>
          </div>
          <CategoryBars maxItems={5} containerId="cat-bars-dashboard" />
        </div>
      </div>
    </section>
  );
}
