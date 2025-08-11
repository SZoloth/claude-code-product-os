import { Link, useNavigate } from 'react-router-dom'

export default function PreviewStep() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Preview</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This step will run the LLM and show a proposed event dictionary. For now, it’s a placeholder.
      </p>
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


