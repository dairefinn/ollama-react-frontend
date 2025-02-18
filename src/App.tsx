import { useState } from 'react'

import './App.css'
import OllamaAPI, { OllamaGenerateResponse } from './api/api'

function App() {
  const [response, setResponse] = useState<OllamaGenerateResponse | null>(null)
  const [question, setQuestion] = useState<string>('');

  function onClickSubmit() {
    OllamaAPI.generate('deepseek-r1', question)
      .then((response) => {
        // Remove <think> </think> tags from response
        response.response = response.response.replace(/<think>/g, '');
        response.response = response.response.replace(/<\/think>/g, '');
        setResponse(response)
      });
  }

  return (
    <>
      <div className='page-wrapper'>
        <div className='question_prompt'>Ask deepseek something:</div>
        <textarea className='question_textarea' value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here" />
        <button onClick={onClickSubmit}>Submit</button>
        {response && <div className='question_response'>{response?.response}</div>}
      </div>
    </>
  )

}

export default App
