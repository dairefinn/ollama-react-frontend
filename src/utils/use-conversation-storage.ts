import { useState, useEffect, useCallback } from 'react';
import { OllamaConversation } from '../models/ollama-conversation.model';
import { OllamaMessage } from '../models/ollama-message.model';
import { readStorageFile, writeStorageFile } from './fs-storage';

export function useConversationStorage(id: string): [
  OllamaConversation,
  (conversation: OllamaConversation) => void,
  () => void,
] {
  const [conversation, setConversationState] = useState<OllamaConversation>(new OllamaConversation());
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [id, reloadKey]);

  const setConversation = (newConversation: OllamaConversation) => {
    setConversationState(newConversation);
    if (id) {
      writeStorageFile(`conversations/${id}.json`, JSON.stringify(newConversation));
    }
  };

  const reload = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  return [conversation, setConversation, reload];
}
