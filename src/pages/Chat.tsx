import { useRef, useState } from "react";
import OllamaAPI, {  } from "../api/ollama-api";
import ChatMessage from "../components/ChatMessage/ChatMessage";
import Loading from "../components/Loading/Loading";
import { OllamaMessage, OllamaSupportedModel } from "../api/ollama-models";


function ChatPage()
{
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<OllamaSupportedModel>(OllamaSupportedModel.DeepseekR1);
  const [chatHistory, setChatHistory] = useState<OllamaMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function onChangeModel(e: React.ChangeEvent<HTMLSelectElement>) {
    setModel(e.target.value as OllamaSupportedModel);
  }

  function onClickSubmit() {
    const chatHistoryPrevious = [...chatHistory];
    let chatHistoryUpdated = [...chatHistory];
    chatHistoryUpdated = [...chatHistoryUpdated, { role: 'user', content: question }];
    const questionTemp = question;
    setChatHistory(chatHistoryUpdated);
    setQuestion('');
    setLoading(true);

    OllamaAPI.chat(model, chatHistoryUpdated)
      .then((response) => {
        chatHistoryUpdated = [...chatHistoryUpdated, response.message];
        setChatHistory(chatHistoryUpdated);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      })

      .catch(() => {
        alert('Failed to get response from the server. Please try again later.');
        setQuestion(questionTemp);
        setChatHistory(chatHistoryPrevious);
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
    setChatHistory([]);
  }

  function exportChatHistory(): void {
    const blob = new Blob([JSON.stringify(chatHistory)], { type: 'application/json' });

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
          const chatHistoryJson = JSON.parse(content);
          setChatHistory(chatHistoryJson);
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
        {chatHistory.length > 0 && <button onClick={clearChatHistory}>Clear chat history</button>}
        &nbsp;
        {chatHistory.length === 0 && <button onClick={importChatHistory}>Import chat history</button>}
        {chatHistory.length > 0 && <button onClick={exportChatHistory}>Export chat history</button>}
      </div>

      <div className='area-chat-history'>
        {
          chatHistory.map((message, index) => {
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
          <span>Chat with&nbsp;</span>
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