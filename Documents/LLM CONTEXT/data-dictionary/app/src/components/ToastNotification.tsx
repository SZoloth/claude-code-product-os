/**
 * ToastNotification component - Accessible toast notifications system
 * Provides non-intrusive feedback with keyboard and screen reader support
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastNotificationProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, toast.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.id])
  
  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 300)
  }
  
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return 'ℹ️'
    }
  }
  
  const getAriaLabel = () => {
    const typeLabels = {
      success: 'Success notification',
      error: 'Error notification',
      warning: 'Warning notification',
      info: 'Information notification'
    }
    return `${typeLabels[toast.type]}: ${toast.title}`
  }
  
  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'
    }
  }
  
  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
      aria-live="polite"
      aria-label={getAriaLabel()}
    >
      <div className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        max-w-sm w-full
        ${getColorClasses()}
      `}>
        <div className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium mb-1">
            {toast.title}
          </h4>
          
          {toast.message && (
            <p className="text-sm opacity-90">
              {toast.message}
            </p>
          )}
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm font-medium underline hover:no-underline focus:no-underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 mt-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-lg hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 rounded"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Toast container component
interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  
  return createPortal(
    <div 
      className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>,
    document.body
  )
}

// Toast hook for easy usage
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    return id
  }
  
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  const clearAll = () => {
    setToasts([])
  }
  
  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<Toast>) =>
    addToast({ type: 'success', title, message, ...options })
    
  const error = (title: string, message?: string, options?: Partial<Toast>) =>
    addToast({ type: 'error', title, message, duration: 0, ...options })
    
  const warning = (title: string, message?: string, options?: Partial<Toast>) =>
    addToast({ type: 'warning', title, message, ...options })
    
  const info = (title: string, message?: string, options?: Partial<Toast>) =>
    addToast({ type: 'info', title, message, ...options })
  
  return {
    toasts,
    addToast,
    dismissToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}