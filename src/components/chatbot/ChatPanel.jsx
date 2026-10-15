import { useState, useRef, useEffect } from 'react';
import { FinBot } from '../../lib/chatbot';
import { sendAgentMessage } from '../../lib/agentApi';
import { useStore, verifyPersistedBudgets } from '../../store/useFinFlowStore';
import { useAppToast } from '../../App';
import AgentTrace from './AgentTrace';
import BudgetProposal from './BudgetProposal';
import { X, Send, Bot, Zap, BarChart2, ShieldCheck, Trash2, Sparkles } from 'lucide-react';

/**
 * Safely escapes HTML special characters to prevent XSS injection
 */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safe markdown parser that sanitizes all raw HTML before applying formatting
 */
function safeMarkdownToHtml(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<b style="color:var(--text-primary)">$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/_(.+?)_/g, '<i>$1</i>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.2);padding:2px 4px;border-radius:4px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br>');
}

const GREETING = `**Welcome! I'm FinFlow AI Copilot**, your agentic financial advisor.\n\nI can analyze your transactions, run deterministic calculations, plan category budgets, and execute approved changes.\n\nTry:\n\u2022 *"I earn ₹50,000 monthly. Analyze my spending and help me save ₹10,000 next month."*\n\u2022 *"What's my financial summary?"*\n\u2022 *"Show category spending breakdown"*`;

export default function ChatPanel({ open, onClose }) {
  const { state, addTx, deleteTx, setBudget, setBudgets } = useStore();
  const toast = useAppToast();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('finflow_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);
  const msgsRef = useRef(null);
  const inputRef = useRef(null);
  const isDark = state.theme === 'dark';

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('finflow_chat_history', JSON.stringify(messages));
    if (msgsRef.current) msgsRef.current.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'bot', text: GREETING }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open, messages.length]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('finflow_chat_history');
    setTimeout(() => setMessages([{ id: 'welcome-' + Date.now(), role: 'bot', text: GREETING }]), 100);
  };

  // Approval handler for structured budget proposal
  const handleApproveBudget = (proposal, messageId) => {
    if (!proposal?.validation?.valid || !proposal.validation.targetMet) {
      toast('❌ Budget validation failed. Cannot save.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Save this budget proposal?\nTotal Allocated: ₹${proposal.validation.totalBudget?.toLocaleString('en-IN')}\nTarget Savings: ₹${proposal.savingsTarget?.toLocaleString('en-IN')}`
    );
    if (!confirmed) return;

    setSavingBudget(true);
    try {
      // 1. Execute approved changes in store
      setBudgets(proposal.budgets);

      // 2. Explicit post-update verification against persistent storage
      const verified = verifyPersistedBudgets(proposal.budgets);
      if (!verified) {
        throw new Error('Storage verification failed: Persisted budget limits in storage do not match the approved proposal.');
      }

      // 3. Only after verification succeeds, display confirmation & update UI
      toast('✅ Approved budget verified and saved to your FinFlow store!', 'success');

      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            proposalApproved: true,
            proposalRejected: false
          };
        }
        return m;
      }).concat({
        id: Date.now() + 1,
        role: 'bot',
        text: `✅ **Budget Successfully Applied & Verified**\n\nCategory spending limits have been locked into verified storage for **${proposal.budgets.length} categories** with a target monthly savings of **₹${proposal.savingsTarget?.toLocaleString('en-IN')}**.\n\nYou can track live progress anytime on the **Budget** tab.`
      }));
    } catch (err) {
      toast('❌ Verification error: ' + err.message, 'error');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: `❌ **Failed to verify budget persistence:** ${err.message}`
      }]);
    } finally {
      setSavingBudget(false);
    }
  };

  // Rejection handler
  const handleRejectBudget = (messageId) => {
    toast('Budget proposal rejected. No changes made.', 'info');
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          proposalRejected: true,
          proposalApproved: false
        };
      }
      return m;
    }).concat({
      id: Date.now() + 1,
      role: 'bot',
      text: 'Budget proposal was **rejected**. No limits have been changed.'
    }));
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || sending) return;
    if (!overrideText) setInput('');

    const userMsgId = Date.now();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);

    // Handle Interactive Transaction Confirmation (from pre-red zone)
    if (pendingTx) {
      if (/yes|yeah|sure|yep|ok|confirm|do it|add it/i.test(text)) {
        addTx(pendingTx);
        toast('✅ Transaction added by FinBot.', 'success');
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: '**Transaction Logged**\nExpense has been successfully added.' }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: 'Transaction cancelled.' }]);
      }
      setPendingTx(null);
      return;
    }

    setSending(true);

    // 1. Try Agentic AI Backend (Express + Gemini Function Calling Loop)
    let agentSucceeded = false;
    try {
      const agentResult = await sendAgentMessage({
        message: text,
        transactions: state.transactions,
        budgets: state.budgets
      });

      if (agentResult && (agentResult.reply || agentResult.trace)) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'bot',
            text: agentResult.reply,
            trace: agentResult.trace || [],
            proposal: agentResult.proposal || null
          }
        ]);
        agentSucceeded = true;
      }
    } catch {
      // Fallback silently triggers below
    }

    // 2. Offline / Local Fallback (Deterministic FinBot Engine)
    if (!agentSucceeded) {
      try {
        const outcome = await FinBot.processMessage(text, state.transactions, act => {
          if (act.action === 'add_transaction') {
            addTx(act.tx);
            toast('✅ Transaction added by FinBot.', 'success');
          }
          if (act.action === 'delete_transaction') {
            deleteTx(act.id);
            toast('🗑️ Transaction deleted by FinBot.', 'info');
          }
          if (act.action === 'set_budget') {
            setBudget(act.category, act.amount);
            toast(`💰 ${act.category} budget updated to ₹${act.amount}.`, 'success');
          }
          if (act.action === 'clear_chat') {
            clearChat();
          }
        }, state.role, state.budgets);

        if (outcome && outcome.requiresWarning) {
          setPendingTx(outcome.pendingTx);
        }

        if (outcome && outcome.text) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            role: 'bot',
            text: outcome.text + '\n\n_Note: Executed via local offline engine._'
          }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: '❌ Error: ' + err.message }]);
      }
    }

    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="pro-chat-panel" style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: 'min(450px, 94vw)',
      height: 'min(720px, 88vh)',
      background: isDark ? 'rgba(12, 12, 18, 0.94)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(24px) saturate(180%)',
      borderRadius: '28px',
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(168, 85, 247, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9999,
      animation: 'chat-slide-in 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
    }}>
      <style>{`
        @keyframes chat-slide-in { from { opacity: 0; transform: translateY(30px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typing-pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .chat-msg-wrap { animation: msg-in 0.35s ease; }
        .chat-input-field { outline: none !important; }
        .chat-input-field:focus { box-shadow: inset 0 0 0 2px rgba(168,85,247,0.4) !important; }
        .quick-btn:hover { background: linear-gradient(135deg,rgba(168,85,247,0.15),rgba(99,102,241,0.1)) !important; border-color: rgba(168,85,247,0.4) !important; }
        .chat-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 6px 20px rgba(168,85,247,0.6) !important; }
        .chat-clear-btn:hover { opacity: 1 !important; color: #ef4444 !important; }
        .typing-dot { display: inline-block; width:8px; height:8px; border-radius:50%; background: var(--accent-purple); animation: typing-pulse 1.2s ease infinite; }
        .typing-dot:nth-child(2){animation-delay:0.2s} .typing-dot:nth-child(3){animation-delay:0.4s}
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg,#a855f7,#6b21a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(168,85,247,0.4)', flexShrink: 0 }}>
          <Bot size={22} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            FinFlow AI Copilot
            <Sparkles size={14} style={{ color: '#06b6d4' }} />
          </div>
          <div style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {sending ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Reasoning & Calling Tools <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></span> : 'Autonomous Financial Agent'}
          </div>
        </div>
        <button className="chat-clear-btn" onClick={clearChat} title="Clear conversation" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5, transition: '0.2s', padding: '6px' }}>
          <Trash2 size={17} />
        </button>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5, transition: '0.2s', padding: '6px' }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.5}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="no-scrollbar">
        {messages.map(m => (
          <div key={m.id} className="chat-msg-wrap" style={{ display: 'flex', gap: '10px', flexDirection: m.role === 'bot' ? 'row' : 'row-reverse', alignItems: 'flex-start' }}>
            {m.role === 'bot' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: 'linear-gradient(135deg,#a855f7,#6b21a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(168,85,247,0.3)' }}>
                <Bot size={14} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: m.role === 'bot' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
              fontSize: '0.88rem',
              lineHeight: '1.65',
              background: m.role === 'bot'
                ? (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)')
                : 'linear-gradient(135deg,#a855f7,#7c3aed)',
              color: m.role === 'bot' ? 'var(--text-primary)' : '#fff',
              boxShadow: m.role === 'user' ? '0 4px 15px rgba(168,85,247,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div dangerouslySetInnerHTML={{ __html: safeMarkdownToHtml(m.text) }} />

              {/* Render Agent Trace audit log if tools were called */}
              {m.trace && m.trace.length > 0 && (
                <AgentTrace trace={m.trace} />
              )}

              {/* Render Interactive Budget Approval Card */}
              {m.proposal && !m.proposalApproved && !m.proposalRejected && (
                <BudgetProposal
                  proposal={m.proposal}
                  saving={savingBudget}
                  onApprove={() => handleApproveBudget(m.proposal, m.id)}
                  onReject={() => handleRejectBudget(m.id)}
                />
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="chat-msg-wrap" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: 'linear-gradient(135deg,#a855f7,#6b21a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={14} color="#fff" />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '4px 18px 18px 18px', background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '0 16px 10px', display: 'flex', gap: '7px', overflowX: 'auto', flexShrink: 0 }} className="no-scrollbar">
        {[
          ['Plan ₹50k Budget', <Sparkles size={12}/>, 'I earn ₹50,000 monthly. Analyze my spending and create a budget to save ₹10,000 next month.'],
          ['Summary', <BarChart2 size={12}/>, 'What is my financial summary and cash flow?'],
          ['Top Spend', <Zap size={12}/>, 'Which categories contribute most to my spending?'],
          ['Insights', <ShieldCheck size={12}/>, 'Show spending insights'],
        ].map(([label, icon, msg]) => (
          <button key={label} className="quick-btn" onClick={() => handleSend(msg)} style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(168,85,247,0.15)',
            padding: '5px 11px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            color: 'var(--text-primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: '0.2s',
          }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(168,85,247,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            ref={inputRef}
            className="chat-input-field"
            type="text"
            placeholder="Ask AI Copilot (e.g. Plan a ₹50k budget to save ₹10k)..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            style={{
              flex: 1,
              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(168,85,247,0.15)',
              padding: '12px 16px',
              borderRadius: '14px',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              transition: '0.2s',
            }}
          />
          <button
            className="chat-send-btn"
            disabled={sending || !input.trim()}
            onClick={() => handleSend()}
            style={{
              width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
              background: input.trim() ? 'linear-gradient(135deg,#a855f7,#6b21a8)' : 'rgba(168,85,247,0.3)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
              boxShadow: input.trim() ? '0 4px 15px rgba(168,85,247,0.4)' : 'none',
              transition: '0.2s',
            }}
          >
            <Send size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
