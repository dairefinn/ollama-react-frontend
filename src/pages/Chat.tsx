import { JSX, useRef, useState } from "react";
import { OllamaAPI } from "../api/ollama-api";
import { OllamaSupportedModel } from "../models/ollama-supported-model.model";
import { OllamaConversation } from "../models/ollama-conversation.model";
import { OllamaMessage } from "../models/ollama-message.model";

import Conversation, { ConversationEventType } from "../components/Conversation/Conversation";
import { OllamaChatResponse } from "../api/queries/post-chat.query";
import { ResponseStreamer } from "../utils/response-streaming-util";


function ChatPage(): JSX.Element
{
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<OllamaSupportedModel>(OllamaSupportedModel.DeepseekR1);
  const [conversation, setConversation] = useState<OllamaConversation>(new OllamaConversation());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function onChangeModel(e: React.ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value as OllamaSupportedModel);
  }

  function onClickSubmit() {
    submitPrompt(question);
  }

  function submitPrompt(prompt: string): void {
    const newMessage = new OllamaMessage(prompt);
    conversation.addMessage(newMessage);

    setQuestion('');
    setLoading(true);

    OllamaAPI.chatStream(model, conversation)
      .then(async (response) => {
        conversation.addMessage(new OllamaMessage("", 'assistant'));

        let thinkProcessed: boolean = false;
        let hasSeenThinkTag: boolean = false;

        ResponseStreamer.Stream(
            response,
            (chunk: string) => {
              try {
                const chunkResponse: OllamaChatResponse = JSON.parse(chunk) as OllamaChatResponse;
                
                // Check if this response uses think tags
                if (chunkResponse.message.content.includes('<think>')) {
                  hasSeenThinkTag = true;
                }
                
                if (!thinkProcessed && chunkResponse.message.content.includes('</think>')) {
                  thinkProcessed = true;
                }
                
                conversation.appendToLatestMessage(chunkResponse.message.content);

                // Render UI updates: either after <think> tag is closed, or immediately if no think tags are used
                if(thinkProcessed || !hasSeenThinkTag) {
                  setConversation(new OllamaConversation(conversation.messages));
                }
              } catch (e) {
                // Error handling for chunk parsing
              }
            }
        );

        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      })

      .catch((e: Error) => {
        console.info("Caught error: ", e);
        alert(e.message);
        setQuestion(prompt);
        conversation.undoLatestMessage();
      })

      .finally(() => {
        setLoading(false);
      });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    onClickSubmit();
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
      const previousPrompt: string  = conversation.messages[index - 1].content || '';
      conversation.revertToMessage(index - 2);
      setConversation(new OllamaConversation(conversation.messages)); // Prompt Conversation component to re-render
      submitPrompt(previousPrompt);
      return;
    }

    if (event === 'revert') {
      conversation.revertToMessage(index);
      setConversation(new OllamaConversation(conversation.messages)); // Prompt Conversation component to re-render
    }
  }

  return (
    <>
      <div className='area-button-actions'>
        {conversation.messages.length > 0 && <button onClick={clearChatHistory}>Clear chat history</button>}
        &nbsp;
        {conversation.messages.length === 0 && <button onClick={importChatHistory}>Import chat history</button>}
        {conversation.messages.length > 0 && <button onClick={exportChatHistory}>Export chat history</button>}
      </div>

      <Conversation conversation={conversation} loading={loading} onEvent={onConversationEvent} />
      
      <div className='area-prompt-form'>
        <div className='question-prompt'>
          <span>Chat with</span>
          <select className='model-select' value={model} onChange={onChangeModel}>
            {
              Object.values(OllamaSupportedModel).map(model => {
                return <option key={model} value={model}>{model}</option>
              })
            }
          </select>
          <span>:</span>
        </div>
        <textarea ref={textareaRef} className='question-textarea' value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here" onKeyDown={onKeyDown} />
        <button onClick={onClickSubmit}>Submit</button>
      </div>
    </>
  )
}

export default ChatPage;
