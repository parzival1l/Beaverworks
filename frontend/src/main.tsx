import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { reactRouterFuture } from './routerFuture'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={reactRouterFuture}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
