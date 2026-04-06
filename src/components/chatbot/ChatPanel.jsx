import { useState, useRef, useEffect } from 'react';
import { FinBot } from '../../lib/chatbot';
import { useStore } from '../../store/useFinFlowStore';
import { useAppToast } from '../../App';
import { Settings, Trash2, X, Send, Bot, User, Zap, MessageSquareWarning, Wallet, BarChart2, Award, Calendar, Search, ShieldCheck } from 'lucide-react';

function markdownToHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b style="color:var(--text-primary)">$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');
}

export default function ChatPanel({ open, onClose }) {
  const { state, addTx, deleteTx, setBudget } = useStore();
  const toast = useAppToast();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('finflow_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const msgsRef = useRef(null);
  const inputRef = useRef(null);
  const isDark = state.theme === 'dark';

  useEffect(() => {
    localStorage.setItem('finflow_chat_history', JSON.stringify(messages));
    if (msgsRef.current) msgsRef.current.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ 
        id: 'welcome', 
        role: 'bot', 
        text: 'Greetings. I am **FinBot**, your dedicated financial intelligence companion.\n\nI have audited your enterprise data and I am ready to assist with budget adjustments, expenditure tracking, or deep-dive analysis.' 
      }]);
    }
  }, [open]);

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || sending) return;
    if (!overrideText) setInput('');
    
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    setSending(true);

    try {
      const { text: reply, action } = await FinBot.processMessage(text, state.transactions, act => {
        if (act.action === 'add_transaction') { addTx(act.tx); toast('Intelligence added transaction.', 'info'); }
        if (act.action === 'set_budget') { setBudget(act.category, act.amount); toast(`${act.category} budget optimized.`, 'info'); }
        if (act.action === 'clear_chat') setMessages([]);
      }, state.role, state.budgets);
      
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: 'Error in cognitive path: ' + err.message }]);
    }
    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="pro-chat-panel" style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: 'min(420px, 90vw)',
      height: 'min(680px, 82vh)',
      background: isDark ? 'rgba(15, 15, 20, 0.88)' : 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: '28px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(168, 85, 247, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999,
      animation: 'chat-slide-in 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
    }}>
      <style>{`
        @keyframes chat-slide-in { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .pro-chat-msg.bot { align-self: flex-start; background: var(--bg-secondary); color: var(--text-primary); border-top-left-radius: 4px; }
        .pro-chat-msg.user { align-self: flex-end; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; border-top-right-radius: 4px; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3); }
      `}</style>

      {/* Premium Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', overflow: 'hidden', background: '#000', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/ai-avatar.png" alt="FinBot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>FinBot Enterprise</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>3D Cognitive Intelligence</div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6, transition: '0.2s' }} onMouseOver={e=>e.target.style.opacity=1} onMouseOut={e=>e.target.style.opacity=0.6}>
          <X size={20} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="no-scrollbar">
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', gap: '12px', flexDirection: m.role === 'bot' ? 'row' : 'row-reverse', alignItems: 'flex-start', animation: 'msg-fade-in 0.4s cubic-bezier(0, 0.5, 0.5, 1)' }}>
            {m.role === 'bot' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                <img src="/ai-avatar.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div className={`pro-chat-msg ${m.role}`} style={{
              maxWidth: '75%',
              padding: '14px 18px',
              borderRadius: '18px',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              boxShadow: m.role === 'bot' ? '0 4px 15px rgba(0,0,0,0.05)' : '0 8px 25px rgba(168, 85, 247, 0.3)',
              position: 'relative',
              background: m.role === 'bot' ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : 'linear-gradient(135deg, #a855f7, #6b21a8)',
              color: m.role === 'bot' ? 'var(--text-primary)' : '#fff',
            }}>
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(m.text) }} />
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Suggestions */}
      <div style={{ padding: '0 20px 10px', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }} className="no-scrollbar">
        {[
          ['Audit', <ShieldCheck size={14} />, "Financial audit"],
          ['Budget', <BarChart2 size={14} />, "Show budget plan"],
          ['Forecast', <Zap size={14} />, "Spending forecast"]
        ].map(([label, icon, msg]) => (
          <button key={label} onClick={() => handleSend(msg)} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(168, 85, 247, 0.1)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: 'var(--text-primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: '0.2s'
          }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Executive Input Area */}
      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.03)', borderTop: '1px solid rgba(168, 85, 247, 0.1)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            ref={inputRef}
            type="text"
            placeholder="Instruct FinBot..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              border: 'none',
              padding: '14px 50px 14px 20px',
              borderRadius: '16px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          <button 
            disabled={sending}
            onClick={() => handleSend()}
            style={{
              position: 'absolute',
              right: '8px',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #6b21a8)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(168, 85, 247, 0.4)'
            }}
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
