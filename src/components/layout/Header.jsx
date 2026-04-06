import { useStore } from '../../store/useFinFlowStore';
import { Sun, Moon } from 'lucide-react';

const SECTION_META = {
  dashboard:    ['Business Analytics', 'Comprehensive financial performance overview'],
  transactions: ['Ledger Manager',    'In-depth review of financial records'],
  insights:     ['Market Intelligence', 'Strategic spending patterns and trends'],
  budget:       ['Capital Allocation', 'Optimization and limit management'],
};

export default function Header({ onOpenSidebar }) {
  const { state, setRole, setTheme } = useStore();
  const { role, theme, activeSection } = state;
  const [title, subtitle] = SECTION_META[activeSection] || ['Dashboard', ''];

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" id="menu-toggle" aria-label="Open menu" onClick={onOpenSidebar}>
          ☰
        </button>
        <div className="header-brand-mobile">
          <span className="brand-dot" />
          <span className="brand-name">FinFlow</span>
        </div>
      </div>

      <div className="header-title desktop-only">
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>

      <div className="header-controls">
        <select
          id="role-select"
          className="role-select-pill"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>

        <button className="theme-toggle-compact" id="theme-btn" title="Toggle theme" aria-label="Toggle theme" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
