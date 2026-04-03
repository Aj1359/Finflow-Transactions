

import { useStore } from '../store/useFinFlowStore';
import InsightCards from '../components/insights/InsightCards';
import AlertsList from '../components/insights/AlertsList';
import MonthlyChart from '../components/charts/MonthlyChart';
import CategoryBars from '../components/dashboard/CategoryBars';

export default function InsightsPage() {
  const { state } = useStore();
  const isActive = state.activeSection === 'insights';

  return (
    <section className={`section${isActive ? ' active' : ''}`} id="section-insights">
      <div className="section-header">
        <div>
          <h2>Insights</h2>
          <p>Understanding your spending patterns</p>
        </div>
      </div>

      <InsightCards />

      <div className="charts-grid">
        <MonthlyChart />
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>📋 Category Breakdown</h3>
            <span>All expenses</span>
          </div>
          <CategoryBars maxItems={6} containerId="cat-bars" />
        </div>
      </div>

      <AlertsList />
    </section>
  );
}
