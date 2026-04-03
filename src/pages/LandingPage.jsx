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
    <div className="landing-container">
      <div className="landing-bg">
        <div className="grid-3d"></div>
        <div className="floating-elements">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5
            }}></div>
          ))}
        </div>
      </div>

      <header className="landing-header">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="landing-content">
        <div className="logo-3d-wrap">
          <div className="logo-3d">
            <svg width="120" height="120" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 15px 35px rgba(168,85,247,0.6))' }}>
              <defs>
                <linearGradient id="landingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2a0d45" />
                  <stop offset="100%" stopColor="#0b0318" />
                </linearGradient>
                <linearGradient id="landingArrow" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="22" fill="url(#landingGrad)" />
              <path d="M 15 70 C 10 95 60 90 70 60 C 78 40 85 20 85 20" fill="none" stroke="url(#landingArrow)" strokeWidth="12" strokeLinecap="round" />
              <path d="M 88 15 L 65 25 L 80 40 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        <div className="hero-text">
          <h1 className="landing-title">FinFlow</h1>
          <p className="landing-subtitle">Enterprise-Grade AI Financial Intelligence</p>
        </div>

        <div className="role-selection">
          <button className="role-card admin" onClick={() => handleEnter('admin')}>
            <div className="role-icon">🛡️</div>
            <div className="role-info">
              <h3>Admin Entry</h3>
              <p>Full control over accounts & analytics</p>
            </div>
            <div className="enter-arrow">→</div>
          </button>

          <button className="role-card viewer" onClick={() => handleEnter('viewer')}>
            <div className="role-icon">👁️</div>
            <div className="role-info">
              <h3>Viewer Entry</h3>
              <p>Real-time monitoring & insights only</p>
            </div>
            <div className="enter-arrow">→</div>
          </button>
        </div>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2026 FinFlow AI. Precision in every transaction.</p>
      </footer>
    </div>
  );
}
