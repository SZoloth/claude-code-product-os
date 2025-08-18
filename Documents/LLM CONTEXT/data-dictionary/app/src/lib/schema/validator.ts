/**
 * Schema validation utilities using JSON Schema
 * Validates data dictionary events against Section 7 requirements
 */

const Ajv = require('ajv')
const addFormats = require('ajv-formats')
import { 
  DataDictionary, 
  DataDictionaryEvent, 
  EventProperty 
} from './dataDictionary'
import {
  dataDictionarySchema,
  dataDictionaryEventSchema,
  eventPropertySchema,
  validationRules,
  getCsvColumnHeaders,
  getRequiredCsvColumns
} from './jsonSchema'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  value?: any
  severity: 'error' | 'warning'
}

export interface ValidationWarning extends ValidationError {
  severity: 'warning'
}

export class DataDictionaryValidator {
  private ajv: any
  private dataDictionaryValidator: any
  private eventValidator: any
  private propertyValidator: any

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true
    })
    
    // Add format validation
    addFormats(this.ajv)
    
    // Compile validators
    this.dataDictionaryValidator = this.ajv.compile(dataDictionarySchema)
    this.eventValidator = this.ajv.compile(dataDictionaryEventSchema)
    this.propertyValidator = this.ajv.compile(eventPropertySchema)
  }

  /**
   * Validate complete data dictionary
   */
  validateDataDictionary(dataDictionary: DataDictionary): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // JSON Schema validation
    const isSchemaValid = this.dataDictionaryValidator(dataDictionary)
    if (!isSchemaValid && this.dataDictionaryValidator.errors) {
      this.dataDictionaryValidator.errors.forEach(error => {
        errors.push({
          field: error.instancePath || 'root',
          message: `${error.message} (${error.schemaPath})`,
          value: error.data,
          severity: 'error'
        })
      })
    }

    // Custom validation rules
    this.validateUniqueEventNames(dataDictionary, errors)
    this.validateEventNaming(dataDictionary, errors, warnings)
    this.validateFailureEventRequirements(dataDictionary, errors, warnings)
    this.validateDatadogApiMapping(dataDictionary, warnings)
    this.validateContextRequirements(dataDictionary, warnings)

    return {
      isValid: errors.length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: warnings
    }
  }

  /**
   * Validate individual event
   */
  validateEvent(event: DataDictionaryEvent): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // JSON Schema validation
    const isSchemaValid = this.eventValidator(event)
    if (!isSchemaValid && this.eventValidator.errors) {
      this.eventValidator.errors.forEach(error => {
        errors.push({
          field: error.instancePath || event.event_name,
          message: error.message || 'Validation error',
          value: error.data,
          severity: 'error'
        })
      })
    }

    // Validate properties
    event.properties.forEach((property, index) => {
      const propertyResult = this.validateProperty(property, `${event.event_name}.properties[${index}]`)
      errors.push(...propertyResult.errors)
      warnings.push(...propertyResult.warnings)
    })

    return {
      isValid: errors.length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: warnings
    }
  }

  /**
   * Validate individual property
   */
  validateProperty(property: EventProperty, context = ''): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // JSON Schema validation
    const isSchemaValid = this.propertyValidator(property)
    if (!isSchemaValid && this.propertyValidator.errors) {
      this.propertyValidator.errors.forEach(error => {
        errors.push({
          field: context + '.' + (error.instancePath || property.name),
          message: error.message || 'Property validation error',
          value: error.data,
          severity: 'error'
        })
      })
    }

    // Snake case validation
    if (!validationRules.snakeCasePattern.test(property.name)) {
      errors.push({
        field: `${context}.name`,
        message: 'Property name must be in snake_case format',
        value: property.name,
        severity: 'error'
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: warnings
    }
  }

  /**
   * Validate CSV export compatibility
   */
  validateCsvCompatibility(dataDictionary: DataDictionary): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    const requiredColumns = getRequiredCsvColumns()
    const allColumns = getCsvColumnHeaders()

    dataDictionary.events.forEach(event => {
      // Check required columns
      requiredColumns.forEach(column => {
        const value = (event as any)[column]
        if (value === undefined || value === null || value === '') {
          errors.push({
            field: `${event.event_name}.${column}`,
            message: `Required CSV column '${column}' is missing or empty`,
            value,
            severity: 'error'
          })
        }
      })

      // Check for fields that need JSON serialization
      if (event.properties && event.properties.length > 0) {
        try {
          JSON.stringify(event.properties)
        } catch (e) {
          errors.push({
            field: `${event.event_name}.properties`,
            message: 'Properties cannot be serialized to JSON for CSV export',
            value: event.properties,
            severity: 'error'
          })
        }
      }

      if (event.context_keys && event.context_keys.length > 0) {
        try {
          JSON.stringify(event.context_keys)
        } catch (e) {
          errors.push({
            field: `${event.event_name}.context_keys`,
            message: 'Context keys cannot be serialized to JSON for CSV export',
            value: event.context_keys,
            severity: 'error'
          })
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: warnings
    }
  }

  /**
   * Validate event name uniqueness
   */
  private validateUniqueEventNames(dataDictionary: DataDictionary, errors: ValidationError[]): void {
    const seen = new Set<string>()
    const duplicates = new Set<string>()

    dataDictionary.events.forEach(event => {
      if (seen.has(event.event_name)) {
        duplicates.add(event.event_name)
      }
      seen.add(event.event_name)
    })

    duplicates.forEach(name => {
      errors.push({
        field: `events.event_name`,
        message: `Duplicate event name '${name}' found`,
        value: name,
        severity: 'error'
      })
    })
  }

  /**
   * Validate snake_case naming conventions
   */
  private validateEventNaming(
    dataDictionary: DataDictionary, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    dataDictionary.events.forEach(event => {
      // Event name validation
      if (!validationRules.snakeCasePattern.test(event.event_name)) {
        errors.push({
          field: `${event.event_name}.event_name`,
          message: 'Event name must be in snake_case format',
          value: event.event_name,
          severity: 'error'
        })
      }

      // Property name validation - snake_case and uniqueness
      const propertyNames = new Set<string>()
      const duplicateProperties = new Set<string>()
      
      event.properties.forEach(property => {
        // Snake case validation
        if (!validationRules.snakeCasePattern.test(property.name)) {
          errors.push({
            field: `${event.event_name}.properties.${property.name}`,
            message: 'Property name must be in snake_case format',
            value: property.name,
            severity: 'error'
          })
        }
        
        // Uniqueness validation
        if (propertyNames.has(property.name)) {
          duplicateProperties.add(property.name)
        }
        propertyNames.add(property.name)
      })
      
      // Report duplicates
      duplicateProperties.forEach(name => {
        errors.push({
          field: `${event.event_name}.properties.${name}`,
          message: `Duplicate property name '${name}' found within event`,
          value: name,
          severity: 'error'
        })
      })
    })
  }

  /**
   * Validate failure event requirements
   */
  private validateFailureEventRequirements(
    dataDictionary: DataDictionary, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    dataDictionary.events
      .filter(event => event.event_type === 'failure')
      .forEach(event => {
        const hasErrorCode = event.error_code && event.error_code.trim().length > 0
        const hasErrorMessage = event.error_message && event.error_message.trim().length > 0
        const hasErrorProperty = event.properties.some(p => 
          p.name.includes('error') || p.name.includes('reason')
        )
        const hasNotes = event.notes && event.notes.trim().length > 0

        if (!hasErrorCode && !hasErrorMessage && !hasErrorProperty && !hasNotes) {
          warnings.push({
            field: `${event.event_name}`,
            message: 'Failure events should include error_code, error_message, error-related properties, or explanatory notes',
            value: event.event_type,
            severity: 'warning'
          })
        }
      })
  }

  /**
   * Validate Datadog API mapping consistency
   */
  private validateDatadogApiMapping(dataDictionary: DataDictionary, warnings: ValidationWarning[]): void {
    dataDictionary.events.forEach(event => {
      const expectedApi = this.getExpectedDatadogApi(event)
      if (expectedApi && event.datadog_api !== expectedApi) {
        warnings.push({
          field: `${event.event_name}.datadog_api`,
          message: `Expected '${expectedApi}' but got '${event.datadog_api}' based on event_type='${event.event_type}' and event_action_type='${event.event_action_type}'`,
          value: event.datadog_api,
          severity: 'warning'
        })
      }
    })
  }

  /**
   * Validate minimum context requirements
   */
  private validateContextRequirements(dataDictionary: DataDictionary, warnings: ValidationWarning[]): void {
    dataDictionary.events.forEach(event => {
      const minProperties = validationRules.minimumProperties[event.event_type]
      if (event.properties.length < minProperties) {
        warnings.push({
          field: `${event.event_name}.properties`,
          message: `${event.event_type} events should have at least ${minProperties} context properties for meaningful segmentation`,
          value: event.properties.length,
          severity: 'warning'
        })
      }
    })
  }

  /**
   * Get expected Datadog API based on event types
   */
  private getExpectedDatadogApi(event: DataDictionaryEvent): string | null {
    if (event.event_action_type === 'feature_flag') {
      return 'addFeatureFlagEvaluation'
    }
    if (event.event_action_type === 'error') {
      return 'addError'
    }
    if (event.event_action_type === 'action' && event.event_type === 'failure') {
      return 'addError'
    }
    if (event.event_action_type === 'action' && (event.event_type === 'intent' || event.event_type === 'success')) {
      return 'addAction'
    }
    return null
  }
}

// Export singleton instance
export const validator = new DataDictionaryValidator()

// Export validation utility functions
export function validateDataDictionary(dataDictionary: DataDictionary): ValidationResult {
  return validator.validateDataDictionary(dataDictionary)
}

export function validateEvent(event: DataDictionaryEvent): ValidationResult {
  return validator.validateEvent(event)
}

export function validateProperty(property: EventProperty): ValidationResult {
  return validator.validateProperty(property)
}

export function validateCsvCompatibility(dataDictionary: DataDictionary): ValidationResult {
  return validator.validateCsvCompatibility(dataDictionary)
}