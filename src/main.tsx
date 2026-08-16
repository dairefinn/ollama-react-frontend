import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import LayoutDefault from './layouts/LayoutDefault'
import ChatPage from './pages/Chat'
import SettingsPage from './pages/Settings'
import MemoryPage from './pages/Memory'
import Navigation from './components/Navigation/Navigation'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Navigation />
      <div className="content-area">
        <Routes>
          <Route path='/' element={<LayoutDefault />}>
            <Route path='/memory' element={<MemoryPage />} />
            <Route path='/settings' element={<SettingsPage />} />
          </Route>
          <Route path='/chat' element={<ChatPage />} />
          <Route path='/chat/:id' element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)
