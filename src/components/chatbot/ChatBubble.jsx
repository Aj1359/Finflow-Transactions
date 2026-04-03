

import { useEffect, useState } from 'react';

export default function ChatBubble({ open, onToggle }) {
  const [showUnread, setShowUnread] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) setShowUnread(true); }, 2000);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    setShowUnread(false);
    onToggle();
  };

  return (
    <button className={`chat-bubble${open ? ' open' : ''}`} id="chat-bubble" onClick={handleClick} aria-label="Open FinBot AI">
      🤖
      {showUnread && !open && (
        <span className="chat-unread" id="chat-unread">1</span>
      )}
    </button>
  );
}
