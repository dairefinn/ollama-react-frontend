import { useRef, useState } from 'react'

import './App.css'
import OllamaAPI, { OllamaMessage, OllamaSupportedModel } from './api/api'
import ChatMessage from './components/ChatMessage/ChatMessage';

function App() {
  const [question, setQuestion] = useState<string>('');
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
    // setChatHistory([...chatHistory, { role: 'user', content: question }]);

    // OllamaAPI.generate(OllamaSupportedModel.DeepseekR1, question)
    //   .then((response) => {
    //     // Remove <think> </think> tags from response
    //     // response.response = response.response.replace(/<think>/g, '');
    //     // response.response = response.response.replace(/<\/think>/g, '');
    //     // TODO: Don't remove these tags, instead style them differently.
    //     // There are also escape characters in the response that need to be removed.
    //     // eg. When asking "What is 2+2?", the printed response is "The sum of 2 and 2 is calculated as follows: \[ 2 + 2 = 4 \] Therefore, the final answer is \(\boxed{4}\).""
    //     chatHistoryUpdated = [...chatHistoryUpdated, { role: 'assistant', content: response.response }];
    //   })

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
      <div className='page-wrapper'>
        {chatHistory.length > 0 && <button onClick={clearChatHistory}>Clear chat history</button>}

        <div className='area-chat-history'>
          {
            chatHistory.map((message, index) => {
              return (
                <ChatMessage key={index} message={message} />
              )
            })
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
      </div>
    </>
  )

}

export default App
