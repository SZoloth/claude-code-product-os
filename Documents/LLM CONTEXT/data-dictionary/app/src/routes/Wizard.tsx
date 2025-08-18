import { Link, Outlet, useLocation } from 'react-router-dom'

const steps = [
  { path: '/', label: 'Describe' },
  { path: '/journeys', label: 'Journeys' },
  { path: '/preview', label: 'Preview' },
  { path: '/edit', label: 'Edit' },
  { path: '/export', label: 'Export' },
]

export default function Wizard() {
  const { pathname } = useLocation()
  
  return (
    <div className="content-section-lg">
      {/* Progress Steps */}
      <nav aria-label="Wizard progress" className="mb-8">
        <ol className="flex flex-wrap gap-4 sm:gap-6">
          {steps.map((s, i) => {
            const isActive = pathname === s.path || (s.path === '/' && pathname === '/')
            const isCompleted = false // TODO: Add completion tracking in future tasks
            
            return (
              <li key={s.path} className="wizard-step">
                <span className={`wizard-step-number ${
                  isActive ? 'wizard-step-active' : 
                  isCompleted ? 'wizard-step-completed' : 
                  'wizard-step-incomplete'
                }`}>
                  {isCompleted ? '✓' : i + 1}
                </span>
                <Link
                  to={s.path}
                  className={`transition-colors ${
                    isActive 
                      ? 'font-semibold text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {s.label}
                </Link>
                {i < steps.length - 1 && (
                  <span className="text-gray-300 dark:text-gray-600 mx-2" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      
      {/* Step Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8 shadow-sm">
        <Outlet />
      </div>
    </div>
  )
}


