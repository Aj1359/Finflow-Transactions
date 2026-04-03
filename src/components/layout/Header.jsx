import { useStore } from '../../store/useFinFlowStore';

const SECTION_META = {
  dashboard:    ['Dashboard',    'Your financial overview at a glance'],
  transactions: ['Transactions', 'Manage and explore your financial records'],
  insights:     ['Insights',     'Understanding your spending patterns'],
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
      <button className="menu-toggle" id="menu-toggle" aria-label="Open menu" onClick={onOpenSidebar}>
        ☰
      </button>

      <div className="header-title">
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>

      <div className="header-controls">
        {/* Role Switcher */}
        <div className="role-select-wrap">
          <label htmlFor="role-select">Role:</label>
          <select
            id="role-select"
            className="role-select"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="admin">👑 Admin</option>
            <option value="viewer">👁 Viewer</option>
          </select>
        </div>

        {/* Dark/Light Toggle */}
        <button className="btn-icon" id="theme-btn" title="Toggle theme" aria-label="Toggle theme" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
