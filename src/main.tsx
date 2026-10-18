import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { SelectionProvider } from './state'
// Fonts are bundled with the site (no Google Fonts request), so visitors' IPs never go to a third party.
import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
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
