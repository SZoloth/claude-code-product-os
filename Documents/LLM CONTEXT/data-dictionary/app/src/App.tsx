import { Link, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { validateConfig } from './lib/config'
import { analytics } from './lib/analytics/usageTracker'
import AnalyticsPanel from './components/AnalyticsPanel'

function App() {
  const [configErrors, setConfigErrors] = useState<string[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    const { isValid, errors } = validateConfig()
    if (!isValid) {
      setConfigErrors(errors)
    }

    // Track app initialization
    analytics.track('app_loaded', {
      config_valid: isValid,
      config_errors_count: errors.length
    })

    // Track performance metrics
    const loadTime = performance.now()
    analytics.trackPerformance('page_load_time', loadTime)
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <header className="border-b bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Data Dictionary Generator
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(MVP)</span>
          </h1>
          <nav className="text-sm" aria-label="Main navigation">
            <ul className="flex gap-4 items-center">
              <li>
                <Link 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors" 
                  to="/"
                >
                  Wizard
                </Link>
              </li>
              <li>
                <Link 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors" 
                  to="/about"
                >
                  About
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
                  aria-label="View usage analytics"
                >
                  📊 Analytics
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main 
        id="main-content" 
        className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
      >
        {configErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
            <h3 className="text-sm font-medium text-red-800 mb-2">Configuration Error</h3>
            <p className="text-sm text-red-700 mb-2">
              Please create a <code className="bg-red-100 px-1 py-0.5 rounded text-red-900">.env</code> file based on <code className="bg-red-100 px-1 py-0.5 rounded text-red-900">.env.example</code> and set the required values:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
              {configErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <Outlet />
      </main>
      <footer className="border-t text-xs text-gray-500 dark:text-gray-400 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="text-center lg:text-left">
            Local-first MVP • Exports: CSV/Markdown/Datadog • No auth required
          </div>
          <div className="text-center lg:text-right space-y-1">
            <div>⚠️ No PII guarantees in MVP • Always review AI outputs</div>
            <div>Data processed via OpenAI API • Review their privacy policy</div>
          </div>
        </div>
      </footer>

      {/* Analytics Panel Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <AnalyticsPanel onClose={() => setShowAnalytics(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
