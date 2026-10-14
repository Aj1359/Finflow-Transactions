import { calculateRegretIndex, EMOTIONAL_REGISTERS } from '../../lib/regretIndex';
import { useStore } from '../../store/useFinFlowStore';
import { HeartCrack, AlertCircle, Smile, Frown, Sparkles, Brain } from 'lucide-react';

export default function RegretIndexWidget() {
  const { state } = useStore();
  const regretData = calculateRegretIndex(state.transactions);

  const getScoreColor = (score) => {
    if (score >= 65) return '#ef4444';
    if (score >= 40) return '#f97316';
    return '#10b981';
  };

  return (
    <div className="insight-card-pro regret-widget-card" style={{
      background: state.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 15px rgba(239,68,68,0.3)'
          }}>
            <HeartCrack size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Regret Index <span style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>NLP TONE MINING</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sentiment analysis on self-authored spend descriptions
            </p>
          </div>
        </div>

        <div style={{
          padding: '8px 16px', borderRadius: '14px',
          background: getScoreColor(regretData.overallScore) + '15',
          border: `1px solid ${getScoreColor(regretData.overallScore)}40`,
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Brain size={18} color={getScoreColor(regretData.overallScore)} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Regret Score</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: getScoreColor(regretData.overallScore) }}>
              {regretData.overallScore} / 100 <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>({regretData.riskLevel} Risk)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regret Progress Meter */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 600 }}>
          <span>Low Regret (Essential & Planned)</span>
          <span>High Regret (Impulse & Stress)</span>
        </div>
        <div style={{ height: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${regretData.overallScore}%`, background: `linear-gradient(90deg, #10b981, #f97316, #ef4444)`, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Grid: Emotional Breakdown & Category Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Emotional Register Pills */}
        <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#a855f7" /> Emotional Register Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(EMOTIONAL_REGISTERS).map(([key, reg]) => {
              const count = regretData.registerBreakdown[key] || 0;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: reg.color }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reg.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: reg.color, background: reg.color + '20', padding: '2px 10px', borderRadius: '10px' }}>
                    {count} txs
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Category Regret Scores */}
        <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} color="#f97316" /> Highest Regret Categories
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {regretData.categoryScores.slice(0, 4).map((cat) => (
              <div key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    (₹{cat.totalSpent.toLocaleString('en-IN')})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: `${cat.avgScore}%`, height: '100%', background: getScoreColor(cat.avgScore) }} />
                  </div>
                  <span style={{ fontWeight: 800, color: getScoreColor(cat.avgScore), width: '28px', textAlign: 'right' }}>
                    {cat.avgScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Regret Reflection List */}
      {regretData.highRegretTransactions.length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Frown size={16} /> Flagged High-Regret Transactions
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {regretData.highRegretTransactions.map(t => (
              <div key={t.id} style={{
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <span>{t.desc}</span>
                  <span style={{ color: '#ef4444' }}>₹{t.amount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Tag: <span style={{ color: '#ef4444', fontWeight: 700 }}>{EMOTIONAL_REGISTERS[t.emotionalTag]?.label || t.emotionalTag}</span> • {t.regretReason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
