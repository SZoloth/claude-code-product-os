/**
 * ValidatedField component with real-time validation feedback
 */

import { useState, useEffect } from 'react'
import { ValidationUtils } from '../lib/schema/validationUtils'

interface ValidatedFieldProps {
  type?: 'input' | 'textarea' | 'select'
  fieldName: string
  value: string
  onChange: (value: string) => void
  label: string
  required?: boolean
  placeholder?: string
  options?: string[]
  context?: any
  className?: string
  rows?: number
}

export default function ValidatedField({
  type = 'input',
  fieldName,
  value,
  onChange,
  label,
  required = false,
  placeholder,
  options,
  context,
  className = '',
  rows = 3
}: ValidatedFieldProps) {
  const [validation, setValidation] = useState(ValidationUtils.validateField(fieldName, value, context))
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(() => {
    const result = ValidationUtils.validateField(fieldName, value, context)
    setValidation(result)
    
    // Show snake_case suggestion for naming fields
    const isNamingField = fieldName === 'event_name' || fieldName === 'property_name'
    setShowSuggestion(isNamingField && !result.isValid && value.length > 0)
  }, [fieldName, value, context])

  const getSuggestion = () => {
    if (!showSuggestion) return null
    const suggestion = ValidationUtils.suggestSnakeCase(value)
    if (suggestion === value || !suggestion) return null
    return suggestion
  }

  const getFieldStyles = () => {
    const baseStyles = 'field-input text-sm'
    if (!validation.isValid) {
      return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-500`
    }
    if (validation.warning) {
      return `${baseStyles} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500`
    }
    return baseStyles
  }

  const handleChange = (newValue: string) => {
    onChange(newValue)
  }

  const applySuggestion = () => {
    const suggestion = getSuggestion()
    if (suggestion) {
      handleChange(suggestion)
    }
  }

  const renderField = () => {
    const commonProps = {
      id: fieldName,
      name: fieldName,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(e.target.value),
      className: getFieldStyles(),
      placeholder,
      'aria-describedby': validation.isValid ? undefined : `${fieldName}-error`,
      'aria-invalid': !validation.isValid
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        )
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map(option => (
              <option key={option} value={option}>
                {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type="text"
            {...commonProps}
          />
        )
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {renderField()}
      
      {/* Error Message */}
      {!validation.isValid && validation.error && (
        <div id={`${fieldName}-error`} className="text-red-600 text-xs" role="alert">
          {validation.error}
        </div>
      )}
      
      {/* Warning Message */}
      {validation.warning && (
        <div className="text-yellow-600 text-xs" role="alert">
          {validation.warning}
        </div>
      )}
      
      {/* Suggestion */}
      {getSuggestion() && (
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <span>Suggested: <code className="bg-blue-50 px-1 py-0.5 rounded">{getSuggestion()}</code></span>
          <button
            type="button"
            onClick={applySuggestion}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Apply
          </button>
        </div>
      )}
      
      {/* Field Help Text */}
      {fieldName === 'event_name' && (
        <div className="text-xs text-gray-500">
          Use snake_case format (e.g., user_login, product_viewed)
        </div>
      )}
      {fieldName === 'property_name' && (
        <div className="text-xs text-gray-500">
          Use snake_case format (e.g., user_id, product_category)
        </div>
      )}
      {fieldName === 'event_purpose' && (
        <div className="text-xs text-gray-500">
          Explain the business value and why this event needs to be tracked (20-500 characters)
        </div>
      )}
    </div>
  )
}