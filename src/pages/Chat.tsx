import './Chat.css';

import { JSX, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DownloadSimpleIcon, StopIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { OllamaConversation } from "../models/ollama-conversation.model";
import { OllamaMessage, OllamaToolCall } from "../models/ollama-message.model";

import Conversation, { ConversationEventType } from "../components/Conversation/Conversation";
import ConversationList from "../components/ConversationList/ConversationList";
import { useModelStorage } from "../utils/use-model-storage";
import { useConversationStorage } from "../utils/use-conversation-storage";
import { useConversations } from "../utils/use-conversations";
import { useAvailableModels } from "../utils/use-available-models";
import { useSystemContext } from "../utils/use-system-context";
import { useMessageContext } from "../utils/use-message-context";
import { resolveContextVariables } from "../utils/resolve-context-variables";
import { getToolDefinitions } from "../tools/built-in-tools";
import { useFsPermission } from "../utils/use-fs-permission";
import { writeStorageFile } from "../utils/fs-storage";

type AgentStatus = { status: 'idle' | 'running' | 'done' | 'error' | 'aborted'; eventCount: number; partial: string | null };

function ChatPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/chat/' + crypto.randomUUID(), { replace: true });
    }
  }, [id, navigate]);

  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useModelStorage();
  const [savedConversation, setSavedConversation, reloadConversation] = useConversationStorage(id ?? '');
  const { conversations, upsertConversation, deleteConversation } = useConversations();
  const { models, loading: modelsLoading } = useAvailableModels();
  const [systemContext] = useSystemContext();
  const [messageContext] = useMessageContext();
  const [fsPermission] = useFsPermission();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live conversation state built from SSE events (null = show savedConversation)
  const [streamConversation, setStreamConversation] = useState<OllamaConversation | null>(null);
  const liveConvRef = useRef<OllamaConversation>(new OllamaConversation());
  const sseRef = useRef<EventSource | null>(null);

  // Think-tag state: track per assistant message to avoid re-renders mid-think
  const thinkRef = useRef({ seen: false, processed: false });

  const conversation = streamConversation ?? savedConversation;

  useEffect(() => {
    if (models.length > 0 && !models.includes(model)) {
      setModel(models[0]);
    }
  }, [models, model, setModel]);

  // On mount or id change: check if agent is already running, reconnect if so
  useEffect(() => {
    if (!id) return;
    setStreamConversation(null);
    sseRef.current?.close();
    sseRef.current = null;

    const checkAndReconnect = async () => {
      try {
        const agentStatus = await fetch(`/api/agent/status/${encodeURIComponent(id)}`).then(r => r.json() as Promise<AgentStatus>);
        if (agentStatus.status !== 'running') return;

        // Load the current saved conversation directly from disk
        const fsDataRes = await fetch('/api/fs/data-dir').then(r => r.json() as Promise<{ path: string }>);
        const convPath = `${fsDataRes.path}/conversations/${id}.json`;
        const convRes = await fetch(`/api/fs/read?path=${encodeURIComponent(convPath)}`);
        let baseMessages: OllamaMessage[] = [];
        if (convRes.ok) {
          const { content } = await convRes.json() as { content: string };
          try {
            const parsed = JSON.parse(content) as { messages: OllamaMessage[] };
            if (Array.isArray(parsed.messages)) baseMessages = parsed.messages;
          } catch { /* ignore */ }
        }

        // Seed live state: saved messages + in-progress partial (if any)
        const liveMessages = [...baseMessages];
        if (agentStatus.partial !== null) {
          liveMessages.push(new OllamaMessage(agentStatus.partial, 'assistant'));
        }
        const liveConv = new OllamaConversation(liveMessages);
        liveConvRef.current = liveConv;
        setStreamConversation(new OllamaConversation(liveMessages));
        reloadConversation();
        setLoading(true);
        openSseStream(agentStatus.eventCount);
      } catch { /* Vite server not ready or no session */ }
    };

    void checkAndReconnect();

    return () => {
      sseRef.current?.close();
      sseRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function openSseStream(since: number): void {
    if (!id) return;
    const source = new EventSource(`/api/agent/stream/${encodeURIComponent(id)}?since=${since}`);
    sseRef.current = source;

    source.addEventListener('assistant_start', () => {
      thinkRef.current = { seen: false, processed: false };
      liveConvRef.current.addMessage(new OllamaMessage('', 'assistant'));
      setStreamConversation(new OllamaConversation(liveConvRef.current.messages));
    });

    source.addEventListener('chunk', (e: MessageEvent<string>) => {
      const { content } = JSON.parse(e.data) as { content: string };
      if (content.includes('<think>')) thinkRef.current.seen = true;
      if (!thinkRef.current.processed && content.includes('</think>')) thinkRef.current.processed = true;
      liveConvRef.current.appendToLatestMessage(content);
      if (thinkRef.current.processed || !thinkRef.current.seen) {
        setStreamConversation(new OllamaConversation(liveConvRef.current.messages));
      }
    });

    source.addEventListener('tool_call', (e: MessageEvent<string>) => {
      const calls = JSON.parse(e.data) as OllamaToolCall[];
      liveConvRef.current.latestMessage.tool_calls = calls;
      setStreamConversation(new OllamaConversation(liveConvRef.current.messages));
    });

    source.addEventListener('message_complete', (e: MessageEvent<string>) => {
      const msg = JSON.parse(e.data) as { content: string; tool_calls?: OllamaToolCall[] };
      liveConvRef.current.latestMessage.content = msg.content;
      liveConvRef.current.latestMessage.tool_calls = msg.tool_calls;
      setStreamConversation(new OllamaConversation(liveConvRef.current.messages));
    });

    source.addEventListener('tool_result', (e: MessageEvent<string>) => {
      const { result } = JSON.parse(e.data) as { name: string; result: string };
      liveConvRef.current.addMessage(new OllamaMessage(result, 'tool'));
      setStreamConversation(new OllamaConversation(liveConvRef.current.messages));
    });

    source.addEventListener('done', () => {
      source.close();
      sseRef.current = null;
      setLoading(false);
      setStreamConversation(null);
      reloadConversation();
      if (textareaRef.current) textareaRef.current.focus();
    });

    source.addEventListener('error', (e: MessageEvent<string>) => {
      source.close();
      sseRef.current = null;
      setLoading(false);
      setStreamConversation(null);
      reloadConversation();
      if (e.data) {
        const parsed = JSON.parse(e.data) as { message?: string };
        if (parsed.message) alert(`Agent error: ${parsed.message}`);
      }
      if (textareaRef.current) textareaRef.current.focus();
    });
  }

  function onChangeModel(e: React.ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value);
  }

  function deriveTitle(conv: OllamaConversation): string {
    const firstUser = conv.messages.find(m => m.role === 'user');
    if (!firstUser?.content) return 'New Chat';
    const text = firstUser.content.trim();
    return text.length > 50 ? text.slice(0, 50) + '…' : text;
  }

  function newChat(): void {
    navigate('/chat/' + crypto.randomUUID());
  }

  function submitPrompt(prompt: string): void {
    if (!id) return;

    // Close any existing SSE stream before starting a new session
    sseRef.current?.close();
    sseRef.current = null;

    if (savedConversation.messages.length === 0 && systemContext.trim()) {
      savedConversation.addMessage(new OllamaMessage(systemContext.trim(), 'system'));
    }

    const newMessage = new OllamaMessage(prompt);
    const resolvedMessageContext = messageContext.trim() ? resolveContextVariables(messageContext.trim()) : '';
    if (resolvedMessageContext) newMessage.context = resolvedMessageContext;
    savedConversation.addMessage(newMessage);

    // Persist the user message to disk
    setSavedConversation(new OllamaConversation(savedConversation.messages));

    const now = new Date().toISOString();
    const existing = conversations.find(c => c.id === id);
    upsertConversation({
      id,
      title: existing?.title ?? deriveTitle(savedConversation),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    setQuestion('');
    setLoading(true);

    // Seed the live conversation ref with current messages (no assistant message yet)
    liveConvRef.current = new OllamaConversation(savedConversation.messages);
    setStreamConversation(new OllamaConversation(savedConversation.messages));

    // Start the agent on the server
    fetch('/api/agent/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: id,
        model,
        messages: savedConversation.messages,
        tools: getToolDefinitions(fsPermission),
        fsPermission,
      }),
    })
      .then(() => openSseStream(0))
      .catch((e: Error) => {
        setLoading(false);
        setStreamConversation(null);
        savedConversation.undoLatestMessage();
        setSavedConversation(new OllamaConversation(savedConversation.messages));
        setQuestion(prompt);
        alert(e.message);
      });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    submitPrompt(question);
  }

  function stopChat(): void {
    if (!id) return;
    sseRef.current?.close();
    sseRef.current = null;
    fetch(`/api/agent/abort/${encodeURIComponent(id)}`, { method: 'POST' }).catch(() => {});
    setLoading(false);
    setStreamConversation(null);
    reloadConversation();
  }

  function exportChatHistory(): void {
    const blob = new Blob([JSON.stringify(conversation)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chat-history-${model}-${new Date().toISOString()}.json`;
    a.click();
    a.remove();
  }

  function importChatHistory(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const importedJson = JSON.parse(content) as OllamaConversation;
          const importedConversation = new OllamaConversation(importedJson.messages);
          const newId = crypto.randomUUID();
          const now = new Date().toISOString();
          await writeStorageFile(`conversations/${newId}.json`, JSON.stringify(importedConversation));
          upsertConversation({ id: newId, title: deriveTitle(importedConversation), createdAt: now, updatedAt: now });
          navigate('/chat/' + newId);
          input.remove();
        } catch {
          alert('Invalid chat history file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function onConversationEvent(index: number, event: ConversationEventType): void {
    if (event === 'retry') {
      let userIndex = index - 1;
      while (userIndex >= 0 && savedConversation.messages[userIndex].role !== 'user') {
        userIndex--;
      }
      if (userIndex < 0) return;
      const previousPrompt = savedConversation.messages[userIndex].content || '';
      savedConversation.revertToMessage(userIndex - 1);
      setSavedConversation(new OllamaConversation(savedConversation.messages));
      submitPrompt(previousPrompt);
      return;
    }

    if (event === 'revert') {
      savedConversation.revertToMessage(index);
      setSavedConversation(new OllamaConversation(savedConversation.messages));
    }
  }

  function handleDeleteConversation(convId: string): void {
    deleteConversation(convId);
    if (convId === id) {
      newChat();
    }
  }

  return (
    <div className="chat-layout">
      <ConversationList
        conversations={conversations}
        currentId={id}
        onNew={newChat}
        onSelect={(convId) => navigate(`/chat/${convId}`)}
        onDelete={handleDeleteConversation}
      />
      <div className="chat-main">
        <div className='area-button-actions'>
          {conversation.messages.length === 0 && (
            <button className='icon-btn' title="Import chat history" onClick={importChatHistory}>
              <UploadSimpleIcon size={20} />
            </button>
          )}
          {conversation.messages.length > 0 && (
            <button className='icon-btn' title="Export chat history" onClick={exportChatHistory}>
              <DownloadSimpleIcon size={20} />
            </button>
          )}
        </div>

        <Conversation conversation={conversation} loading={loading} onEvent={onConversationEvent} />

        <div className='area-prompt-form'>
          <textarea
            ref={textareaRef}
            className='question-textarea'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here"
            onKeyDown={onKeyDown}
          />
          <div className='question-actions'>
            <select className='model-select' value={model} onChange={onChangeModel} disabled={modelsLoading}>
              {modelsLoading && <option value=''>Loading models...</option>}
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {loading && (
            <button className='stop-btn' title="Stop generation" onClick={stopChat}>
              <StopIcon size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
