import React from 'react'
import ReactDOM from 'react-dom/client'
import { MinimalTest } from './minimal-test'
import { Button } from './components/ui/button'
import './index.css'

const TestComponent = () => {
  return (
    <div className="p-4">
      <MinimalTest />
      <Button className="mt-4">Test Button</Button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestComponent />
  </React.StrictMode>,
)