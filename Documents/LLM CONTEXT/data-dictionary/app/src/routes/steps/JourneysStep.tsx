import { Link, useNavigate } from 'react-router-dom'

export default function JourneysStep() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Journeys (optional)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Optionally outline journeys as Actor → Action → Object → Context. You can refine later.
      </p>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 rounded-md bg-gray-900 text-white" onClick={() => navigate('/preview')}>
          Next: Preview
        </button>
        <Link to="/" className="text-sm underline">
          Back
        </Link>
      </div>
    </div>
  )
}


