/**
 * ValidationBanner component for displaying validation status and errors
 */

import type { DataDictionary } from '../lib/schema/dataDictionary'
import { ValidationUtils } from '../lib/schema/validationUtils'

interface ValidationBannerProps {
  dictionary: DataDictionary
  className?: string
}

export default function ValidationBanner({ dictionary, className = '' }: ValidationBannerProps) {
  const status = ValidationUtils.getValidationStatus(dictionary)
  const validation = ValidationUtils.validateDictionaryForUI(dictionary)

  const getStatusStyles = () => {
    switch (status.status) {
      case 'valid':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'valid':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={`rounded-md border p-4 ${getStatusStyles()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-1">
            Validation Status
          </div>
          <div className="text-sm mb-3">
            {status.message}
          </div>

          {validation.summary.criticalIssues.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Critical Issues:</div>
              <ul className="text-xs list-disc list-inside space-y-1">
                {validation.summary.criticalIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.summary.totalErrors > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">
                {validation.summary.totalErrors} Error{validation.summary.totalErrors === 1 ? '' : 's'}:
              </div>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {validation.errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="break-words">
                    <span className="font-mono text-red-600">
                      {ValidationUtils['extractEventName'](error.field) || error.field}
                    </span>
                    : {ValidationUtils['formatErrorMessage'](error.message)}
                  </div>
                ))}
                {validation.errors.length > 5 && (
                  <div className="text-gray-600">
                    ... and {validation.errors.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {validation.summary.totalWarnings > 0 && (
            <div className="mb-2">
              <div className="text-sm font-medium mb-1">
                {validation.summary.totalWarnings} Recommendation{validation.summary.totalWarnings === 1 ? '' : 's'}:
              </div>
              <div className="text-xs space-y-1">
                {validation.warnings.slice(0, 3).map((warning, index) => (
                  <div key={index} className="break-words">
                    <span className="font-mono text-yellow-600">
                      {ValidationUtils['extractEventName'](warning.field) || warning.field}
                    </span>
                    : {warning.message}
                  </div>
                ))}
                {validation.warnings.length > 3 && (
                  <div className="text-gray-600">
                    ... and {validation.warnings.length - 3} more recommendations
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Error Summary */}
      {Object.keys(validation.summary.eventErrorCount).length > 0 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="text-sm font-medium mb-2">Events with Issues:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(validation.summary.eventErrorCount).map(([eventName, count]) => (
              <span
                key={eventName}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50"
              >
                <span className="font-mono">{eventName}</span>
                <span className="ml-1 text-red-600">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to extract private methods for testing (hack for demo purposes)
// In production, these would be public static methods
// Note: Commented out to avoid unused variable error
// const privateMethodsForTesting = {
//   extractEventName: ValidationUtils['extractEventName'] as any,
//   formatErrorMessage: ValidationUtils['formatErrorMessage'] as any
// }