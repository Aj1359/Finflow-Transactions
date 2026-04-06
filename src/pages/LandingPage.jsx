import React, { useState } from 'react';
import { useStore } from '../store/useFinFlowStore';
import { Shield, Eye } from 'lucide-react';
import Logo from '../components/ui/Logo';
import './LandingPage.css';

export default function LandingPage({ onEnter }) {
  const { state, setRole, setTheme } = useStore();
  const { theme } = state;

  React.useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const handleEnter = (role) => {
    setRole(role);
    onEnter();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="landing-container" data-theme={theme}>
      <div className="landing-top-bar">
        <button className="theme-toggle-btn-premium" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <span className="icon-sun">☀️</span> : <span className="icon-moon">🌙</span>}
          <span className="toggle-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
      <div className="landing-bg">
        <div className="grid-3d"></div>
        <div className="floating-sphere"></div>
      </div>

      <main className="landing-content">
        <div className="landing-hero">
          <div className="logo-executive">
            <Logo size={120} theme={theme} />
          </div>
          
          <h1 className="executive-title">FinFlow</h1>
          <p className="executive-tagline">ENTERPRISE-GRADE AI FINANCIAL INTELLIGENCE</p>
        </div>

        <div className="executive-entries">
          <div className="entry-card" onClick={() => handleEnter('admin')}>
            <div className="entry-icon shield-glow"><Shield size={32} color="var(--accent-blue)" /></div>
            <div className="entry-text">
              <h3>Admin Entry</h3>
              <p>Full control over accounts & analytics</p>
            </div>
          </div>

          <div className="entry-card" onClick={() => handleEnter('viewer')}>
            <div className="entry-icon eye-glow"><Eye size={32} color="var(--accent-purple)" /></div>
            <div className="entry-text">
              <h3>Viewer Entry</h3>
              <p>Real-time monitoring & insights only</p>
            </div>
          </div>
        </div>

        <div className="landing-footer-minimal">
          © 2026 FinFlow AI. Precision in every transaction.
        </div>
      </main>
    </div>
  );
}
