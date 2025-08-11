import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import Wizard from './routes/Wizard.tsx'
import DescribeStep from './routes/steps/DescribeStep.tsx'
import JourneysStep from './routes/steps/JourneysStep.tsx'
import PreviewStep from './routes/steps/PreviewStep.tsx'
import EditStep from './routes/steps/EditStep.tsx'
import ExportStep from './routes/steps/ExportStep.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Wizard />,
        children: [
          { index: true, element: <DescribeStep /> },
          { path: 'journeys', element: <JourneysStep /> },
          { path: 'preview', element: <PreviewStep /> },
          { path: 'edit', element: <EditStep /> },
          { path: 'export', element: <ExportStep /> },
        ],
      },
      { path: 'about', element: <div className="prose dark:prose-invert"><h2>About</h2><p>MVP demo.</p></div> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
