import React from 'react'
import ReactDOM from 'react-dom/client'
import { DesignSystemShowcase } from './examples/design-system-showcase'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DesignSystemShowcase />
  </React.StrictMode>,
)