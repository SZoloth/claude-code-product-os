/**
 * UI validation utilities for data dictionary editing
 * Provides easy-to-use validation functions and error formatting for UI components
 */

import { DataDictionary, DataDictionaryEvent, EventProperty } from './dataDictionary'
import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  validateDataDictionary,
  validateEvent,
  validateProperty,
  validateCsvCompatibility
} from './validator'

export interface FieldValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

export interface FormValidationState {
  [fieldName: string]: FieldValidationResult
}

/**
 * Validation utilities for UI components
 */
export class ValidationUtils {
  
  /**
   * Validate a single field value in real-time
   */
  static validateField(fieldName: string, value: any, context: any = {}): FieldValidationResult {
    switch (fieldName) {
      case 'event_name':
        return this.validateEventName(value, context.existingNames)
      
      case 'property_name':
        return this.validatePropertyName(value, context.existingNames)
      
      case 'event_type':
        return this.validateEnum(value, ['intent', 'success', 'failure'], 'Event type')
      
      case 'event_action_type':
        return this.validateEnum(value, ['action', 'error', 'feature_flag'], 'Event action type')
      
      case 'lifecycle_status':
        return this.validateEnum(value, ['proposed', 'approved', 'implemented', 'deprecated'], 'Lifecycle status')
      
      case 'property_type':
        return this.validateEnum(value, ['string', 'number', 'boolean', 'enum', 'object', 'array', 'datetime'], 'Property type')
      
      case 'event_purpose':
        return this.validateTextLength(value, 'Event purpose', 20, 500)
      
      case 'when_to_fire':
        return this.validateTextLength(value, 'When to fire', 10, 300)
        
      default:
        return { isValid: true }
    }
  }

  /**
   * Validate event name format and uniqueness
   */
  private static validateEventName(value: string, existingNames: string[] = []): FieldValidationResult {
    if (!value) {
      return { isValid: false, error: 'Event name is required' }
    }

    if (value.length < 3) {
      return { isValid: false, error: 'Event name must be at least 3 characters' }
    }

    if (value.length > 64) {
      return { isValid: false, error: 'Event name must be 64 characters or less' }
    }

    const snakeCasePattern = /^[a-z][a-z0-9_]*[a-z0-9]$/
    if (!snakeCasePattern.test(value)) {
      return { 
        isValid: false, 
        error: 'Event name must be in snake_case format (lowercase letters, numbers, underscores only)' 
      }
    }

    if (existingNames.includes(value)) {
      return { isValid: false, error: 'Event name must be unique' }
    }

    return { isValid: true }
  }

  /**
   * Validate property name format and uniqueness within event
   */
  private static validatePropertyName(value: string, existingNames: string[] = []): FieldValidationResult {
    if (!value) {
      return { isValid: false, error: 'Property name is required' }
    }

    if (value.length < 2) {
      return { isValid: false, error: 'Property name must be at least 2 characters' }
    }

    if (value.length > 64) {
      return { isValid: false, error: 'Property name must be 64 characters or less' }
    }

    const snakeCasePattern = /^[a-z][a-z0-9_]*[a-z0-9]$/
    if (!snakeCasePattern.test(value)) {
      return { 
        isValid: false, 
        error: 'Property name must be in snake_case format (lowercase letters, numbers, underscores only)' 
      }
    }

    if (existingNames.includes(value)) {
      return { isValid: false, error: 'Property name must be unique within this event' }
    }

    return { isValid: true }
  }

  /**
   * Validate enum values
   */
  private static validateEnum(value: string, allowedValues: string[], fieldName: string): FieldValidationResult {
    if (!value) {
      return { isValid: false, error: `${fieldName} is required` }
    }

    if (!allowedValues.includes(value)) {
      return { 
        isValid: false, 
        error: `${fieldName} must be one of: ${allowedValues.join(', ')}` 
      }
    }

    return { isValid: true }
  }

  /**
   * Validate text length requirements
   */
  private static validateTextLength(
    value: string, 
    fieldName: string, 
    minLength: number, 
    maxLength: number
  ): FieldValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` }
    }

    const trimmed = value.trim()
    
    if (trimmed.length < minLength) {
      return { 
        isValid: false, 
        error: `${fieldName} must be at least ${minLength} characters` 
      }
    }

    if (trimmed.length > maxLength) {
      return { 
        isValid: false, 
        error: `${fieldName} must be ${maxLength} characters or less` 
      }
    }

    return { isValid: true }
  }

  /**
   * Validate complete event and return UI-friendly errors
   */
  static validateEventForUI(event: DataDictionaryEvent): {
    isValid: boolean
    fieldErrors: FormValidationState
    warnings: ValidationWarning[]
  } {
    const result = validateEvent(event)
    const fieldErrors: FormValidationState = {}

    // Convert validation errors to field-specific errors
    result.errors.forEach(error => {
      const fieldName = this.extractFieldName(error.field)
      fieldErrors[fieldName] = {
        isValid: false,
        error: this.formatErrorMessage(error.message)
      }
    })

    // Set valid state for fields without errors
    const eventFields = [
      'event_name', 'event_type', 'event_action_type', 'event_purpose',
      'when_to_fire', 'actor', 'object', 'context_surface', 'lifecycle_status'
    ]
    
    eventFields.forEach(field => {
      if (!fieldErrors[field]) {
        fieldErrors[field] = { isValid: true }
      }
    })

    return {
      isValid: result.isValid,
      fieldErrors,
      warnings: result.warnings
    }
  }

  /**
   * Validate complete data dictionary and return summary
   */
  static validateDictionaryForUI(dictionary: DataDictionary): {
    isValid: boolean
    summary: {
      totalErrors: number
      totalWarnings: number
      eventErrorCount: { [eventName: string]: number }
      criticalIssues: string[]
    }
    errors: ValidationError[]
    warnings: ValidationWarning[]
  } {
    const result = validateDataDictionary(dictionary)
    const csvResult = validateCsvCompatibility(dictionary)

    // Combine validation results
    const allErrors = [...result.errors, ...csvResult.errors]
    const allWarnings = [...result.warnings, ...csvResult.warnings]

    // Count errors per event
    const eventErrorCount: { [eventName: string]: number } = {}
    allErrors.forEach(error => {
      const eventName = this.extractEventName(error.field)
      if (eventName) {
        eventErrorCount[eventName] = (eventErrorCount[eventName] || 0) + 1
      }
    })

    // Identify critical issues
    const criticalIssues: string[] = []
    if (allErrors.some(e => e.message.includes('Duplicate event name'))) {
      criticalIssues.push('Duplicate event names found')
    }
    if (allErrors.some(e => e.message.includes('snake_case'))) {
      criticalIssues.push('Invalid naming convention')
    }
    if (allErrors.some(e => e.message.includes('required'))) {
      criticalIssues.push('Missing required fields')
    }
    if (!csvResult.isValid) {
      criticalIssues.push('CSV export compatibility issues')
    }

    return {
      isValid: allErrors.length === 0,
      summary: {
        totalErrors: allErrors.length,
        totalWarnings: allWarnings.length,
        eventErrorCount,
        criticalIssues
      },
      errors: allErrors,
      warnings: allWarnings
    }
  }

  /**
   * Get validation status for data dictionary with user-friendly messages
   */
  static getValidationStatus(dictionary: DataDictionary): {
    status: 'valid' | 'warning' | 'error'
    message: string
    canExport: boolean
  } {
    const validation = this.validateDictionaryForUI(dictionary)

    if (validation.isValid) {
      if (validation.warnings.length > 0) {
        return {
          status: 'warning',
          message: `Ready to export with ${validation.warnings.length} recommendation${validation.warnings.length === 1 ? '' : 's'}`,
          canExport: true
        }
      } else {
        return {
          status: 'valid',
          message: 'All validation checks passed - ready to export',
          canExport: true
        }
      }
    } else {
      const errorCount = validation.summary.totalErrors
      return {
        status: 'error',
        message: `${errorCount} validation error${errorCount === 1 ? '' : 's'} must be fixed before export`,
        canExport: false
      }
    }
  }

  /**
   * Extract field name from validation error field path
   */
  private static extractFieldName(fieldPath: string): string {
    // Remove leading slash and extract the field name
    const path = fieldPath.replace(/^\/+/, '')
    const parts = path.split('.')
    return parts[parts.length - 1] || path
  }

  /**
   * Extract event name from validation error field path
   */
  private static extractEventName(fieldPath: string): string | null {
    if (fieldPath.includes('.')) {
      const eventName = fieldPath.split('.')[0]
      return eventName.replace(/^\/+/, '') // Remove leading slash
    }
    return null
  }

  /**
   * Format error message for UI display
   */
  private static formatErrorMessage(message: string): string {
    // Convert AJV error messages to user-friendly messages
    if (message.includes('must match pattern')) {
      return 'Must use snake_case format (lowercase letters, numbers, underscores only)'
    }
    if (message.includes('must be equal to one of the allowed values')) {
      return 'Please select a valid option'
    }
    if (message.includes('must have at least')) {
      return 'At least one item is required'
    }
    if (message.includes('must be')) {
      return message.replace('must be', 'Must be')
    }
    
    // Capitalize first letter
    return message.charAt(0).toUpperCase() + message.slice(1)
  }

  /**
   * Get snake_case suggestions for invalid names
   */
  static suggestSnakeCase(input: string): string {
    return input
      .replace(/([a-z])([A-Z])/g, '$1_$2')  // Insert underscore before capital letters
      .toLowerCase()
      .replace(/\s+/g, '_')                 // Replace spaces with underscores
      .replace(/[-@#$%^&*()+={}[\]|\\:";'<>?,.\/]/g, '_') // Replace special chars with underscores
      .replace(/[^a-z0-9_]/g, '')           // Remove any remaining invalid characters
      .replace(/_+/g, '_')                  // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '')              // Remove leading/trailing underscores
      .replace(/^([0-9])/, 'n$1')           // Prefix numbers at start with 'n'
  }
}

/**
 * React hook-friendly validation helpers
 */
export const useValidation = {
  /**
   * Validate field on change with debouncing-friendly result
   */
  validateField: (fieldName: string, value: any, context: any = {}) => {
    return ValidationUtils.validateField(fieldName, value, context)
  },

  /**
   * Get validation state for form fields
   */
  getFormValidation: (event: DataDictionaryEvent) => {
    return ValidationUtils.validateEventForUI(event)
  },

  /**
   * Get overall validation status
   */
  getStatus: (dictionary: DataDictionary) => {
    return ValidationUtils.getValidationStatus(dictionary)
  }
}