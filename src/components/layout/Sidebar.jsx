import { useStore } from '../../store/useFinFlowStore';
import { Home, CreditCard, BarChart2, Shield, Save, Target, Bot } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Sidebar({ open, chatOpen, onToggleChat, onCloseSidebar }) {
  const { state, navigate, setRole } = useStore();
  const { activeSection, role } = state;

  const handleNav = (sec) => {
    navigate(sec);
    if (onCloseSidebar) onCloseSidebar();
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Logo size={28} theme={state.theme} />
        </div>
        <div>
          <div className="logo-text">FinFlow</div>
          <div className="logo-sub">ENTERPRISE FINANCE</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>

        {[
          { sec: 'dashboard',    icon: <Home size={18} />, label: 'Dashboard' },
          { sec: 'transactions', icon: <CreditCard size={18} />, label: 'Transactions' },
          { sec: 'insights',     icon: <BarChart2 size={18} />, label: 'Insights' },
          { sec: 'budget',       icon: <Target size={18} />, label: 'Budget' },
        ].map(({ sec, icon, label }) => (
          <div
            key={sec}
            className={`nav-item${activeSection === sec ? ' active' : ''}`}
            onClick={() => handleNav(sec)}
          >
            <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </span>
            <span className="nav-label">{label}</span>
          </div>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>Quick Info</div>

        <div className="nav-item" style={{ cursor: 'default', opacity: 0.7 }}>
          <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} /></span>
          <span className="nav-label">Balance Guard</span>
          <span className="nav-badge">ON</span>
        </div>

        <div className="nav-item" style={{ cursor: 'default', opacity: 0.7 }}>
          <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Save size={18} /></span>
          <span className="nav-label">Auto-Save</span>
          <span className="nav-badge">LS</span>
        </div>

        <div className="nav-section-label" style={{ marginTop: 8 }}>AI Assistant</div>

        <div className="nav-item" id="nav-finbot" onClick={onToggleChat}>
          <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
          </span>
          <span className="nav-label">FinBot AI</span>
          <span className="badge-new">RAG</span>
        </div>
      </nav>

      {/* Role Badge */}
      <div className="sidebar-footer">
        <div className="role-badge-sidebar">
          <div
            className="role-dot"
            style={{
               background: role === 'admin' ? 'var(--accent-green)' : 'var(--accent-yellow)',
               boxShadow: role === 'admin' ? '0 0 6px var(--accent-green)' : '0 0 6px var(--accent-yellow)',
               width: 10, height: 10, borderRadius: '50%'
            }}
          />
          <div>
            <div className="role-name">{role === 'admin' ? 'Administrator' : 'Viewer'}</div>
            <div className="role-desc">{role === 'admin' ? 'Full access' : 'Read-only'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
