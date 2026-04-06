# 💎 FinFlow — Enterprise AI Finance Dashboard

**FinFlow** is an ultra-premium, AI-powered financial management platform designed for modern users and enterprises. It combines **intelligent insights, real-time analytics, and a stunning UI** to deliver a seamless financial tracking experience.

---

## 🚀 Live Highlights

- ⚡ Blazing fast UI powered by React + Vite  
- 🧠 AI-powered assistant (**FinBot**) with Gemini integration  
- 📊 Interactive financial analytics & charts  
- 🔐 Secure and role-based financial management  
- 🌐 Fully responsive (desktop + mobile)  

---

## ✨ Features

### 🎨 Ultra-Premium UI/UX
- Glassmorphic design with smooth animations  
- Dark / Light mode toggle (OLED optimized)  
- Fully responsive layout with adaptive navigation  

### 🧠 FinBot — AI Financial Assistant
- RAG-based intelligent responses using transaction data  
- Gemini AI integration for advanced reasoning  
- Offline fallback (regex-based engine)  
- Natural language commands:
  - “Add ₹500 groceries”
  - “Show my top spending category”

### 📊 Data Visualization
- Balance trends (Line charts)  
- Category breakdown (Donut charts)  
- Monthly comparisons (Bar charts)  
- Real-time financial health gauge  

### 🛡️ Security & Logic
- Role-based access (**Admin / Viewer**)  
- Balance validation system  
- Risk alerts for overspending  

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite  
- **Charts**: Chart.js  
- **State Management**: Context API + Reducer  
- **AI Integration**: Gemini API (Google AI Studio)  
- **Storage**: LocalStorage (offline-first design)  

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Aj1359/Finflow-Transactions.git
cd Finflow-Transactions
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables (IMPORTANT 🔑)

Create a `.env` file in the root directory and add your **Gemini API Key**:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

👉 Get your API key from: https://aistudio.google.com/apikey

---

### 4️⃣ Run the App

```bash
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## 📁 Project Structure

```bash
src/
├── components/
│   ├── charts/
│   ├── dashboard/
│   ├── layout/
│   └── transactions/
├── config/
├── hooks/
├── lib/
├── pages/
└── store/
```

---

##  Architecture Highlights

- Modular component-based design  
- Scalable state management without Redux overhead  
- AI abstraction layer (Gemini + fallback engine)  
- Offline-first persistence strategy  

---

##  Assignment Compliance

- ✔ Premium UI with animations & theming  
- ✔ Fully migrated to React architecture  
- ✔ AI chatbot with RAG pipeline  
- ✔ Persistent storage (LocalStorage)  
- ✔ Financial validations & logic  
- ✔ Fully responsive design  

---

##  Developer

**Aditya Jha**  
B.Tech Student | FinTech Society Coordinator | Builder  

---

##  Future Enhancements

- Cloud sync (Firebase / Supabase)  
- Multi-user collaboration  
- Advanced predictive analytics  
- Voice-enabled FinBot  

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---