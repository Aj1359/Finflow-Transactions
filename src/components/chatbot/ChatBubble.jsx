import { useEffect, useState } from 'react';

export default function ChatBubble({ open, onToggle }) {
  const [showUnread, setShowUnread] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) setShowUnread(true); }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <button 
      className={`chat-bubble-pro${open ? ' open' : ''}`} 
      id="chat-bubble" 
      onClick={() => { setShowUnread(false); onToggle(); }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #a855f7, #6b21a8)',
        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4), inset -5px -5px 15px rgba(0,0,0,0.3), inset 5px 5px 15px rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: 'bubble-pulse 3s infinite ease-in-out'
      }}
    >
      <div className="ai-sphere-core" style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 0 15px #fff, 0 0 30px #a855f7',
        animation: 'core-float 2s infinite ease-in-out'
      }} />
      
      {showUnread && !open && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: 'var(--accent-red)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 900,
          padding: '4px 8px',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          border: '2px solid var(--bg-card)'
        }}>1</span>
      )}

      <style>{`
        @keyframes bubble-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(168, 85, 247, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 12px 48px rgba(168, 85, 247, 0.6); }
        }
        @keyframes core-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-3px) scale(1.1); opacity: 1; }
        }
        .chat-bubble-pro.open {
          transform: rotate(90deg) scale(0.8);
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </button>
  );
}
