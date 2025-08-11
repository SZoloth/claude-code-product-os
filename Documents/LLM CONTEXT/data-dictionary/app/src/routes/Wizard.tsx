import { Link, Outlet, useLocation } from 'react-router-dom'

const steps = [
  { path: '/', label: 'Describe' },
  { path: '/journeys', label: 'Journeys' },
  { path: '/preview', label: 'Preview' },
  { path: '/edit', label: 'Edit' },
  { path: '/export', label: 'Export' },
]

export default function Wizard() {
  const { pathname } = useLocation()
  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap gap-2 text-sm">
        {steps.map((s, i) => {
          const active = pathname === s.path || (s.path === '/' && pathname === '/')
          return (
            <li key={s.path} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full grid place-items-center text-xs font-medium border bg-white dark:bg-gray-900">
                {i + 1}
              </span>
              <Link
                to={s.path}
                className={active ? 'font-semibold underline' : 'text-gray-600 hover:underline'}
              >
                {s.label}
              </Link>
              {i < steps.length - 1 && <span className="text-gray-400">/</span>}
            </li>
          )
        })}
      </ol>
      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
        <Outlet />
      </div>
    </div>
  )
}


