/**
 * ErrorBoundary component - Enhanced error handling with accessibility
 * Provides graceful error recovery and user-friendly error reporting
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { trackPerformance } from '../lib/analytics/usageTracker'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Track the error for analytics
    trackPerformance('error_boundary_triggered', 1)

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Could send to error reporting service in production
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state
    
    const errorDetails = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    const errorText = JSON.stringify(errorDetails, null, 2)

    try {
      await navigator.clipboard.writeText(errorText)
      // Could show a toast notification here
      console.log('Error details copied to clipboard')
    } catch (err) {
      console.error('Failed to copy error details:', err)
      
      // Fallback: create text area and select content
      const textArea = document.createElement('textarea')
      textArea.value = errorText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorId } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div 
          className="min-h-[400px] flex items-center justify-center p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-lg w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="text-6xl mb-4" aria-hidden="true">
              💥
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h1>

            {/* Error Description */}
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                We're sorry, but an unexpected error occurred while loading this part of the application.
              </p>
              {errorId && (
                <p className="text-sm">
                  <strong>Error ID:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{errorId}</code>
                </p>
              )}
            </div>

            {/* Error Details (Development Only) */}
            {isDevelopment && error && (
              <details className="text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details (Development Mode)
                </summary>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto whitespace-pre-wrap">
                  <strong>Message:</strong> {error.message}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      <strong>Stack Trace:</strong>
                      {'\n'}
                      {error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Try to recover from the error"
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Reload the entire page"
              >
                Reload Page
              </button>

              <button
                onClick={this.copyErrorDetails}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Copy error details for reporting"
              >
                Copy Error Details
              </button>
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <p>
                If this problem persists, try refreshing the page or clearing your browser's cache.
              </p>
              <p>
                You can also copy the error details above and report the issue to our support team.
              </p>
            </div>

            {/* Return to Home Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium focus:outline-none focus:underline"
              >
                ← Return to Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for manually triggering error boundary
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    // Force a re-render that will trigger the error boundary
    throw error
  }

  return handleError
}