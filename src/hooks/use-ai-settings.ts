/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

export function useAISettings() {
  const [useAI, setUseAI] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const stored = localStorage.getItem('orbitsync-use-ai');
    if (stored === 'true') {
      setUseAI(true);
    }

    const handleStorageChange = () => {
      const storedVal = localStorage.getItem('orbitsync-use-ai');
      setUseAI(storedVal === 'true');
    };

    window.addEventListener('ai-settings-changed', handleStorageChange);
    return () => window.removeEventListener('ai-settings-changed', handleStorageChange);
  }, []);

  const toggleAI = (value: boolean) => {
    setUseAI(value);
    localStorage.setItem('orbitsync-use-ai', String(value));
    window.dispatchEvent(new Event('ai-settings-changed'));
  };

  return {
    useAI,
    toggleAI,
    isMounted,
  };
}
