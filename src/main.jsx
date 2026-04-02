/* ═══════════════════════════════════════════════════════════
   FinFlow — Entry Point  |  src/main.jsx
   ═══════════════════════════════════════════════════════════ */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FinFlowProvider } from './store/useFinFlowStore.jsx'
import FINFLOW_CONFIG from './config/finflow.config.js'

// Expose config globally for chatbot engine
window.FINFLOW_CONFIG = FINFLOW_CONFIG;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FinFlowProvider>
      <App />
    </FinFlowProvider>
  </StrictMode>,
)
