import { Link, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Data Dictionary Generator (MVP)</h1>
          <nav className="text-sm space-x-4">
            <Link className="hover:underline" to="/">Wizard</Link>
            <Link className="hover:underline" to="/about">About</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t text-xs text-gray-500 dark:text-gray-400 py-3 text-center">
        Local-first MVP • Exports: CSV/Markdown/Datadog • No auth
      </footer>
    </div>
  )
}

export default App
