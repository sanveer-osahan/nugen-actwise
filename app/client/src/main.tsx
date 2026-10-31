import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/components.css'
import './index.css'
import App from './App.tsx'
import { StyleGuide } from './StyleGuide.tsx'

const Page = window.location.pathname === '/style-guide' ? StyleGuide : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
