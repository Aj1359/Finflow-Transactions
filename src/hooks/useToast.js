import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'info', icon = '') => {
    const id = Date.now() + Math.random();
    const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
    setToasts(prev => [...prev, { id, msg, type, icon: icon || icons[type] }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  return { toasts, toast };
}
