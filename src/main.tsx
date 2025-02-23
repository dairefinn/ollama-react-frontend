import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import ChatPage from './pages/Chat'
import LayoutDefault from './layouts/LayoutDefault'
import QueryPage from './pages/Query'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LayoutDefault />}>
          <Route path='/chat' element={<ChatPage />} />
          <Route path='/query' element={<QueryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
