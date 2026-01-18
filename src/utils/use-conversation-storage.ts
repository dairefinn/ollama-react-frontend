import { useState, useEffect } from 'react';
import { OllamaConversation } from '../models/ollama-conversation.model';
import { OllamaMessage } from '../models/ollama-message.model';

const STORAGE_KEY = 'ollama-latest-chat';

export function useConversationStorage(): [OllamaConversation, (conversation: OllamaConversation) => void] {
  // Initialize state with value from localStorage or empty conversation
  const [conversation, setConversationState] = useState<OllamaConversation>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { messages: OllamaMessage[] };
        if (parsed && Array.isArray(parsed.messages)) {
          return new OllamaConversation(parsed.messages);
        }
      }
    } catch (error) {
      console.warn('Failed to read conversation from localStorage:', error);
    }
    return new OllamaConversation();
  });

  // Save to localStorage whenever conversation changes
  useEffect(() => {
    try {
      // Only save if there are messages
      if (conversation.messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
      } else {
        // Clear storage if conversation is empty
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save conversation to localStorage:', error);
    }
  }, [conversation]);

  // Wrapper function to update conversation
  const setConversation = (newConversation: OllamaConversation) => {
    setConversationState(newConversation);
  };

  return [conversation, setConversation];
}
