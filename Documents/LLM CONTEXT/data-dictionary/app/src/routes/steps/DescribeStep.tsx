import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function DescribeStep() {
  const [text, setText] = useState('')
  const navigate = useNavigate()

  function onNext() {
    // Placeholder: in future, persist text to storage/context
    navigate('/journeys')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Describe your product and journeys</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Paste a concise product description with key user journeys. You can also upload documents later.
      </p>
      <textarea
        className="w-full h-48 p-3 border rounded-md bg-white dark:bg-gray-950"
        placeholder="Paste description here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 rounded-md bg-gray-900 text-white" onClick={onNext}>
          Next: Journeys
        </button>
        <Link to="/preview" className="text-sm underline">
          Skip to preview
        </Link>
      </div>
    </div>
  )
}


