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
  
    return (
      <>
        {chatHistory.length > 0 && <button onClick={clearChatHistory}>Clear chat history</button>}

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