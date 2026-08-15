import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ollama-message-context';

export function useMessageContext(): [string, (context: string) => void] {
  const [messageContext, setMessageContextState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? 'Current time: {{timestamp}}';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, messageContext);
    } catch {
      // ignore
    }
  }, [messageContext]);

  return [messageContext, setMessageContextState];
}
