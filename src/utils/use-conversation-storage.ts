import { useState, useEffect } from 'react';
import { OllamaConversation } from '../models/ollama-conversation.model';
import { OllamaMessage } from '../models/ollama-message.model';
import { readStorageFile, writeStorageFile } from './fs-storage';

export function useConversationStorage(id: string): [OllamaConversation, (conversation: OllamaConversation) => void] {
  const [conversation, setConversationState] = useState<OllamaConversation>(new OllamaConversation());

  useEffect(() => {
    if (!id) return;
    setConversationState(new OllamaConversation());
    readStorageFile(`conversations/${id}.json`).then(content => {
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
  }, [id]);

  const setConversation = (newConversation: OllamaConversation) => {
    setConversationState(newConversation);
    if (id) {
      writeStorageFile(`conversations/${id}.json`, JSON.stringify(newConversation));
    }
  };

  return [conversation, setConversation];
}
