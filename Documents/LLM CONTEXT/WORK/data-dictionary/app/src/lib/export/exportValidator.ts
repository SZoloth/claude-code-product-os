/**
 * Export validation utilities
 * Validates exports against schema and provides import functionality
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'
import { ValidationUtils } from '../schema/validationUtils'
import { validateDataDictionary } from '../schema/validator'
import { getCsvColumnHeaders, csvColumnSchema } from '../schema/jsonSchema'

export interface ExportValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  format: 'csv' | 'json' | 'markdown' | 'typescript'
  eventCount: number
  validEventCount: number
  schemaCompliance: {
    hasRequiredFields: boolean
    hasValidNaming: boolean
    hasValidEnums: boolean
    csvCompatible: boolean
  }
}

export interface ImportResult {
  success: boolean
  dictionary?: DataDictionary
  events?: DataDictionaryEvent[]
  errors: string[]
  warnings: string[]
  format: 'csv' | 'json'
  originalEventCount: number
  importedEventCount: number
}

export class ExportValidator {
  /**
   * Validate exported data dictionary against schema
   */
  static validateExport(data: string, format: 'csv' | 'json' | 'markdown' | 'typescript'): ExportValidationResult {
    const result: ExportValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      format,
      eventCount: 0,
      validEventCount: 0,
      schemaCompliance: {
        hasRequiredFields: false,
        hasValidNaming: false,
        hasValidEnums: false,
        csvCompatible: false
      }
    }

    try {
      switch (format) {
        case 'csv':
          return this.validateCsvExport(data)
        case 'json':
          return this.validateJsonExport(data)
        case 'markdown':
          return this.validateMarkdownExport(data)
        case 'typescript':
          return this.validateTypescriptExport(data)
        default:
          result.errors.push(`Unsupported format: ${format}`)
          return result
      }
    } catch (error) {
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Import and validate CSV data
   */
  static importFromCsv(csvData: string): ImportResult {
    const result: ImportResult = {
      success: false,
      errors: [],
      warnings: [],
      format: 'csv',
      originalEventCount: 0,
      importedEventCount: 0
    }

    try {
      const lines = csvData.trim().split('\n')
      if (lines.length < 2) {
        result.errors.push('CSV must have at least a header row and one data row')
        return result
      }

      // Parse header
      const headers = this.parseCsvRow(lines[0])
      const expectedHeaders = getCsvColumnHeaders()
      
      // Validate headers
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
      }

      // Parse data rows
      const events: DataDictionaryEvent[] = []
      result.originalEventCount = lines.length - 1

      for (let i = 1; i < lines.length; i++) {
        try {
          const row = this.parseCsvRow(lines[i])
          if (row.length === 0) continue // Skip empty rows

          const event = this.csvRowToEvent(headers, row)
          if (event) {
            events.push(event)
          }
        } catch (error) {
          result.warnings.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
        }
      }

      result.importedEventCount = events.length

      // Create dictionary
      const dictionary: DataDictionary = {
        version: '1.0.0',
        generatedAtIso: new Date().toISOString(),
        events
      }

      // Validate against schema
      const validation = validateDataDictionary(dictionary)
      result.errors.push(...validation.errors.map(e => e.message))
      result.warnings.push(...validation.warnings.map(w => w.message))

      if (validation.errors.length === 0) {
        result.success = true
        result.dictionary = dictionary
        result.events = events
      }

      return result
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Import and validate JSON data
   */
  static importFromJson(jsonData: string): ImportResult {
    const result: ImportResult = {
      success: false,
      errors: [],
      warnings: [],
      format: 'json',
      originalEventCount: 0,
      importedEventCount: 0
    }

    try {
      const data = JSON.parse(jsonData)
      
      // Handle different JSON formats
      let dictionary: DataDictionary

      if (data.project && data.project.data) {
        // Project export format
        dictionary = data.project.data
      } else if (data.events && Array.isArray(data.events)) {
        // Direct dictionary format
        dictionary = data
      } else if (Array.isArray(data)) {
        // Just events array
        dictionary = {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: data
        }
      } else {
        result.errors.push('Invalid JSON format. Expected dictionary, project, or events array.')
        return result
      }

      result.originalEventCount = dictionary.events.length
      result.importedEventCount = dictionary.events.length

      // Validate against schema
      const validation = validateDataDictionary(dictionary)
      result.errors.push(...validation.errors.map(e => e.message))
      result.warnings.push(...validation.warnings.map(w => w.message))

      if (validation.errors.length === 0) {
        result.success = true
        result.dictionary = dictionary
        result.events = dictionary.events
      }

      return result
    } catch (error) {
      result.errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
      return result
    }
  }

  /**
   * Validate CSV export format
   */
  private static validateCsvExport(csvData: string): ExportValidationResult {
    const result: ExportValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      format: 'csv',
      eventCount: 0,
      validEventCount: 0,
      schemaCompliance: {
        hasRequiredFields: false,
        hasValidNaming: false,
        hasValidEnums: false,
        csvCompatible: true
      }
    }

    const lines = csvData.trim().split('\n')
    if (lines.length < 2) {
      result.errors.push('CSV must have at least header and one data row')
      return result
    }

    // Check headers
    const headers = this.parseCsvRow(lines[0])
    const requiredHeaders = Object.entries(csvColumnSchema)
      .filter(([, config]) => config.required)
      .map(([name]) => name)

    const missingRequired = requiredHeaders.filter(h => !headers.includes(h))
    if (missingRequired.length === 0) {
      result.schemaCompliance.hasRequiredFields = true
    } else {
      result.errors.push(`Missing required columns: ${missingRequired.join(', ')}`)
    }

    // Validate data rows
    result.eventCount = lines.length - 1
    let validEvents = 0
    let hasValidNaming = true
    let hasValidEnums = true

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = this.parseCsvRow(lines[i])
        if (row.length === 0) continue

        const event = this.csvRowToEvent(headers, row)
        if (event) {
          const eventValidation = ValidationUtils.validateEventForUI(event)
          if (eventValidation.isValid) {
            validEvents++
          } else {
            // Check for specific error types in field errors
            Object.values(eventValidation.fieldErrors).forEach(fieldError => {
              if (fieldError.error && fieldError.error.includes('snake_case')) hasValidNaming = false
              if (fieldError.error && (fieldError.error.includes('enum') || fieldError.error.includes('invalid'))) hasValidEnums = false
            })
          }
        }
      } catch (error) {
        result.warnings.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
      }
    }

    result.validEventCount = validEvents
    result.schemaCompliance.hasValidNaming = hasValidNaming
    result.schemaCompliance.hasValidEnums = hasValidEnums

    result.isValid = result.errors.length === 0 && validEvents > 0

    return result
  }

  /**
   * Validate JSON export format
   */
  private static validateJsonExport(jsonData: string): ExportValidationResult {
    const result: ExportValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      format: 'json',
      eventCount: 0,
      validEventCount: 0,
      schemaCompliance: {
        hasRequiredFields: false,
        hasValidNaming: false,
        hasValidEnums: false,
        csvCompatible: false
      }
    }

    try {
      const data = JSON.parse(jsonData)
      
      let dictionary: DataDictionary
      if (data.project && data.project.data) {
        dictionary = data.project.data
      } else if (data.events) {
        dictionary = data
      } else {
        result.errors.push('Invalid JSON structure')
        return result
      }

      result.eventCount = dictionary.events.length

      // Validate against schema
      const validation = validateDataDictionary(dictionary)
      result.errors.push(...validation.errors.map(e => e.message))
      result.warnings.push(...validation.warnings.map(w => w.message))

      // Check schema compliance
      result.schemaCompliance.hasRequiredFields = validation.errors.filter(e => 
        e.message.includes('required')).length === 0
      result.schemaCompliance.hasValidNaming = validation.errors.filter(e => 
        e.message.includes('snake_case')).length === 0
      result.schemaCompliance.hasValidEnums = validation.errors.filter(e => 
        e.message.includes('enum') || e.message.includes('invalid')).length === 0

      result.validEventCount = dictionary.events.filter(event => {
        const eventValidation = ValidationUtils.validateEventForUI(event)
        return eventValidation.isValid
      }).length

      result.isValid = validation.errors.length === 0

      return result
    } catch (error) {
      result.errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
      return result
    }
  }

  /**
   * Validate Markdown export (basic structure check)
   */
  private static validateMarkdownExport(markdownData: string): ExportValidationResult {
    const result: ExportValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      format: 'markdown',
      eventCount: 0,
      validEventCount: 0,
      schemaCompliance: {
        hasRequiredFields: true,
        hasValidNaming: true,
        hasValidEnums: true,
        csvCompatible: false
      }
    }

    // Basic markdown structure validation
    if (!markdownData.includes('# Data Dictionary')) {
      result.warnings.push('Missing main title')
    }

    if (!markdownData.includes('## Table of Contents')) {
      result.warnings.push('Missing table of contents')
    }

    // Count events by looking for event headers
    const eventHeaders = markdownData.match(/###\s+\w+/g)
    result.eventCount = eventHeaders ? eventHeaders.length : 0
    result.validEventCount = result.eventCount // Assume all are valid for markdown

    if (result.eventCount === 0) {
      result.warnings.push('No events found in markdown')
    }

    return result
  }

  /**
   * Validate TypeScript export (basic syntax check)
   */
  private static validateTypescriptExport(typescriptData: string): ExportValidationResult {
    const result: ExportValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      format: 'typescript',
      eventCount: 0,
      validEventCount: 0,
      schemaCompliance: {
        hasRequiredFields: true,
        hasValidNaming: true,
        hasValidEnums: true,
        csvCompatible: false
      }
    }

    // Basic TypeScript structure validation
    if (!typescriptData.includes('datadogRum')) {
      result.errors.push('Missing Datadog RUM integration')
      result.isValid = false
    }

    if (!typescriptData.includes('export function')) {
      result.errors.push('Missing exported functions')
      result.isValid = false
    }

    // Count functions
    const functionMatches = typescriptData.match(/export function track\w+/g)
    result.eventCount = functionMatches ? functionMatches.length : 0
    result.validEventCount = result.eventCount // Assume all are valid for TS

    if (result.eventCount === 0) {
      result.warnings.push('No tracking functions found')
    }

    return result
  }

  /**
   * Parse CSV row handling quoted values
   */
  private static parseCsvRow(row: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i]
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  /**
   * Convert CSV row to event object
   */
  private static csvRowToEvent(headers: string[], row: string[]): DataDictionaryEvent | null {
    if (row.length === 0) return null

    const event: any = {}
    
    for (let i = 0; i < headers.length && i < row.length; i++) {
      const header = headers[i]
      const value = row[i]
      
      if (!value || value.trim() === '') continue
      
      const columnConfig = csvColumnSchema[header as keyof typeof csvColumnSchema]
      
      if (columnConfig && 'serialized' in columnConfig && columnConfig.serialized) {
        // Parse JSON fields
        try {
          event[header] = JSON.parse(value)
        } catch {
          // If JSON parse fails, treat as empty array/object
          event[header] = header === 'properties' ? [] : []
        }
      } else {
        event[header] = value
      }
    }

    // Ensure required fields have defaults
    if (!event.properties) event.properties = []
    if (!event.context_keys) event.context_keys = []
    if (!event.event_type) event.event_type = 'intent'
    if (!event.event_action_type) event.event_action_type = 'action'
    if (!event.lifecycle_status) event.lifecycle_status = 'proposed'
    if (!event.datadog_api) event.datadog_api = 'addAction'

    return event as DataDictionaryEvent
  }

  /**
   * Generate validation report
   */
  static generateValidationReport(validation: ExportValidationResult): string {
    const lines = [
      `# Export Validation Report`,
      ``,
      `**Format:** ${validation.format.toUpperCase()}`,
      `**Status:** ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`,
      `**Events:** ${validation.validEventCount}/${validation.eventCount} valid`,
      ``
    ]

    if (validation.schemaCompliance) {
      lines.push(
        `## Schema Compliance`,
        ``,
        `- Required Fields: ${validation.schemaCompliance.hasRequiredFields ? '✅' : '❌'}`,
        `- Valid Naming: ${validation.schemaCompliance.hasValidNaming ? '✅' : '❌'}`,
        `- Valid Enums: ${validation.schemaCompliance.hasValidEnums ? '✅' : '❌'}`,
        `- CSV Compatible: ${validation.schemaCompliance.csvCompatible ? '✅' : '❌'}`,
        ``
      )
    }

    if (validation.errors.length > 0) {
      lines.push(
        `## Errors`,
        ``,
        ...validation.errors.map(error => `- ❌ ${error}`),
        ``
      )
    }

    if (validation.warnings.length > 0) {
      lines.push(
        `## Warnings`,
        ``,
        ...validation.warnings.map(warning => `- ⚠️ ${warning}`),
        ``
      )
    }

    if (validation.isValid) {
      lines.push(
        `## Next Steps`,
        ``,
        `Your export is valid and ready for use:`,
        ``,
        `- **CSV:** Import into Excel, Google Sheets, or data analysis tools`,
        `- **JSON:** Use for project backups or system integration`,
        `- **Markdown:** Share as documentation or convert to PDF`,
        `- **TypeScript:** Copy functions into your application code`,
        ``
      )
    }

    return lines.join('\n')
  }
}