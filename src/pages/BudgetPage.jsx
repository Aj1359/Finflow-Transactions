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
        <div className="section-header" style={{ marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Capital Allocation</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Strategic budget management and expenditure control</p>
          </div>
          {role === 'admin' && (
            <div className="header-actions">
              <span className="badge-new" style={{ background: 'var(--nav-active-bg)', color: 'var(--accent-purple)', padding: '6px 12px' }}>
                Admin Control Active
              </span>
            </div>
          )}
        </div>

        <div className="budget-metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="metric-mini-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Total Monthly Budget</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fmt(Object.values(budgets).reduce((a, b) => a + Number(b), 0))}</div>
          </div>
          <div className="metric-mini-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Amount Spent</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fmt(Object.values(actuals).reduce((a, b) => a + Number(b), 0))}</div>
          </div>
          <div className="metric-mini-card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Remaining Liquidity</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                {fmt(Math.max(0, Object.values(budgets).reduce((a, b) => a + Number(b), 0) - Object.values(actuals).reduce((a, b) => a + Number(b), 0)))}
             </div>
          </div>
        </div>

        <div className="budget-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {expenseCategories.map(cat => {
            const limit = budgets[cat] || 0;
            const actual = actuals[cat] || 0;
            const percent = limit > 0 ? Math.min((actual / limit) * 100, 100) : 0;
            const isOver = limit > 0 && actual > limit;
            const isWarning = limit > 0 && percent > 85 && !isOver;
            
            return (
              <div key={cat} className="budget-card-pro" style={{ 
                background: 'var(--bg-card)', 
                padding: '24px', 
                borderRadius: 'var(--radius-lg)', 
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div className="budget-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{cat}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Allocation</div>
                  </div>
                  <div className={`status-pill ${isOver ? 'danger' : isWarning ? 'warning' : 'success'}`} style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.7rem', 
                    fontWeight: 600,
                    background: isOver ? 'rgba(239,68,68,0.1)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    color: isOver ? 'var(--accent-red)' : isWarning ? 'var(--accent-yellow)' : 'var(--accent-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isOver ? <AlertTriangle size={12} /> : isWarning ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {isOver ? 'CRITICAL' : isWarning ? 'WARNING' : limit > 0 ? 'OPTIMAL' : 'PENDING'}
                  </div>
                </div>

                <div className="budget-progress-container" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{percent.toFixed(0)}% Utilized</span>
                    <span style={{ color: 'var(--text-muted)' }}>{fmt(actual)} / {limit > 0 ? fmt(limit) : '∞'}</span>
                  </div>
                  <div className="pro-progress-bg" style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      className="pro-progress-fill" 
                      style={{ 
                        height: '100%',
                        width: `${percent}%`,
                        background: isOver ? 'var(--accent-red)' : isWarning ? 'var(--accent-yellow)' : 'var(--accent-purple)',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 0 10px ${isOver ? 'rgba(239,68,68,0.3)' : isWarning ? 'rgba(245,158,11,0.3)' : 'rgba(124,58,237,0.3)'}`
                      }} 
                    />
                  </div>
                </div>

                {role === 'admin' && (
                  <div className="budget-edit-pro" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹</span>
                        <input
                          type="number"
                          className="pro-budget-input"
                          placeholder="Set limit"
                          style={{ 
                            width: '100%', 
                            padding: '8px 12px 8px 24px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border)', 
                            background: 'var(--bg-input)',
                            fontSize: '0.85rem'
                          }}
                          value={limit || ''}
                          onChange={(e) => handleUpdateBudget(cat, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {expenseCategories.length === 0 && (
          <div className="empty-state-pro" style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><BarChart2 size={48} color="var(--text-muted)" /></div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Architecture Incomplete</h3>
            <p style={{ color: 'var(--text-muted)' }}>Define expenditure categories to begin financial modeling.</p>
          </div>
        )}
      </div>
    </section>
  );
}
