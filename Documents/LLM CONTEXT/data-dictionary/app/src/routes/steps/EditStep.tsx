import { Link, useNavigate } from 'react-router-dom'

export default function EditStep() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Edit & Refine Events</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Fine-tune the AI-generated events, add missing details, and ensure they match your analytics needs.
        </p>
      </div>

      {/* Editing Best Practices */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">✏️ Editing Best Practices</h3>
        <div className="text-sm text-green-800 space-y-1">
          <p><strong>Event naming:</strong> Use consistent snake_case (e.g., product_viewed, checkout_completed)</p>
          <p><strong>Properties:</strong> Include user context, session info, and relevant business data</p>
          <p><strong>Required fields:</strong> Mark critical properties as required for data quality</p>
          <p><strong>Examples:</strong> Add realistic sample values to guide implementation</p>
        </div>
      </div>

      {/* Placeholder for inline editor */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <div className="text-lg mb-2">📝 Table Editor</div>
          <p className="text-sm">Inline event/property editor will appear here</p>
          <p className="text-xs mt-2">Coming in Task 5.x - Editing and persistence</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 rounded-md bg-gray-900 text-white" onClick={() => navigate('/export')}>
          Next: Export
        </button>
        <Link to="/preview" className="text-sm underline">
          Back
        </Link>
      </div>
    </div>
  )
}


