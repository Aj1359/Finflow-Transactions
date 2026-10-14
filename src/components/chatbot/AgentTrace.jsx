import { Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AgentTrace({ trace = [] }) {
  if (!trace.length) return null;

  return (
    <details className="agent-trace" style={{
      marginTop: '10px',
      marginBottom: '6px',
      padding: '8px 12px',
      borderRadius: '12px',
      background: 'var(--bg-subtle, rgba(0, 0, 0, 0.04))',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
      fontSize: '0.8rem',
      color: 'var(--text-secondary, #94a3b8)',
      cursor: 'pointer'
    }}>
      <summary style={{
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-primary, #f8fafc)',
        userSelect: 'none'
      }}>
        <Terminal size={14} style={{ color: '#06b6d4' }} />
        <span>How FinFlow analyzed your request ({trace.length} tool calls)</span>
      </summary>
      <ol style={{
        margin: '8px 0 2px',
        paddingLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {trace.map((item, index) => (
          <li key={`${item.tool}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {item.status === 'success' ? (
              <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={12} style={{ color: '#ef4444', flexShrink: 0 }} />
            )}
            <strong style={{ color: 'var(--text-primary, #e2e8f0)', fontFamily: 'monospace' }}>{item.tool}</strong>
            <span>—</span>
            <span>{item.summary}</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 5px',
              borderRadius: '6px',
              background: item.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: item.status === 'success' ? '#10b981' : '#ef4444',
              fontWeight: 600
            }}>
              {item.status}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}
