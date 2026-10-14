import { Check, X, ShieldAlert, Sparkles, PieChart } from 'lucide-react';

export default function BudgetProposal({ proposal, onApprove, onReject, saving = false }) {
  if (!proposal) return null;
  const { income = 0, savingsTarget = 0, budgets = [], validation = {}, note = '' } = proposal;

  const isValid = validation.valid && validation.targetMet;

  return (
    <div className="budget-proposal" style={{
      marginTop: '12px',
      marginBottom: '10px',
      padding: '16px',
      borderRadius: '16px',
      background: 'var(--bg-subtle, rgba(255, 255, 255, 0.05))',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      fontSize: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <PieChart size={16} />
          </div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Proposed Monthly Budget
          </h4>
        </div>
        <span style={{
          fontSize: '0.7rem',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: 700,
          background: isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: isValid ? '#10b981' : '#ef4444'
        }}>
          {isValid ? 'VERIFIED' : 'INVALID'}
        </span>
      </div>

      {note && (
        <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
          {note}
        </p>
      )}

      {/* Income & Target summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '12px',
        padding: '10px',
        borderRadius: '10px',
        background: 'var(--bg-card, rgba(0, 0, 0, 0.2))'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monthly Income</span>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            ₹{Number(income).toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target Savings</span>
          <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>
            ₹{Number(savingsTarget).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Category allocations list */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Category Allocations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {budgets.map((item) => (
            <div key={item.category} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'var(--bg-subtle, rgba(255, 255, 255, 0.03))',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.06))'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.category}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{Number(item.amount).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total & Validation check */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
        marginBottom: '12px'
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Allocated Expenses:</span>
        <strong style={{ color: 'var(--text-primary)' }}>
          ₹{Number(validation.totalBudget || 0).toLocaleString('en-IN')}
        </strong>
      </div>

      {!isValid ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#ef4444',
          marginBottom: '12px',
          fontSize: '0.78rem'
        }}>
          <ShieldAlert size={14} />
          <span>This budget does not meet the validation requirements.</span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#10b981',
          marginBottom: '12px',
          fontSize: '0.78rem'
        }}>
          <Sparkles size={14} />
          <span>Validation passed. Review before confirming.</span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          disabled={saving || !isValid}
          onClick={onApprove}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: isValid ? 'linear-gradient(135deg, #10b981, #059669)' : 'gray',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: isValid && !saving ? 'pointer' : 'not-allowed',
            opacity: saving ? 0.7 : 1,
            boxShadow: isValid ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <Check size={14} />
          {saving ? 'Saving...' : 'Approve & Save'}
        </button>
        <button
          disabled={saving}
          onClick={onReject}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'var(--bg-subtle, rgba(255, 255, 255, 0.08))',
            color: 'var(--text-secondary, #94a3b8)',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          <X size={14} />
          Reject
        </button>
      </div>
    </div>
  );
}
