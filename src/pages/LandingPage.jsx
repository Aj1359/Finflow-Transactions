import React, { useState } from 'react';
import { useStore } from '../store/useFinFlowStore';
import './LandingPage.css';

export default function LandingPage({ onEnter }) {
  const { state, setRole, setTheme } = useStore();
  const { theme } = state;

  const handleEnter = (role) => {
    setRole(role);
    onEnter();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="landing-container" data-theme="dark">
      <div className="landing-bg">
        <div className="grid-3d"></div>
        <div className="floating-sphere"></div>
      </div>

      <main className="landing-content">
        <div className="landing-hero">
          <div className="logo-executive">
            <svg width="140" height="140" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="execGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-purple)" />
                  <stop offset="100%" stopColor="var(--accent-yellow)" />
                </linearGradient>
                <filter id="execGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="100" height="100" rx="30" fill="#0c0c12" stroke="url(#execGrad)" strokeWidth="2" />
              <path d="M 25 70 C 20 90 65 85 75 55 C 82 35 88 15 88 15" fill="none" stroke="url(#execGrad)" strokeWidth="10" strokeLinecap="round" filter="url(#execGlow)" />
              <path d="M 92 10 L 70 20 L 85 35 Z" fill="var(--accent-yellow)" />
            </svg>
          </div>
          
          <h1 className="executive-title">FinFlow</h1>
          <p className="executive-tagline">ENTERPRISE-GRADE AI FINANCIAL INTELLIGENCE</p>
        </div>

        <div className="executive-entries">
          <div className="entry-card" onClick={() => handleEnter('admin')}>
            <div className="entry-icon shield-glow">🛡️</div>
            <div className="entry-text">
              <h3>Admin Entry</h3>
              <p>Full control over accounts & analytics</p>
            </div>
          </div>

          <div className="entry-card" onClick={() => handleEnter('viewer')}>
            <div className="entry-icon eye-glow">👁️</div>
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
