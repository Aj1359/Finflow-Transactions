import { useState } from 'react';
import { Bot, Calendar, Target, ShieldAlert, ArrowRight, X, Clock, Sparkles } from 'lucide-react';
import { generateFutureSelfDialogue } from '../../lib/futureSelfNegotiation';

export default function FutureSelfModal({ open, impact, proposedTx, onConfirm, onCancel, onNegotiateDown, onDelay }) {
  if (!open || !impact) return null;

  const dialogue = generateFutureSelfDialogue(impact, proposedTx);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      animation: 'modal-fade-in 0.3s ease'
    }}>
      <style>{`
        @keyframes modal-fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <div style={{
        background: 'var(--card-bg, #12131c)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '28px',
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 25px 70px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(168, 85, 247, 0.2)',
        color: 'var(--text-primary)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onCancel} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'transparent', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', opacity: 0.7, transition: '0.2s'
        }}>
          <X size={20} />
        </button>

        {/* Future You Persona Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(168,85,247,0.4)', color: '#fff'
          }}>
            <Bot size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>Future-Self Negotiation</h3>
              <span style={{ fontSize: '0.68rem', background: 'rgba(168,85,247,0.2)', color: '#a855f7', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                PRE-RED ZONE
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pushback from your future financial self
            </p>
          </div>
        </div>

        {/* Impact Highlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 14px', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} /> GOAL DELAY IMPACT
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>
              +{impact.delayInDays} Days
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Pushes back "{impact.goalName}"
            </div>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168,85,247,0.2)', padding: '12px 14px', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Target size={13} /> SAVINGS GOAL CONSUMED
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#a855f7', marginTop: '4px' }}>
              {impact.goalImpactPct}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Of remaining goal target
            </div>
          </div>
        </div>

        {/* Future You Dialogue Bubble */}
        <div style={{
          background: 'var(--bg-subtle, rgba(255,255,255,0.04))',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          padding: '16px',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          marginBottom: '24px',
          color: 'var(--text-primary)'
        }}>
          {dialogue.split('\n\n').map((para, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }} dangerouslySetInnerHTML={{
              __html: para.replace(/\*\*(.+?)\*\*/g, '<b style="color:#a855f7">$1</b>').replace(/_(.+?)_/g, '<i>$1</i>')
            }} />
          ))}
        </div>

        {/* Action Buttons: Negotiation Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={onNegotiateDown} style={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '14px',
            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 6px 20px rgba(168,85,247,0.35)', transition: '0.2s'
          }}>
            <Sparkles size={16} /> Negotiate Down (Reduce by 30%)
          </button>

          <button onClick={onDelay} style={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)', border: '1px solid var(--border-color)',
            padding: '10px 18px', borderRadius: '14px',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: '0.2s'
          }}>
            <Clock size={15} /> Wait 48 Hours (Set Cool-off Reminder)
          </button>

          <button onClick={onConfirm} style={{
            background: 'transparent',
            color: 'var(--text-muted)', border: 'none',
            padding: '8px 18px', borderRadius: '12px',
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Proceed anyway (Log with reflection)
          </button>
        </div>
      </div>
    </div>
  );
}
