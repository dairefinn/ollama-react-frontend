import { useState, useEffect, useCallback } from 'react';
import { ConversationMeta } from '../models/conversation-meta.model';
import { readStorageFile, writeStorageFile, deleteStorageFile } from './fs-storage';

const INDEX_FILE = 'conversations/index.json';

export function useConversations(): {
  conversations: ConversationMeta[];
  upsertConversation: (meta: ConversationMeta) => void;
  deleteConversation: (id: string) => void;
} {
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);

  useEffect(() => {
    readStorageFile(INDEX_FILE).then(content => {
      if (!content) return;
      try {
        const parsed = JSON.parse(content) as ConversationMeta[];
        if (Array.isArray(parsed)) setConversations(parsed);
      } catch {
        // ignore corrupt index
      }
    });
  }, []);

  const saveIndex = useCallback((list: ConversationMeta[]) => {
    writeStorageFile(INDEX_FILE, JSON.stringify(list));
  }, []);

  const upsertConversation = useCallback((meta: ConversationMeta) => {
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === meta.id);
      const next = idx >= 0
        ? prev.map((c, i) => i === idx ? meta : c)
        : [meta, ...prev];
      saveIndex(next);
      return next;
    });
  }, [saveIndex]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      saveIndex(next);
      return next;
    });
    deleteStorageFile(`conversations/${id}.json`);
  }, [saveIndex]);

  return { conversations, upsertConversation, deleteConversation };
}
