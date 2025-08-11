import { Link, useNavigate } from 'react-router-dom'

export default function EditStep() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Edit</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Inline editor for events and properties will appear here in the MVP.
      </p>
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


