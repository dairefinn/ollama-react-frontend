import { JSX, useEffect, useRef, useState } from "react";
import { Broom, DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { OllamaAPI } from "../api/ollama-api";
import { OllamaConversation } from "../models/ollama-conversation.model";
import { OllamaMessage, OllamaToolCall } from "../models/ollama-message.model";

import Conversation, { ConversationEventType } from "../components/Conversation/Conversation";
import { OllamaChatResponse } from "../api/queries/post-chat.query";
import { ResponseStreamer } from "../utils/response-streaming-util";
import { useModelStorage } from "../utils/use-model-storage";
import { useConversationStorage } from "../utils/use-conversation-storage";
import { useAvailableModels } from "../utils/use-available-models";
import { useSystemContext } from "../utils/use-system-context";
import { useMessageContext } from "../utils/use-message-context";
import { resolveContextVariables } from "../utils/resolve-context-variables";
import { getToolDefinitions, executeTool } from "../tools/built-in-tools";
import { useFsPermission } from "../utils/use-fs-permission";


function ChatPage(): JSX.Element
{
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useModelStorage();
  const [conversation, setConversation] = useConversationStorage();
  const { models, loading: modelsLoading } = useAvailableModels();
  const [systemContext] = useSystemContext();
  const [messageContext] = useMessageContext();
  const [fsPermission] = useFsPermission();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (models.length > 0 && !models.includes(model)) {
      setModel(models[0]);
    }
  }, [models]);

  function onChangeModel(e: React.ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value);
  }

  function submitPrompt(prompt: string): void {
    if (conversation.messages.length === 0 && systemContext.trim()) {
      conversation.addMessage(new OllamaMessage(systemContext.trim(), 'system'));
    }

    const newMessage = new OllamaMessage(prompt);
    const resolvedMessageContext = messageContext.trim() ? resolveContextVariables(messageContext.trim()) : '';
    if (resolvedMessageContext) newMessage.context = resolvedMessageContext;
    conversation.addMessage(newMessage);
    setConversation(new OllamaConversation(conversation.messages));

    setQuestion('');
    setLoading(true);

    async function runAgentLoop(conv: OllamaConversation): Promise<void> {
      const response = await OllamaAPI.chatStream(model, conv, getToolDefinitions(fsPermission));
      conv.addMessage(new OllamaMessage("", 'assistant'));
      setConversation(new OllamaConversation(conv.messages));

      let toolCalls: OllamaToolCall[] | undefined;
      let thinkProcessed = false;
      let hasSeenThinkTag = false;

      await ResponseStreamer.Stream(response, (chunk: string) => {
        try {
          const chunkResponse = JSON.parse(chunk) as OllamaChatResponse;

          if (chunkResponse.message.tool_calls?.length) {
            toolCalls = chunkResponse.message.tool_calls;
            conv.latestMessage.tool_calls = toolCalls;
            setConversation(new OllamaConversation(conv.messages));
            return;
          }

          if (chunkResponse.message.content.includes('<think>')) hasSeenThinkTag = true;
          if (!thinkProcessed && chunkResponse.message.content.includes('</think>')) thinkProcessed = true;

          conv.appendToLatestMessage(chunkResponse.message.content);
          if (thinkProcessed || !hasSeenThinkTag) {
            setConversation(new OllamaConversation(conv.messages));
          }
        } catch {
          // chunk parse error
        }
      });

      if (toolCalls?.length) {
        for (const call of toolCalls) {
          const result = await executeTool(call);
          conv.addMessage(new OllamaMessage(result, 'tool'));
        }
        setConversation(new OllamaConversation(conv.messages));
        await runAgentLoop(conv);
      }
    }

    runAgentLoop(conversation)
      .catch((e: Error) => {
        console.info("Caught error: ", e);
        alert(e.message);
        setQuestion(prompt);
        conversation.undoLatestMessage();
        setConversation(new OllamaConversation(conversation.messages));
      })
      .finally(() => {
        setLoading(false);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    submitPrompt(question);
  }

  function clearChatHistory(): void {
    setConversation(new OllamaConversation());
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
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const importedConversationJson = JSON.parse(content) as OllamaConversation;
          const importedConversation = new OllamaConversation(importedConversationJson.messages);
          setConversation(importedConversation);
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
      while (userIndex >= 0 && conversation.messages[userIndex].role !== 'user') {
        userIndex--;
      }
      if (userIndex < 0) return;
      const previousPrompt = conversation.messages[userIndex].content || '';
      conversation.revertToMessage(userIndex - 1);
      setConversation(new OllamaConversation(conversation.messages));
      submitPrompt(previousPrompt);
      return;
    }

    if (event === 'revert') {
      conversation.revertToMessage(index);
      setConversation(new OllamaConversation(conversation.messages));
    }
  }

  return (
    <>
      <div className='area-button-actions'>
        {conversation.messages.length === 0 && <button className='icon-btn' title="Import chat history" onClick={importChatHistory}><UploadSimple size={20} /></button>}
        {conversation.messages.length > 0 && <button className='icon-btn' title="Clear chat history" onClick={clearChatHistory}><Broom size={20} /></button>}
        {conversation.messages.length > 0 && <button className='icon-btn' title="Export chat history" onClick={exportChatHistory}><DownloadSimple size={20} /></button>}
      </div>

      <Conversation conversation={conversation} loading={loading} onEvent={onConversationEvent} />
      
      <div className='area-prompt-form'>
        <textarea ref={textareaRef} className='question-textarea' value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here" onKeyDown={onKeyDown} />
        <div className='question-actions'>
          <select className='model-select' value={model} onChange={onChangeModel} disabled={modelsLoading}>
            {modelsLoading && <option value=''>Loading models...</option>}
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
    </>
  )
}

export default ChatPage;
