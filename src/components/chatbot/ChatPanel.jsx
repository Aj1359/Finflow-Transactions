/* ═══════════════════════════════════════════════════════════
   FinFlow — Chat Panel  |  src/components/chatbot/ChatPanel.jsx
   ═══════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { FinBot } from '../../lib/chatbot';
import { useStore } from '../../store/useFinFlowStore';
import { useAppToast } from '../../App';
import FINFLOW_CONFIG from '../../config/finflow.config';

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

export default function ChatPanel({ open, onClose }) {
  const { state, addTx, deleteTx } = useStore();
  const toast = useAppToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('finflow_gemini_key') || '');
  const [aiMode, setAiMode] = useState(() => {
    const k = localStorage.getItem('finflow_gemini_key') || FINFLOW_CONFIG.GEMINI_API_KEY || '';
    return k.length > 10 ? 'gemini' : 'local';
  });
  const msgsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      appendBot('Welcome to **FinBot**, your enterprise financial assistant.\n\nI am equipped to provide deep insights into your financial data. How may I assist you today?\n\nTry: **"Show budget plan"** or **"What is my balance?"**');
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  const appendBot = (text, isTyping = false) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'bot', text, isTyping }]);
  };
  const appendUser = text => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'user', text }]);
  };
  const removeTyping = () => {
    setMessages(prev => prev.filter(m => !m.isTyping));
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    appendUser(text);
    setSending(true);
    appendBot('', true); // typing indicator

    try {
      const { text: reply, action } = await FinBot.processMessage(text, state.transactions, act => {
        if (act.action === 'add_transaction' && act.tx) {
          addTx(act.tx);
          toast('FinBot added a transaction! 🤖', 'success');
        }
        if (act.action === 'delete_transaction' && act.tx) {
          deleteTx(act.tx.id);
          toast(`FinBot deleted: ${act.tx.desc}`, 'success');
        }
      }, state.role);
      removeTyping();
      appendBot(reply);
    } catch (err) {
      removeTyping();
      appendBot('❌ Something went wrong: ' + err.message);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleQuick = msg => {
    setInput(msg);
    setTimeout(() => { setInput(''); appendUser(msg); handleSendRaw(msg); }, 0);
  };

  const handleSendRaw = async msg => {
    setSending(true);
    appendBot('', true);
    try {
      const { text: reply } = await FinBot.processMessage(msg, state.transactions, act => {
        if (act.action === 'add_transaction' && act.tx) { addTx(act.tx); toast('FinBot added a transaction! 🤖', 'success'); }
      }, state.role);
      removeTyping();
      appendBot(reply);
    } catch (err) {
      removeTyping();
      appendBot('❌ ' + err.message);
    }
    setSending(false);
  };

  const saveApiKey = () => {
    localStorage.setItem('finflow_gemini_key', apiKey);
    window.FINFLOW_CONFIG.GEMINI_API_KEY = apiKey;
    setAiMode(apiKey.length > 10 ? 'gemini' : 'local');
    setSettingsOpen(false);
    toast(apiKey ? '✅ Gemini API key saved! AI mode activated.' : '⚡ Switched to local RAG mode.', 'success');
  };

  const clearChat = () => {
    setMessages([]);
    appendBot('Chat cleared! Ask me anything 💬');
  };

  return (
    <div className={`chat-panel${open ? ' open' : ''}`} id="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div className="chat-header-info">
          <div className="chat-header-name">FinBot AI</div>
          <div className="chat-header-status">
            <div className="status-dot" />
            <span id="chat-mode-label">{aiMode === 'gemini' ? 'Gemini AI Mode' : 'Local RAG Mode'}</span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-head-btn" title="API Settings" onClick={() => setSettingsOpen(v => !v)}>⚙️</button>
          <button className="chat-head-btn" title="Clear chat" onClick={clearChat}>🗑</button>
          <button className="chat-head-btn" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      {/* Settings */}
      <div className={`chat-settings${settingsOpen ? ' visible' : ''}`}>
        <label>Gemini API Key <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — for AI-powered answers)</span></label>
        <input type="password" id="gemini-key-input" placeholder="AIza…" value={apiKey} onChange={e => setApiKey(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`ai-mode-badge ${aiMode === 'gemini' ? 'ai-mode-gemini' : 'ai-mode-local'}`} id="ai-badge">
            {aiMode === 'gemini' ? '🤖 Gemini AI' : '⚡ Local RAG'}
          </span>
          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={saveApiKey}>Save Key</button>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
          Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>aistudio.google.com</a>
        </p>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chat-messages" ref={msgsRef}>
        {messages.map(m => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            <div className="msg-avatar">{m.role === 'bot' ? '🤖' : '👤'}</div>
            <div className="msg-bubble">
              {m.isTyping
                ? <div className="typing-dots"><span/><span/><span/></div>
                : <span dangerouslySetInnerHTML={{ __html: markdownToHtml(m.text) }} />
              }
            </div>
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div className="chat-quick-prompts" id="chat-quick-prompts">
        {[
          ['💰 Balance', "What is my balance?"],
          ['📊 Budget',  "Show budget plan"],
          ['🏆 Top Spend',"Top spending categories"],
          ['📅 Monthly', "Monthly insights"],
          ['🔍 Insights', "Financial insights"],
        ].map(([label, msg]) => (
          <button key={label} className="quick-prompt" onClick={() => handleQuick(msg)}>{label}</button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          className="chat-input"
          id="chat-input"
          type="text"
          ref={inputRef}
          placeholder='Ask FinBot… e.g. "Add expense ₹500 food"'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button className="chat-send" id="chat-send-btn" onClick={handleSend} aria-label="Send" disabled={sending}>
          ➤
        </button>
      </div>
    </div>
  );
}
