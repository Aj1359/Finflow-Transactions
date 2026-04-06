import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '../../store/useFinFlowStore';
import ChatBubble from '../chatbot/ChatBubble';
import ChatPanel from '../chatbot/ChatPanel';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { state } = useStore();

  const openSidebar  = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleChat   = () => setChatOpen(v => !v);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`overlay-bg${sidebarOpen ? ' open' : ''}`}
        onClick={closeSidebar}
      />

      <div className="app-layout">
        {/* Sidebar */}
        <Sidebar 
          onToggleChat={toggleChat} 
          onCloseSidebar={closeSidebar} 
        />

        {/* Main */}
        <div className="main-wrap">
          <Header onOpenSidebar={openSidebar} />
          <main className="content">
            {children}
          </main>
        </div>
      </div>

      {/* Chatbot */}
      <ChatBubble open={chatOpen} onToggle={toggleChat} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}


