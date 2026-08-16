import { useState, useEffect } from 'react';
import { OllamaConversation } from '../models/ollama-conversation.model';
import { OllamaMessage } from '../models/ollama-message.model';
import { readStorageFile, writeStorageFile } from './fs-storage';

export function useConversationStorage(): [OllamaConversation, (conversation: OllamaConversation) => void] {
  const [conversation, setConversationState] = useState<OllamaConversation>(new OllamaConversation());

  useEffect(() => {
    readStorageFile('conversation.json').then(content => {
      if (!content) return;
      try {
        const parsed = JSON.parse(content) as { messages: OllamaMessage[] };
        if (Array.isArray(parsed.messages)) {
          setConversationState(new OllamaConversation(parsed.messages));
        }
      } catch {
        // ignore corrupt file
      }
    });
  }, []);

  const setConversation = (newConversation: OllamaConversation) => {
    setConversationState(newConversation);
    writeStorageFile('conversation.json', JSON.stringify(newConversation));
  };

  return [conversation, setConversation];
}
