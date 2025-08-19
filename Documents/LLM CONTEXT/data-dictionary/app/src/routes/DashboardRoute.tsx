/**
 * Dashboard route component
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import { loadDictionary } from '../lib/storage/localStorage'
import type { DataDictionary } from '../lib/schema/dataDictionary'
import { LoadingSpinner } from '../components/LoadingStates'

export default function DashboardRoute() {
  const navigate = useNavigate()
  const [dictionary, setDictionary] = useState<DataDictionary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = loadDictionary()
        
        if (!data || data.events.length === 0) {
          setError('No data dictionary found. Please create one first using the wizard.')
          return
        }
        
        setDictionary(data)
      } catch (err) {
        setError('Failed to load data dictionary')
        console.error('Dashboard load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-600 dark:text-yellow-400 text-4xl mb-4">📊</div>
          <h2 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            No Dashboard Data
          </h2>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
          >
            Go to Wizard
          </button>
        </div>
      </div>
    )
  }

  if (!dictionary) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🤔</div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Unexpected Error
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Something went wrong loading the dashboard.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Reload Page
        </button>
      </div>
    )
  }

  return <Dashboard dictionary={dictionary} className="max-w-none" />
}