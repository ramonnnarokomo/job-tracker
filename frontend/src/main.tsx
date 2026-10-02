import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Global tokens and base styles first, so component styles can build on them.
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
