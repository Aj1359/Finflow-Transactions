import { evaluateLocalBenchmark } from '../../lib/benchmarks';
import { useStore } from '../../store/useFinFlowStore';
import { ShieldCheck, Users, Trophy, Award, ArrowUpRight } from 'lucide-react';

export default function LocalBenchmarkWidget() {
  const { state } = useStore();
  const benchmark = evaluateLocalBenchmark(state.transactions);

  return (
    <div className="local-benchmark-card" style={{
      background: state.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 10px 35px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,0.35)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Local Benchmarking <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>100% OFFLINE PRIVACY</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Anonymized client-side percentile comparison • <strong>{benchmark.tierLabel}</strong>
            </p>
          </div>
        </div>

        {/* Top Percentile Badge */}
        <div style={{
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          padding: '8px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Trophy size={20} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Savings Percentile</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>
              Top {100 - benchmark.savingsPercentile}% Savers
            </div>
          </div>
        </div>
      </div>

      {/* Headline Insight Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
        border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px',
        padding: '14px 18px', marginBottom: '20px', fontSize: '0.9rem',
        fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <Award size={20} color="#10b981" />
        {benchmark.summaryHeadline}
      </div>

      {/* Category Percentile Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {benchmark.categoryComparisons.map(cat => (
          <div key={cat.category} style={{
            background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{cat.category}</span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                background: cat.percentile >= 50 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: cat.percentile >= 50 ? '#10b981' : '#ef4444'
              }}>
                Top {100 - cat.percentile}% Frugal
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {cat.headline}
            </div>

            {/* Compare Bar: User vs Peer Median */}
            <div style={{ fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>You: <strong>{cat.userPct}%</strong> of spend</span>
                <span>Peer Median: <strong>{cat.medianPct}%</strong></span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: `${cat.userPct}%`, height: '100%', background: '#10b981' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${cat.medianPct}%`, width: '2px', background: '#f97316' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
