import React from 'react';

export default function Logo({ size = 32, theme = 'light' }) {
  const isDark = theme === 'dark';
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 12px rgba(124, 58, 237, 0.3))' }}>
      <defs>
        <linearGradient id="purpleLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c1d95" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Premium Purple Box */}
      <rect width="100" height="100" rx="28" fill="url(#purpleLogoGrad)" />
      
      {/* Modern Glassy Shine */}
      <path d="M 10 10 L 90 10 L 90 40 C 90 40 50 60 10 40 Z" fill="rgba(255,255,255,0.15)" />

      {/* Dynamic Evolution Path */}
      <path 
        d="M 25 75 C 25 85 75 80 80 40 C 82 25 85 15 85 15" 
        fill="none" 
        stroke="url(#goldGrad)" 
        strokeWidth="9" 
        strokeLinecap="round" 
        filter="url(#logoGlow)" 
      />
      {/* Precision Arrowhead */}
      <path d="M 85 12 L 70 20 L 80 30 Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}
