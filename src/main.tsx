import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { SelectionProvider } from './state'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SelectionProvider>
        <App />
      </SelectionProvider>
    </HashRouter>
  </StrictMode>,
)
