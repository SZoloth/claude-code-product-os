/**
 * About page - Basic information about the Data Dictionary Generator
 */

import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="content-section-lg max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          About Data Dictionary Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          AI-powered tool for generating analytics event dictionaries
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>What it does</h2>
        <p>
          This tool helps product teams and developers create comprehensive data dictionaries 
          for analytics tracking. Simply describe your product and user journeys, and our AI 
          will extract relevant events, properties, and tracking requirements.
        </p>

        <h2>Features</h2>
        <ul>
          <li><strong>AI-Powered Analysis:</strong> Automatically identifies key tracking events from product descriptions</li>
          <li><strong>Multiple Export Formats:</strong> CSV, Markdown, Datadog stubs, and JIRA tickets</li>
          <li><strong>Local-First:</strong> All processing happens in your browser - no server required</li>
          <li><strong>Accessible Design:</strong> Built with WCAG guidelines and responsive design</li>
        </ul>

        <h2>How it works</h2>
        <ol>
          <li><strong>Describe:</strong> Input your product description and user journeys</li>
          <li><strong>Process:</strong> AI analyzes and extracts relevant tracking events</li>
          <li><strong>Review:</strong> Validate and refine the generated event dictionary</li>
          <li><strong>Edit:</strong> Fine-tune events, properties, and requirements</li>
          <li><strong>Export:</strong> Download in your preferred format for implementation</li>
        </ol>

        <h2>Privacy & Quality</h2>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 not-prose">
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
            <strong>⚠️ Important:</strong> This is an MVP with limited quality guarantees.
          </p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
            <li>Data is processed via OpenAI API - review their privacy policy</li>
            <li>No PII protections in this MVP version</li>
            <li>Always review and validate AI outputs before implementation</li>
            <li>Test generated events in staging before production use</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center">
        <Link 
          to="/" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}