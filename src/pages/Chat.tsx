import { useRef, useState } from "react";
import OllamaAPI, {  } from "../api/ollama-api";
import ChatMessage from "../components/ChatMessage/ChatMessage";
import Loading from "../components/Loading/Loading";
import { OllamaSupportedModel } from "../models/ollama-supported-model.model";
import { OllamaConversation } from "../models/ollama-conversation.model";
import { OllamaMessage } from "../models/ollama-message.model";


function ChatPage()
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
    const newMessage = new OllamaMessage(question);
    conversation.addMessage(newMessage);

    setQuestion('');
    setLoading(true);

    OllamaAPI.chat(model, conversation)
      .then((response) => {
        conversation.addMessage(response.message);

        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      })

      .catch((e: Error) => {
        alert(e.message);
        setQuestion(conversation.latestMessage?.content || '');
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
          const importedConversationJson = JSON.parse(content);
          setConversation(importedConversationJson);
          input.remove();
        } catch {
          alert('Invalid chat history file');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  return (
    <>
      <div className='area-button-actions'>
        {conversation.messages.length > 0 && <button onClick={clearChatHistory}>Clear chat history</button>}
        &nbsp;
        {conversation.messages.length === 0 && <button onClick={importChatHistory}>Import chat history</button>}
        {conversation.messages.length > 0 && <button onClick={exportChatHistory}>Export chat history</button>}
      </div>

      {/* TODO: Replace this with a component which renders a conversation object */}
      <div className='area-chat-history'>
        {
          conversation.messages.map((message, index) => {
            return (
              <ChatMessage key={index} message={message} />
            )
          })
        }
        {
          loading && <Loading />
        }
      </div>
      
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