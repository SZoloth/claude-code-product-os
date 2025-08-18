import { Link } from 'react-router-dom'

export default function ExportStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Export & Integrate</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Download your finalized data dictionary in multiple formats for development and documentation.
        </p>
      </div>

      {/* Export Options Preview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">📊 CSV Export</h3>
          <p className="text-sm text-gray-600">Complete event dictionary with all fields for spreadsheet analysis and team review</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">📝 Markdown Summary</h3>
          <p className="text-sm text-gray-600">Human-readable documentation with rationale for each event</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">🐕 Datadog Stubs</h3>
          <p className="text-sm text-gray-600">JavaScript code snippets ready for implementation</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">🎫 JIRA Tickets</h3>
          <p className="text-sm text-gray-600">Implementation tasks for your development team</p>
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

      {/* Placeholder for export options */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <div className="text-lg mb-2">📦 Export Options</div>
          <p className="text-sm">Download buttons will appear here when implemented</p>
          <p className="text-xs mt-2">Coming in Task 6.x - Export and integrations</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/edit" className="text-sm underline">
          Back
        </Link>
      </div>
    </div>
  )
}


