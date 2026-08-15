import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ollama-system-context';

export function useSystemContext(): [string, (context: string) => void] {
  const [systemContext, setSystemContextState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, systemContext);
    } catch {
      // ignore
    }
  }, [systemContext]);

  return [systemContext, setSystemContextState];
}
