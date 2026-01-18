import { useState, useEffect } from 'react';
import { OllamaSupportedModel } from '../models/ollama-supported-model.model';

const STORAGE_KEY = 'ollama-active-model';

export function useModelStorage(): [OllamaSupportedModel, (model: OllamaSupportedModel) => void] {
  // Initialize state with value from localStorage or default
  const [model, setModelState] = useState<OllamaSupportedModel>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.values(OllamaSupportedModel).includes(stored as OllamaSupportedModel)) {
        return stored as OllamaSupportedModel;
      }
    } catch (error) {
      console.warn('Failed to read model from localStorage:', error);
    }
    return OllamaSupportedModel.DeepseekR1;
  });

  // Save to localStorage whenever model changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, model);
    } catch (error) {
      console.warn('Failed to save model to localStorage:', error);
    }
  }, [model]);

  // Wrapper function to update model
  const setModel = (newModel: OllamaSupportedModel) => {
    setModelState(newModel);
  };

  return [model, setModel];
}
