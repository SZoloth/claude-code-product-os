import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { trackWizardStep } from '../lib/analytics/usageTracker'
import { useKeyboardShortcuts, createWizardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useScreenReaderAnnouncement } from '../hooks/useFocusManagement'

const steps = [
  { path: '/', label: 'Describe' },
  { path: '/journeys', label: 'Journeys' },
  { path: '/preview', label: 'Preview' },
  { path: '/edit', label: 'Edit' },
  { path: '/export', label: 'Export' },
]

export default function Wizard() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const announce = useScreenReaderAnnouncement()
  
  // Track wizard step navigation and announce changes
  useEffect(() => {
    const currentStep = steps.find(step => step.path === pathname)
    if (currentStep) {
      trackWizardStep(currentStep.label.toLowerCase())
      announce(`Navigated to ${currentStep.label} step`)
    }
  }, [pathname, announce])
  
  // Keyboard shortcuts for wizard navigation
  const shortcuts = createWizardShortcuts({
    goToDescribe: () => navigate('/'),
    goToJourneys: () => navigate('/journeys'),
    goToPreview: () => navigate('/preview'),
    goToEdit: () => navigate('/edit'),
    goToExport: () => navigate('/export')
  })
  
  useKeyboardShortcuts({ shortcuts, enabled: true })
  
  return (
    <div className="content-section-lg">
      {/* Progress Steps */}
      <nav aria-label="Wizard progress" className="mb-8">
        <ol className="flex flex-wrap gap-4 sm:gap-6" role="tablist">
          {steps.map((s, i) => {
            const isActive = pathname === s.path || (s.path === '/' && pathname === '/')
            const isCompleted = false // TODO: Add completion tracking in future tasks
            
            return (
              <li key={s.path} className="wizard-step" role="presentation">
                <span 
                  className={`wizard-step-number ${
                    isActive ? 'wizard-step-active' : 
                    isCompleted ? 'wizard-step-completed' : 
                    'wizard-step-incomplete'
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? '✓' : i + 1}
                </span>
                <Link
                  to={s.path}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${s.path.replace('/', '')}`}
                  className={`transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${
                    isActive 
                      ? 'font-semibold text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${s.label} step ${isActive ? '(current)' : ''} - Alt+${i + 1} to navigate`}
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
        
        {/* Progress indicator for screen readers */}
        <div className="sr-only" aria-live="polite">
          Step {steps.findIndex(s => pathname === s.path || (s.path === '/' && pathname === '/')) + 1} of {steps.length}: 
          {steps.find(s => pathname === s.path || (s.path === '/' && pathname === '/'))?.label}
        </div>
      </nav>
      
      {/* Step Content */}
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8 shadow-sm"
        role="tabpanel"
        id={`panel-${pathname.replace('/', '')}`}
        aria-labelledby={`tab-${pathname.replace('/', '')}`}
      >
        <Outlet />
      </div>
    </div>
  )
}


