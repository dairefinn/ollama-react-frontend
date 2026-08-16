import './ConversationList.css';

import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { ConversationMeta } from '../../models/conversation-meta.model';

type Props = {
  conversations: ConversationMeta[];
  currentId: string | undefined;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function ConversationList({ conversations, currentId, onNew, onSelect, onDelete }: Props) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="conversation-list">
      <button className="conversation-list-new" onClick={onNew}>
        <PlusIcon size={16} />
        New Chat
      </button>
      <div className="conversation-list-items">
        {sorted.map(conv => (
          <div
            key={conv.id}
            className={`conversation-list-item${conv.id === currentId ? ' active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <span className="conversation-list-title">{conv.title}</span>
            <button
              className="conversation-list-delete"
              onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
              title="Delete conversation"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConversationList;
