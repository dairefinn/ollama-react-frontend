import { useRef, useState } from "react";
import OllamaAPI, {  } from "../api/ollama-api";
import { OllamaMessage } from "../models/ollama-message.model";
import { OllamaSupportedModel } from "../models/ollama-supported-model.model";
import Loading from "../components/Loading/Loading";
import ChatMessage from '../components/ChatMessage/ChatMessage';
import { OllamaConversation } from "../models/ollama-conversation.model";


function QueryPage()
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

      OllamaAPI.generate(model, conversation.latestMessage)
        .then((response) => {
          conversation.addMessage(new OllamaMessage(response.response, 'assistant'));

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
  
    function clearQueryHistory(): void {
      setConversation(new OllamaConversation());
    }
  
    return (
      <>
        {conversation.messages.length > 0 && <button onClick={clearQueryHistory}>Clear query history</button>}

        <div className='area-query-history'>
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
            <span>Ask</span>
            <select className='model-select' value={model} onChange={onChangeModel}>
              {
                Object.values(OllamaSupportedModel).map(model => {
                  return <option key={model} value={model}>{model}</option>
                })
              }
            </select>
            <span>something:</span>
          </div>
          <textarea ref={textareaRef} className='question-textarea' value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here" onKeyDown={onKeyDown} />
          <button onClick={onClickSubmit}>Submit</button>
        </div>
      </>
    )
}

export default QueryPage;