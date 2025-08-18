import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DataDictionaryEvent } from '../../lib/schema/dataDictionary'
import ExportManager from '../../components/ExportManager'
import ValidationBanner from '../../components/ValidationBanner'
import { ProjectManager as PM } from '../../lib/storage/projectManager'

export default function ExportStep() {
  const [isExportManagerOpen, setIsExportManagerOpen] = useState(false)
  const [events] = useState<DataDictionaryEvent[]>(() => {
    // Load from project or fallback to localStorage
    const project = PM.loadProject()
    if (project) {
      return project.data.events
    }

    const saved = localStorage.getItem('dataDictionary_events')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.warn('Failed to parse saved events:', e)
      }
    }
    return []
  })

  // Create DataDictionary for validation and export
  const dataDictionary = {
    version: '1.0.0',
    generatedAtIso: new Date().toISOString(),
    events
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Export & Integrate</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Download your finalized data dictionary in multiple formats for development and documentation.
        </p>
      </div>

      {/* Validation Status */}
      <ValidationBanner dictionary={dataDictionary} />

      {/* Export Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Ready for Export
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {events.length} events ready for download in multiple formats
            </p>
          </div>
          <button
            onClick={() => setIsExportManagerOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            🚀 Export Now
          </button>
        </div>
      </div>

      {/* Export Options Preview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">CSV Export</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Section 7 schema-compliant spreadsheet with {events.length} events for data analysis
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>• Excel/Google Sheets compatible</p>
            <p>• JSON-serialized properties</p>
            <p>• All required and optional fields</p>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📝</span>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Markdown Documentation</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Human-readable documentation with examples and implementation guidance
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>• Table of contents & statistics</p>
            <p>• Property tables with examples</p>
            <p>• Status badges and context info</p>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🐕</span>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Datadog TypeScript</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Ready-to-use TypeScript functions for Datadog RUM integration
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>• {events.length} tracking functions</p>
            <p>• Type-safe property interfaces</p>
            <p>• Usage examples included</p>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎫</span>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">JIRA Implementation</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Sprint-ready tickets with acceptance criteria and story point estimates
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>• {events.length} implementation tickets</p>
            <p>• Acceptance criteria & tech specs</p>
            <p>• Story point estimates included</p>
          </div>
        </div>
      </div>

      {/* Implementation Warning */}
      <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-purple-900 mb-2">🚀 Before Implementation</h3>
        <div className="text-sm text-purple-800 space-y-1">
          <p><strong>Test first:</strong> Validate events in staging environment before production</p>
          <p><strong>Team review:</strong> Share exports with developers, analysts, and stakeholders</p>
          <p><strong>Privacy check:</strong> Ensure no sensitive data is tracked without proper consent</p>
          <p><strong>Performance:</strong> Monitor impact of new tracking on application performance</p>
        </div>
      </div>

      {/* Quick Export Actions */}
      {events.length > 0 && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Quick Export
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setIsExportManagerOpen(true)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              <span>📊</span>
              CSV
            </button>
            <button
              onClick={() => setIsExportManagerOpen(true)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              <span>📝</span>
              Docs
            </button>
            <button
              onClick={() => setIsExportManagerOpen(true)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              <span>🐕</span>
              Code
            </button>
            <button
              onClick={() => setIsExportManagerOpen(true)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-white dark:hover:bg-gray-700 text-sm flex items-center gap-2"
            >
              <span>🎫</span>
              JIRA
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium mb-2">No Events to Export</h3>
            <p className="text-sm mb-4">Create some events first to enable export functionality</p>
            <Link
              to="/edit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              ← Back to Editor
            </Link>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Link to="/edit" className="text-sm underline">
          Back
        </Link>
      </div>

      {/* Export Manager Modal */}
      {isExportManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <ExportManager
              dictionary={dataDictionary}
              onClose={() => setIsExportManagerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}


