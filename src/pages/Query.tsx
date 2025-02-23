import { useRef, useState } from "react";
import OllamaAPI, {  } from "../api/ollama-api";
import { OllamaMessage, OllamaSupportedModel } from "../api/ollama-models";
import Loading from "../components/Loading/Loading";
import ChatMessage from '../components/ChatMessage/ChatMessage';


function QueryPage()
{
    const [question, setQuestion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [model, setModel] = useState<OllamaSupportedModel>(OllamaSupportedModel.DeepseekR1);
    const [queryHistory, setQueryHistory] = useState<OllamaMessage[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
  
    function onChangeModel(e: React.ChangeEvent<HTMLSelectElement>) {
      setModel(e.target.value as OllamaSupportedModel);
    }
  
    function onClickSubmit() {
      const queryHistoryPrevious = [...queryHistory];
      let queryHistoryUpdated: OllamaMessage[] = [];
      queryHistoryUpdated = [{ role: 'user', content: question }];
      const questionTemp = question;
      setQueryHistory(queryHistoryUpdated);
      setQuestion('');
      setLoading(true);

      OllamaAPI.generate(model, question)
        .then((response) => {
          queryHistoryUpdated = [...queryHistoryUpdated, { role: 'assistant', content: response.response }];
          setQueryHistory(queryHistoryUpdated);
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        })
  
        .catch(() => {
          alert('Failed to get response from the server. Please try again later.');
          setQuestion(questionTemp);
          setQueryHistory(queryHistoryPrevious);
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
      setQueryHistory([]);
    }
  
    return (
      <>
        {queryHistory.length > 0 && <button onClick={clearQueryHistory}>Clear query history</button>}

        <div className='area-query-history'>
          {
            queryHistory.map((message, index) => {
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
            <span>Ask&nbsp;</span>
            <select className='model-select' value={model} onChange={onChangeModel}>
              {
                Object.values(OllamaSupportedModel).map(model => {
                  return <option key={model} value={model}>{model}</option>
                })
              }
            </select>
            <span>&nbsp;something:</span>
          </div>
          <textarea ref={textareaRef} className='question-textarea' value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here" onKeyDown={onKeyDown} />
          <button onClick={onClickSubmit}>Submit</button>
        </div>
      </>
    )
}

export default QueryPage;