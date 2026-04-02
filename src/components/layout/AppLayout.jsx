/* ═══════════════════════════════════════════════════════════
   FinFlow — App Layout  |  src/components/layout/AppLayout.jsx
   ═══════════════════════════════════════════════════════════ */

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '../../store/useFinFlowStore';
import ChatBubble from '../chatbot/ChatBubble';
import ChatPanel from '../chatbot/ChatPanel';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { state } = useStore();

  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleChat   = () => setChatOpen(v => !v);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`overlay-bg${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
      />

      <div className="app-layout">
        {/* Sidebar */}
        <div className={sidebarOpen ? 'sidebar open' : ''} style={{ display: 'contents' }}>
          <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
            <SidebarInner onToggleChat={toggleChat} onCloseSidebar={closeSidebar} />
          </aside>
        </div>

        {/* Main */}
        <div className="main-wrap">
          <Header onOpenSidebar={openSidebar} />
          <main className="content">
            {children}
          </main>
        </div>
      </div>

      {/* Chatbot */}
      <ChatBubble open={chatOpen} onToggle={toggleChat} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

// Inner sidebar content extracted to avoid duplication
function SidebarInner({ onToggleChat, onCloseSidebar }) {
  const { state, navigate } = useStore();
  const { activeSection, role } = state;

  const handleNav = (sec) => {
    navigate(sec);
    if (window.innerWidth <= 768) onCloseSidebar();
  };

  return (
    <>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="28" height="28" viewBox="0 0 100 100" style={{ borderRadius: 8, boxShadow: '0 4px 10px rgba(168,85,247,0.4)' }}>
            <defs>
              <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2a0d45" />
                <stop offset="100%" stopColor="#0b0318" />
              </linearGradient>
              <linearGradient id="arrowGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="22" fill="url(#bgGrad2)" />
            <path d="M 15 70 C 10 95 60 90 70 60 C 78 40 85 20 85 20" fill="none" stroke="url(#arrowGrad2)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 88 15 L 65 25 L 80 40 Z" fill="#ffffff" />
          </svg>
        </div>
        <div>
          <div className="logo-text">FinFlow</div>
          <div className="logo-sub">ENTERPRISE FINANCE</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {[
          { sec: 'dashboard',    icon: '🏠', label: 'Dashboard' },
          { sec: 'transactions', icon: '💳', label: 'Transactions' },
          { sec: 'insights',     icon: '📊', label: 'Insights' },
        ].map(({ sec, icon, label }) => (
          <div
            key={sec}
            className={`nav-item${activeSection === sec ? ' active' : ''}`}
            onClick={() => handleNav(sec)}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </div>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>Quick Info</div>
        <div className="nav-item" style={{ cursor: 'default', opacity: 0.7 }}>
          <span className="nav-icon">🛡</span>
          <span className="nav-label">Balance Guard</span>
          <span className="nav-badge">ON</span>
        </div>
        <div className="nav-item" style={{ cursor: 'default', opacity: 0.7 }}>
          <span className="nav-icon">💾</span>
          <span className="nav-label">Auto-Save</span>
          <span className="nav-badge">LS</span>
        </div>

        <div className="nav-section-label" style={{ marginTop: 8 }}>AI Assistant</div>
        <div className="nav-item" id="nav-finbot" onClick={onToggleChat}>
          <span className="nav-icon">🤖</span>
          <span className="nav-label">FinBot AI</span>
          <span className="badge-new">RAG</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="role-badge-sidebar">
          <div className="role-dot" style={{
            background: role === 'admin' ? 'var(--accent-green)' : 'var(--accent-yellow)',
            boxShadow: role === 'admin' ? '0 0 6px var(--accent-green)' : '0 0 6px var(--accent-yellow)',
          }} />
          <div>
            <div className="role-name">{role === 'admin' ? 'Administrator' : 'Viewer'}</div>
            <div className="role-desc">{role === 'admin' ? 'Full access' : 'Read-only'}</div>
          </div>
        </div>
      </div>
    </>
  );
}
