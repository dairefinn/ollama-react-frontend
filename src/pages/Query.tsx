import { JSX, useRef, useState } from "react";
import { OllamaAPI } from "../api/ollama-api";
import { OllamaMessage } from "../models/ollama-message.model";
import { OllamaSupportedModel } from "../models/ollama-supported-model.model";
import { OllamaConversation } from "../models/ollama-conversation.model";

import Conversation from "../components/Conversation/Conversation";
import { OllamaGenerateResponse } from "../api/queries/post-generate.query";


function QueryPage(): JSX.Element
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

      OllamaAPI.generateStream(model, conversation.latestMessage)
        .then(async (response) => {
          conversation.addMessage(new OllamaMessage("", 'assistant'));
 
          const decoder = new TextDecoder("utf-8");
          let thinkProcessed: boolean = false;
          const reader = response.body?.getReader();
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              try {
                const chunkResponse: OllamaGenerateResponse = JSON.parse(chunk) as OllamaGenerateResponse;
                if (!thinkProcessed && chunkResponse.response.includes('</think>')) {
                  thinkProcessed = true;
                }
                conversation.appendToLatestMessage(chunkResponse.response);
              } catch (e) {
                console.error(e);
              }

              // Only render UI updates after the <think> tag is closed
              if(thinkProcessed) {
                setConversation(new OllamaConversation(conversation.messages));
              }
            }
          }

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

        <Conversation conversation={conversation} loading={loading} />
        
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
