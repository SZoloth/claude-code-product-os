/**
 * LoadingStates component - Accessible loading indicators and skeleton screens
 * Provides better UX with meaningful loading states and animations
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  label = 'Loading...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  }
  
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-white/75 dark:bg-gray-900/75 backdrop-blur-sm flex items-center justify-center rounded-lg z-10"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton components for different content types
interface SkeletonProps {
  className?: string
  'aria-label'?: string
}

export function SkeletonText({ className = '', 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <div
      className={`skeleton h-4 rounded ${className}`}
      aria-label={ariaLabel || 'Loading text content'}
      role="status"
    />
  )
}

export function SkeletonButton({ className = '', 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <div
      className={`skeleton h-10 w-24 rounded-md ${className}`}
      aria-label={ariaLabel || 'Loading button'}
      role="status"
    />
  )
}

export function SkeletonCard({ className = '', 'aria-label': ariaLabel }: SkeletonProps) {
  return (
    <div 
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 ${className}`}
      aria-label={ariaLabel || 'Loading content'}
      role="status"
    >
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
      <SkeletonText className="w-full" />
      <div className="flex gap-2 pt-2">
        <SkeletonButton className="w-16 h-8" />
        <SkeletonButton className="w-20 h-8" />
      </div>
    </div>
  )
}

// Table skeleton for data tables
interface SkeletonTableProps {
  rows?: number
  cols?: number
  className?: string
}

export function SkeletonTable({ rows = 3, cols = 4, className = '' }: SkeletonTableProps) {
  return (
    <div 
      className={`space-y-3 ${className}`}
      role="status"
      aria-label="Loading table data"
    >
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        {Array.from({ length: cols }, (_, i) => (
          <SkeletonText key={`header-${i}`} className="h-5 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: cols }, (_, colIndex) => (
            <SkeletonText 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 w-full" 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Progress bar for multi-step operations
interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({ 
  progress, 
  label = 'Progress', 
  showPercentage = true,
  className = '' 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div 
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}

// Pulsing dot loader for subtle loading states
export function PulsingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  )
}

// Content placeholder with action
interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon = '📋', 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4" aria-hidden="true">
        {icon}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}