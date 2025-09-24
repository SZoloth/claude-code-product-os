import React from 'react'
import ReactDOM from 'react-dom/client'
import { SafeShowcase } from './safe-showcase'
import ModelingInterface from './components/ui/modeling-interface'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ModelingInterface />
  </React.StrictMode>,
)