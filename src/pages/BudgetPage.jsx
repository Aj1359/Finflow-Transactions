import { useStore } from '../store/useFinFlowStore';
import { fmt } from '../lib/utils';
import { CATEGORIES } from '../lib/constants';
import { BarChart2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BudgetPage() {
  const { state, setBudget } = useStore();
  const { transactions, budgets, role } = state;

  // Calculate actual spending per category for the current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const actuals = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const handleUpdateBudget = (cat, val) => {
    if (role !== 'admin') return;
    const amount = parseFloat(val) || 0;
    setBudget(cat, amount);
  };

  const expenseCategories = CATEGORIES.filter(c => !['Salary', 'Freelance', 'Investments'].includes(c));
  const isActive = state.activeSection === 'budget';

  return (
    <section className={`section${isActive ? ' active' : ''}`} id="section-budget">
      <div className="budget-page">
        <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Budget Planning</h2>
          <p style={{ color: 'var(--text-muted)' }}>Set monthly limits and track your spending efficiency</p>
        </div>
      </div>

      <div className="budget-grid">
        {expenseCategories.map(cat => {
          const limit = budgets[cat] || 0;
          const actual = actuals[cat] || 0;
          const percent = limit > 0 ? Math.min((actual / limit) * 100, 100) : 0;
          const isOver = limit > 0 && actual > limit;
          
          return (
            <div key={cat} className="budget-card">
              <div className="budget-card-header">
                <h3>{cat}</h3>
                <span className={`status-badge ${isOver ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {isOver ? <><AlertTriangle size={12} /> Over Budget</> : (limit > 0 ? <><CheckCircle size={12} /> On Track</> : 'Not Set')}
                </span>
              </div>

              <div className="budget-stats">
                <span>Spent: **{fmt(actual)}**</span>
                <span>Limit: **{limit > 0 ? fmt(limit) : '—'}**</span>
              </div>

              <div className="budget-progress-wrap">
                <div className="budget-progress-bar">
                  <div 
                    className="budget-progress-fill" 
                    style={{ 
                      width: `${percent}%`,
                      background: isOver ? 'var(--accent-red)' : 'var(--accent-purple)'
                    }} 
                  />
                </div>
              </div>

              {role === 'admin' && (
                <div className="budget-input-group">
                  <input
                    type="number"
                    className="budget-input"
                    placeholder="Set limit..."
                    value={limit || ''}
                    onChange={(e) => handleUpdateBudget(cat, e.target.value)}
                  />
                  <span style={{ fontSize: '0.8rem', alignSelf: 'center', color: 'var(--text-muted)' }}>₹</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {expenseCategories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart2 size={32} /></div>
          <h3>No categories defined</h3>
        </div>
      )}
      </div>
    </section>
  );
}
