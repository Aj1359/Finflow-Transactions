

import { useStore } from '../store/useFinFlowStore';
import InsightCards from '../components/insights/InsightCards';
import RegretIndexWidget from '../components/insights/RegretIndexWidget';
import LocalBenchmarkWidget from '../components/insights/LocalBenchmarkWidget';
import AlertsList from '../components/insights/AlertsList';
import MonthlyChart from '../components/charts/MonthlyChart';
import CategoryBars from '../components/dashboard/CategoryBars';
import { List } from 'lucide-react';

export default function InsightsPage() {
  const { state } = useStore();
  const isActive = state.activeSection === 'insights';

  return (
    <section className={`section${isActive ? ' active' : ''}`} id="section-insights">
      <div className="section-header">
        <div>
          <h2>Insights & Behavioral Intelligence</h2>
          <p>Understanding your emotional tone, spending habits & peer benchmark rank</p>
        </div>
      </div>

      <InsightCards />
      
      {/* Novel Behavioral Finance Features */}
      <RegretIndexWidget />
      <LocalBenchmarkWidget />

      <div className="charts-grid">
        <MonthlyChart />
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><List size={18} /> Category Breakdown</h3>
            <span>All expenses</span>
          </div>
          <CategoryBars maxItems={6} containerId="cat-bars" />
        </div>
      </div>

      <AlertsList />
    </section>
  );
}
