/**
 * Analytics Panel - Show usage statistics and privacy controls
 */

import { useState, useEffect } from 'react'
import { analytics } from '../lib/analytics/usageTracker'
import type { UsageAnalytics } from '../lib/analytics/usageTracker'

interface AnalyticsPanelProps {
  onClose: () => void
  className?: string
}

export default function AnalyticsPanel({ onClose, className = '' }: AnalyticsPanelProps) {
  const [usageData, setUsageData] = useState<UsageAnalytics | null>(null)
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true)
  const [showExportData, setShowExportData] = useState(false)

  useEffect(() => {
    setUsageData(analytics.getSessionSummary())
    setIsTrackingEnabled(analytics.isTrackingEnabled())
  }, [])

  const handleToggleTracking = () => {
    if (isTrackingEnabled) {
      analytics.disable()
      setIsTrackingEnabled(false)
    } else {
      analytics.enable()
      setIsTrackingEnabled(true)
    }
    setUsageData(analytics.getSessionSummary())
  }

  const handleClearData = () => {
    analytics.clearData()
    setUsageData(analytics.getSessionSummary())
  }

  const handleExportData = () => {
    const data = analytics.exportUsageData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getEventCounts = () => {
    if (!usageData) return {}
    
    const counts: Record<string, number> = {}
    usageData.events.forEach(event => {
      counts[event.event_name] = (counts[event.event_name] || 0) + 1
    })
    return counts
  }

  const getSessionDuration = () => {
    if (!usageData) return '0 minutes'
    
    const start = new Date(usageData.session.started_at)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Less than 1 minute'
    if (diffMinutes < 60) return `${diffMinutes} minutes`
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const eventCounts = getEventCounts()

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Usage Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Privacy-safe usage tracking for improving the application
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close analytics panel"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Privacy Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Privacy Controls
          </h4>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Usage Tracking
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-200">
                {isTrackingEnabled ? 'Collecting anonymous usage data' : 'Tracking disabled'}
              </div>
            </div>
            <button
              onClick={handleToggleTracking}
              className={`px-3 py-1 rounded text-sm font-medium ${
                isTrackingEnabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isTrackingEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClearData}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
            >
              🗑️ Clear Data
            </button>
            <button
              onClick={handleExportData}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
            >
              📥 Export Data
            </button>
          </div>
        </div>

        {/* Session Information */}
        {usageData && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Current Session
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Duration</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {getSessionDuration()}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Events</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {usageData.events.length} actions
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Browser</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {usageData.session.user_agent}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Viewport</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {usageData.session.viewport_width}×{usageData.session.viewport_height}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Breakdown */}
        {Object.keys(eventCounts).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Action Breakdown
            </h4>
            
            <div className="space-y-2">
              {Object.entries(eventCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([eventName, count]) => (
                  <div key={eventName} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {eventName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Privacy Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Privacy Information
          </h4>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>What we track:</strong> Anonymous usage patterns, feature interactions, 
              performance metrics, and error occurrences.
            </p>
            <p>
              <strong>What we don't track:</strong> Personal information, file contents, 
              API keys, or any data that could identify you.
            </p>
            <p>
              <strong>Data storage:</strong> All data is stored locally in your browser. 
              Nothing is sent to external servers.
            </p>
            <p>
              <strong>Your control:</strong> You can disable tracking, clear data, 
              or export your data at any time.
            </p>
          </div>
        </div>

        {/* Raw Data Toggle */}
        <div className="space-y-3">
          <button
            onClick={() => setShowExportData(!showExportData)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            {showExportData ? 'Hide' : 'Show'} Raw Data
          </button>
          
          {showExportData && usageData && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-64">
                {JSON.stringify(usageData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}