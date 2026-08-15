import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ollama-active-model';

export function useModelStorage(): [string, (model: string) => void] {
  const [model, setModelState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? '';
    } catch (error) {
      console.warn('Failed to read model from localStorage:', error);
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, model);
    } catch (error) {
      console.warn('Failed to save model to localStorage:', error);
    }
  }, [model]);

  return [model, setModelState];
}
