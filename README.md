# 💎 FinFlow — Enterprise AI Finance Dashboard

**FinFlow** is an ultra-premium, agentic financial management platform designed for the modern enterprise. Built with a focus on visual excellence, data integrity, and AI-driven insights, it provides users with a comprehensive view of their financial health through a sleek, responsive interface.

[![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://aistudio.google.com/)

---

## ✨ Key Features

### 🚀 Ultra-Premium UI/UX
- **Modern Aesthetics**: A glassmorphic design system with vibrant gradients, subtle micro-animations, and custom typography.
- **Dynamic Theming**: Seamless switching between **Dark Mode** (OLED optimized) and **Light Mode**.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile with a custom tray-based navigation.

### 🧠 FinBot — AI Financial Assistant
- **RAG Architecture**: Retrieval-Augmented Generation that allows the AI to "read" your local transaction data for personalized advice.
- **Dual Engine**:
    - **Gemini AI**: High-reasoning AI for complex natural language queries and predictive analysis.
    - **Local Fallback**: A proprietary regex-based engine ensuring functionality even without an internet connection or API key.
- **Natural Language Actions**: "Add 500 for groceries", "Spent 2k on fuel", "What's my top spending?"

### 📊 Advanced Data Visualization
- **Live Spending Gauge**: Real-time SVG health monitoring (Safe < 50%, Caution 50-75%, High Risk > 75%).
- **Interactive Charts**:
    - **Balance Trend**: Line chart tracking income vs. expenses over time.
    - **Category Breakdown**: Donut chart showing distribution of wealth.
    - **Monthly Comparison**: Bar charts comparing growth month-over-month.

### 🛡️ Secure Financial Management
- **Role-Based Access (RBAC)**: Switch between **Admin** (Full control) and **Viewer** (Read-only) modes.
- **Balance Guard**: Intelligent validation preventing users from adding expenses that exceed their total balance.
- **Red Zone Alerts**: Safety confirmation prompts when adding a transaction would push spending into the "High Risk" territory.

---

## 🛠️ Technical Architecture

- **Framework**: React 18 with Vite for lightning-fast HMR and build performance.
- **State Management**: Zero-dependency **Context + Reducer** pattern, mirroring the scalability of Redux without the boilerplate.
- **Persistence**: Hybrid approach using `localStorage` for zero-latency data recovery and offline reliability.
- **Modularity**: 20+ atomic components organized by domain (`dashboard`, `charts`, `transactions`, `insights`, `chatbot`).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or later)
- NPM or Yarn

### Installation

1. **Clone & Navigate**
   ```bash
   cd "New folder"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up AI (Optional)**
   - Open `src/config/finflow.config.js` or use the in-app FinBot settings to add your **Gemini API Key**.
   - Get a free key at [Google AI Studio](https://aistudio.google.com/apikey).

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   *Access the app at [http://localhost:5173](http://localhost:5173)*

---

## 📁 Project Structure

```bash
src/
├── components/          # Domain-specific UI components
│   ├── charts/          # Chart.js implementations
│   ├── dashboard/       # Summary cards, Gauge, Recent lists
│   ├── layout/          # Sidebar, Header, AppLayout
│   └── transactions/    # Table, Modals
├── config/              # Centralized configuration
├── hooks/               # Custom hooks (useToast, etc.)
├── lib/                 # Core logic, constants, and AI engine
├── pages/               # Top-level page composers
└── store/               # Global state (Context + Reducer)
```

---

## 🏆 Assignment Compliance

- [x] **Ultra-Premium UI**: Glassmorphism, animations, and dark mode implemented.
- [x] **React Migration**: Fully refactored from vanilla JS to a modular React architecture.
- [x] **AI Integration**: RAG-based chatbot with Gemini API support.
- [x] **Persistence**: Full data recovery on page refresh via LocalStorage.
- [x] **Financial Logic**: Balance validation, health gauge, and role-based security.
- [x] **Responsive Design**: Mobile-first navigation logic.

---

*Developed for the FinFlow Professionalization & React Migration Assignment.* 🚀
