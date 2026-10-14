import { useState, useMemo } from 'react';
import { generateSpendingDNAVectors, buildDNAPath } from '../../lib/spendingDNA';
import { useStore } from '../../store/useFinFlowStore';
import { Dna, Download, Share2, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function SpendingDNA() {
  const { state } = useStore();
  const [activeNode, setActiveNode] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const { vectors, hash, healthIndex, savingsRate, discretionaryRatio } = useMemo(() => {
    return generateSpendingDNAVectors(state.transactions, state.budgets);
  }, [state.transactions, state.budgets]);

  // Build current month DNA path
  const { pathD, points } = useMemo(() => {
    return buildDNAPath(vectors, 160, 160, 95, 50);
  }, [vectors]);

  // Previous month comparison mockup vectors (slightly varied for overlay)
  const prevVectors = useMemo(() => {
    return vectors.map(v => ({ ...v, val: Math.max(0.1, Math.min(0.9, v.val + (Math.sin(v.val * 10) * 0.15))) }));
  }, [vectors]);

  const { pathD: prevPathD } = useMemo(() => {
    return buildDNAPath(prevVectors, 160, 160, 95, 50);
  }, [prevVectors]);

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('spending-dna-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Spending_DNA_${hash}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="spending-dna-card" style={{
      background: state.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 10px 35px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 15px rgba(168,85,247,0.35)'
          }}>
            <Dna size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Spending DNA <span style={{ fontSize: '0.72rem', background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>GENERATIVE FINGERPRINT</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Unique visual habit signature • <strong style={{ color: '#a855f7' }}>{hash}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setShowOverlay(!showOverlay)} style={{
            background: showOverlay ? 'rgba(168,85,247,0.2)' : 'var(--bg-subtle)',
            border: '1px solid var(--border-color)', color: 'var(--text-primary)',
            padding: '7px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Layers size={14} /> {showOverlay ? 'Hide Previous' : 'Compare Prev Month'}
          </button>
          <button onClick={handleDownloadSVG} style={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            border: 'none', color: '#fff',
            padding: '7px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 12px rgba(168,85,247,0.3)'
          }}>
            <Download size={14} /> Export SVG
          </button>
        </div>
      </div>

      {/* Main Layout: SVG Visualizer + Vector Breakdown Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
        
        {/* Generative SVG Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <svg id="spending-dna-svg" viewBox="0 0 320 320" style={{ width: '100%', maxWidth: '320px', height: 'auto', filter: 'drop-shadow(0 10px 20px rgba(168,85,247,0.2))' }}>
            <defs>
              <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="dnaStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f5ff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Concentric Guide Grid Rings */}
            <circle cx="160" cy="160" r="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
            <circle cx="160" cy="160" r="95" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
            <circle cx="160" cy="160" r="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeDasharray="2 2" />

            {/* Axis Radar Spokes */}
            {points.map((p, i) => (
              <line key={i} x1="160" y1="160" x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            ))}

            {/* Overlay Month DNA Path */}
            {showOverlay && (
              <path d={prevPathD} fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
            )}

            {/* Main Generative DNA Bezier Polygon */}
            <path d={pathD} fill="url(#dnaGradient)" stroke="url(#dnaStroke)" strokeWidth="3.5" />

            {/* Interactive Vector Nodes */}
            {points.map((p, i) => (
              <g key={i} onClick={() => setActiveNode(p)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={activeNode?.name === p.name ? "8" : "5.5"} fill="#00f5ff" stroke="#ffffff" strokeWidth="2" />
                {activeNode?.name === p.name && (
                  <circle cx={p.x} cy={p.y} r="12" fill="none" stroke="#00f5ff" strokeWidth="1.5" style={{ animation: 'ping 1.5s infinite' }} />
                )}
              </g>
            ))}

            {/* Center DNA Core Hash Badge */}
            <circle cx="160" cy="160" r="24" fill="rgba(12, 12, 18, 0.85)" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" />
            <text x="160" y="164" textAnchor="middle" fill="#00f5ff" fontSize="10" fontWeight="900">DNA</text>
          </svg>

          {/* Node Tooltip Info */}
          {activeNode && (
            <div style={{
              position: 'absolute', bottom: '0', background: 'rgba(12,12,18,0.9)',
              border: '1px solid #00f5ff', padding: '6px 14px', borderRadius: '12px',
              fontSize: '0.78rem', color: '#fff', backdropFilter: 'blur(8px)'
            }}>
              <strong>{activeNode.name}</strong>: {Math.round(activeNode.val * 100)}%
            </div>
          )}
        </div>

        {/* Vector Metrics Matrix */}
        <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#00f5ff" /> 8-Vector Financial Profile
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {vectors.map(v => (
              <div key={v.name} style={{ fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>{v.name}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{Math.round(v.val * 100)}%</strong>
                </div>
                <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${v.val * 100}%`, height: '100%', background: 'linear-gradient(90deg, #00f5ff, #a855f7)' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            💡 <em>Your Spending DNA visibly shifts shape as your savings rate and category entropy evolve each month.</em>
          </div>
        </div>

      </div>
    </div>
  );
}
