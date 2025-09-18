import React from 'react'
import ReactDOM from 'react-dom/client'
import { SafeShowcase } from './safe-showcase'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SafeShowcase />
  </React.StrictMode>,
)