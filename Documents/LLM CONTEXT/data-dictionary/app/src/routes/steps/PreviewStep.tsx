import { Link, useNavigate } from 'react-router-dom'

export default function PreviewStep() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Preview AI-Generated Events</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          The AI will analyze your input and generate a proposed event dictionary. Review carefully before proceeding.
        </p>
      </div>

      {/* Quality Reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-amber-900 mb-2">🔍 Review Guidelines</h3>
        <div className="text-sm text-amber-800 space-y-1">
          <p><strong>Check event names:</strong> Should be clear, snake_case, and follow your naming conventions</p>
          <p><strong>Verify properties:</strong> Ensure all important context is captured with correct data types</p>
          <p><strong>Validate business logic:</strong> AI may miss domain-specific rules or edge cases</p>
          <p><strong>Time estimate:</strong> First-time review typically takes 10-15 minutes</p>
        </div>
      </div>

      {/* Placeholder for AI results */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <div className="text-lg mb-2">🤖 AI Processing</div>
          <p className="text-sm">LLM analysis will appear here when implemented</p>
          <p className="text-xs mt-2">Coming in Task 3.x - LLM transformation</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 rounded-md bg-gray-900 text-white" onClick={() => navigate('/edit')}>
          Next: Edit
        </button>
        <Link to="/journeys" className="text-sm underline">
          Back
        </Link>
      </div>
    </div>
  )
}


