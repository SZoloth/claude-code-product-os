import { Link } from 'react-router-dom'

export default function ExportStep() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Export</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Export CSV/Markdown and Datadog JS stubs will be available here.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/edit" className="text-sm underline">
          Back
        </Link>
      </div>
    </div>
  )
}


