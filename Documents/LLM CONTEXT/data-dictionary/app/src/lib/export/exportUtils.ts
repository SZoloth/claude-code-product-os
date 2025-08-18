/**
 * Export utilities for data dictionary
 * Handles CSV, Markdown, Datadog, and JIRA exports
 */

import type { DataDictionary, DataDictionaryEvent, EventProperty } from '../schema/dataDictionary'
import { csvColumnSchema, getCsvColumnHeaders } from '../schema/jsonSchema'

export interface ExportOptions {
  includeHeaders?: boolean
  includeEmptyColumns?: boolean
  delimiter?: string
  dateFormat?: 'iso' | 'local'
  validateSchema?: boolean
}

export interface CsvExportResult {
  data: string
  filename: string
  headers: string[]
  rowCount: number
  warnings: string[]
}

export interface MarkdownExportResult {
  data: string
  filename: string
  sections: string[]
  eventCount: number
}

export interface DatadogExportResult {
  data: string
  filename: string
  functionCount: number
  apiMethods: string[]
}

export interface JiraExportResult {
  data: string
  filename: string
  ticketCount: number
  estimatedStoryPoints: number
}

export class ExportUtils {
  /**
   * Export data dictionary as CSV matching Section 7 schema
   */
  static exportToCsv(
    dictionary: DataDictionary,
    options: ExportOptions = {}
  ): CsvExportResult {
    const {
      includeHeaders = true,
      includeEmptyColumns = true,
      delimiter = ',',
      validateSchema = true
    } = options

    const headers = getCsvColumnHeaders()
    const warnings: string[] = []
    const rows: string[] = []

    // Add headers if requested
    if (includeHeaders) {
      rows.push(headers.map(header => this.escapeCsvValue(header, delimiter)).join(delimiter))
    }

    // Process each event
    for (const event of dictionary.events) {
      const row: string[] = []

      // Map each column according to schema
      for (const header of headers) {
        const columnConfig = csvColumnSchema[header as keyof typeof csvColumnSchema]
        let value = this.getEventFieldValue(event, header, columnConfig.serialized || false)

        // Handle missing required fields
        if (!value && columnConfig.required) {
          warnings.push(`Event "${event.event_name}": Missing required field "${header}"`)
          value = ''
        }

        // Handle empty optional columns
        if (!value && !includeEmptyColumns && !columnConfig.required) {
          value = ''
        }

        row.push(this.escapeCsvValue(value || '', delimiter))
      }

      rows.push(row.join(delimiter))
    }

    const data = rows.join('\n')
    const filename = this.generateFilename(dictionary, 'csv')

    return {
      data,
      filename,
      headers,
      rowCount: dictionary.events.length,
      warnings
    }
  }

  /**
   * Export data dictionary as Markdown documentation
   */
  static exportToMarkdown(dictionary: DataDictionary): MarkdownExportResult {
    const sections: string[] = []
    let markdown = ''

    // Title and metadata
    markdown += `# Data Dictionary\n\n`
    markdown += `**Generated:** ${new Date(dictionary.generatedAtIso).toLocaleString()}\n\n`
    markdown += `**Version:** ${dictionary.version}\n\n`
    markdown += `**Events:** ${dictionary.events.length}\n\n`
    sections.push('metadata')

    // Table of Contents
    markdown += `## Table of Contents\n\n`
    for (let i = 0; i < dictionary.events.length; i++) {
      const event = dictionary.events[i]
      markdown += `${i + 1}. [${event.event_name}](#${event.event_name.replace(/_/g, '-')})\n`
    }
    markdown += `\n`
    sections.push('toc')

    // Summary statistics
    const stats = this.generateEventStatistics(dictionary.events)
    markdown += `## Summary Statistics\n\n`
    markdown += `| Metric | Count |\n`
    markdown += `|--------|-------|\n`
    markdown += `| Total Events | ${dictionary.events.length} |\n`
    markdown += `| Intent Events | ${stats.intentEvents} |\n`
    markdown += `| Success Events | ${stats.successEvents} |\n`
    markdown += `| Failure Events | ${stats.failureEvents} |\n`
    markdown += `| Implemented Events | ${stats.implementedEvents} |\n`
    markdown += `| Total Properties | ${stats.totalProperties} |\n`
    markdown += `| Average Properties per Event | ${stats.avgProperties} |\n\n`
    sections.push('statistics')

    // Event definitions
    markdown += `## Event Definitions\n\n`
    
    for (const event of dictionary.events) {
      sections.push(`event-${event.event_name}`)
      
      markdown += `### ${event.event_name}\n\n`
      
      // Status badge
      const statusColor = this.getStatusColor(event.lifecycle_status)
      markdown += `**Status:** ![${event.lifecycle_status}](https://img.shields.io/badge/${event.lifecycle_status}-${statusColor})\n\n`
      
      // Basic info
      markdown += `**Purpose:** ${event.event_purpose}\n\n`
      markdown += `**When to Fire:** ${event.when_to_fire}\n\n`
      markdown += `**Type:** ${event.event_type} (${event.event_action_type})\n\n`
      markdown += `**Context:** ${event.actor} → ${event.object} @ ${event.context_surface}\n\n`
      markdown += `**Datadog API:** \`${event.datadog_api}\`\n\n`

      // Properties table
      if (event.properties && event.properties.length > 0) {
        markdown += `#### Properties\n\n`
        markdown += `| Name | Type | Required | Example | Description |\n`
        markdown += `|------|------|----------|---------|-------------|\n`
        
        for (const prop of event.properties) {
          const required = prop.required ? '✅' : '❌'
          const example = prop.example ? `\`${this.formatExampleValue(prop.example)}\`` : ''
          const description = (prop.description || '').replace(/\|/g, '\\|')
          
          markdown += `| \`${prop.name}\` | ${prop.type} | ${required} | ${example} | ${description} |\n`
        }
        markdown += `\n`
      }

      // Context keys
      if (event.context_keys && event.context_keys.length > 0) {
        markdown += `#### Context Keys\n\n`
        markdown += event.context_keys.map(key => `- \`${key}\``).join('\n')
        markdown += `\n\n`
      }

      // Notes
      if (event.notes) {
        markdown += `#### Notes\n\n`
        markdown += `${event.notes}\n\n`
      }

      // Error handling for failure events
      if (event.event_type === 'failure') {
        markdown += `#### Error Handling\n\n`
        if (event.error_code) {
          markdown += `**Error Code:** \`${event.error_code}\`\n\n`
        }
        if (event.error_message) {
          markdown += `**Error Message:** ${event.error_message}\n\n`
        }
      }

      markdown += `---\n\n`
    }

    // Appendix
    markdown += `## Appendix\n\n`
    markdown += `### Event Type Definitions\n\n`
    markdown += `- **Intent:** User expresses intent to perform an action\n`
    markdown += `- **Success:** User successfully completes an action\n`
    markdown += `- **Failure:** User encounters an error or fails to complete an action\n\n`
    
    markdown += `### Lifecycle Status Definitions\n\n`
    markdown += `- **Proposed:** Event definition is proposed but not yet approved\n`
    markdown += `- **Approved:** Event definition is approved but not yet implemented\n`
    markdown += `- **Implemented:** Event is actively being tracked in production\n`
    markdown += `- **Deprecated:** Event is no longer being tracked\n\n`

    sections.push('appendix')

    const filename = this.generateFilename(dictionary, 'md')

    return {
      data: markdown,
      filename,
      sections,
      eventCount: dictionary.events.length
    }
  }

  /**
   * Generate Datadog implementation stubs
   */
  static exportToDatadog(dictionary: DataDictionary): DatadogExportResult {
    let code = ''
    const apiMethods: string[] = []
    let functionCount = 0

    // File header
    code += `/**\n`
    code += ` * Datadog implementation stubs for ${dictionary.events.length} events\n`
    code += ` * Generated: ${new Date().toLocaleString()}\n`
    code += ` * \n`
    code += ` * Instructions:\n`
    code += ` * 1. Install Datadog RUM SDK: npm install @datadog/browser-rum\n`
    code += ` * 2. Initialize RUM in your application\n`
    code += ` * 3. Import and call these functions when events occur\n`
    code += ` * 4. Customize property values based on your application context\n`
    code += ` */\n\n`

    code += `import { datadogRum } from '@datadog/browser-rum';\n\n`

    // Generate function for each event
    for (const event of dictionary.events) {
      functionCount++
      
      const functionName = `track${this.toPascalCase(event.event_name)}`
      const apiMethod = event.datadog_api
      
      if (!apiMethods.includes(apiMethod)) {
        apiMethods.push(apiMethod)
      }

      // Function signature
      code += `/**\n`
      code += ` * ${event.event_purpose}\n`
      code += ` * When to fire: ${event.when_to_fire}\n`
      code += ` * @param context - Event context properties\n`
      code += ` */\n`
      
      // Build context type
      const contextType = this.buildDatadogContextType(event)
      code += `export function ${functionName}(context: ${contextType}) {\n`
      
      // Function body based on event type and API method
      if (apiMethod === 'addAction') {
        code += `  datadogRum.addAction('${event.event_name}', context);\n`
      } else if (apiMethod === 'addError') {
        if (event.event_type === 'failure') {
          code += `  const error = new Error(context.error_message || '${event.event_name} failed');\n`
          if (event.error_code) {
            code += `  error.name = context.error_code || '${event.error_code}';\n`
          }
          code += `  datadogRum.addError(error, context);\n`
        } else {
          code += `  const error = new Error('${event.event_name}');\n`
          code += `  datadogRum.addError(error, context);\n`
        }
      } else if (apiMethod === 'addFeatureFlagEvaluation') {
        code += `  datadogRum.addFeatureFlagEvaluation('${event.event_name}', context.flag_value, context);\n`
      }

      code += `}\n\n`
    }

    // Usage examples
    code += `/**\n`
    code += ` * Usage Examples:\n`
    code += ` * \n`
    for (let i = 0; i < Math.min(3, dictionary.events.length); i++) {
      const event = dictionary.events[i]
      const functionName = `track${this.toPascalCase(event.event_name)}`
      const exampleContext = this.generateDatadogExample(event)
      
      code += ` * // ${event.event_purpose}\n`
      code += ` * ${functionName}(${exampleContext});\n`
      code += ` * \n`
    }
    code += ` */\n`

    const filename = this.generateFilename(dictionary, 'ts', 'datadog-tracking')

    return {
      data: code,
      filename,
      functionCount,
      apiMethods
    }
  }

  /**
   * Generate JIRA-ready ticket descriptions
   */
  static exportToJira(dictionary: DataDictionary): JiraExportResult {
    let jiraText = ''
    let ticketCount = 0
    let estimatedStoryPoints = 0

    // Epic description
    jiraText += `h1. Analytics Events Implementation Epic\n\n`
    jiraText += `h2. Overview\n`
    jiraText += `Implement ${dictionary.events.length} analytics events to track user behavior and system performance.\n\n`
    
    jiraText += `h2. Success Criteria\n`
    jiraText += `* All ${dictionary.events.length} events are implemented and firing correctly\n`
    jiraText += `* Events follow naming conventions and schema requirements\n`
    jiraText += `* Events are validated in staging environment\n`
    jiraText += `* Documentation is updated with implementation details\n\n`

    jiraText += `h2. Events Summary\n`
    jiraText += `|| Event Type || Count ||\n`
    const stats = this.generateEventStatistics(dictionary.events)
    jiraText += `| Intent | ${stats.intentEvents} |\n`
    jiraText += `| Success | ${stats.successEvents} |\n`
    jiraText += `| Failure | ${stats.failureEvents} |\n\n`

    // Individual tickets
    jiraText += `h1. Individual Implementation Tickets\n\n`
    jiraText += `{tip}Copy each ticket below into a separate JIRA story{tip}\n\n`
    jiraText += `---\n\n`

    for (const event of dictionary.events) {
      ticketCount++
      
      // Estimate story points based on complexity
      const storyPoints = this.estimateStoryPoints(event)
      estimatedStoryPoints += storyPoints

      jiraText += `h2. [${ticketCount}] Implement ${event.event_name} Event\n\n`
      
      jiraText += `h3. Description\n`
      jiraText += `${event.event_purpose}\n\n`
      
      jiraText += `h3. Acceptance Criteria\n`
      jiraText += `* Event fires when: ${event.when_to_fire}\n`
      jiraText += `* Event uses Datadog \`${event.datadog_api}\` method\n`
      jiraText += `* Event includes all required properties\n`
      jiraText += `* Event follows ${event.actor} → ${event.object} @ ${event.context_surface} pattern\n`
      
      if (event.context_keys && event.context_keys.length > 0) {
        jiraText += `* Event includes context keys: ${event.context_keys.map(k => `\`${k}\``).join(', ')}\n`
      }
      
      jiraText += `* Event is validated in development environment\n\n`

      jiraText += `h3. Technical Details\n`
      jiraText += `* *Event Name:* \`${event.event_name}\`\n`
      jiraText += `* *Event Type:* ${event.event_type}\n`
      jiraText += `* *Action Type:* ${event.event_action_type}\n`
      jiraText += `* *Datadog API:* \`${event.datadog_api}\`\n\n`

      if (event.properties && event.properties.length > 0) {
        jiraText += `h3. Event Properties\n`
        jiraText += `|| Property || Type || Required || Example ||\n`
        
        for (const prop of event.properties) {
          const required = prop.required ? 'Yes' : 'No'
          const example = prop.example ? this.formatExampleValue(prop.example) : 'N/A'
          jiraText += `| \`${prop.name}\` | ${prop.type} | ${required} | ${example} |\n`
        }
        jiraText += `\n`
      }

      // Error handling for failure events
      if (event.event_type === 'failure') {
        jiraText += `h3. Error Handling\n`
        if (event.error_code) {
          jiraText += `* Include error code: \`${event.error_code}\`\n`
        }
        if (event.error_message) {
          jiraText += `* Include error message: ${event.error_message}\n`
        }
        jiraText += `* Use \`datadogRum.addError()\` method for failure events\n\n`
      }

      jiraText += `h3. Implementation Notes\n`
      if (event.notes) {
        jiraText += `${event.notes}\n\n`
      }
      
      jiraText += `h3. Story Points\n`
      jiraText += `*Estimated:* ${storyPoints} points\n\n`
      
      jiraText += `h3. Labels\n`
      jiraText += `analytics, ${event.event_type}-event, ${event.lifecycle_status}, datadog\n\n`
      
      jiraText += `---\n\n`
    }

    // Summary footer
    jiraText += `h2. Implementation Summary\n`
    jiraText += `* Total Tickets: ${ticketCount}\n`
    jiraText += `* Total Story Points: ${estimatedStoryPoints}\n`
    jiraText += `* Estimated Sprint Capacity: ${Math.ceil(estimatedStoryPoints / 20)} sprints (assuming 20 points per sprint)\n\n`

    const filename = this.generateFilename(dictionary, 'txt', 'jira-tickets')

    return {
      data: jiraText,
      filename,
      ticketCount,
      estimatedStoryPoints
    }
  }

  /**
   * Get field value from event, handling serialization
   */
  private static getEventFieldValue(
    event: DataDictionaryEvent, 
    fieldName: string, 
    serialize: boolean = false
  ): string {
    const value = (event as any)[fieldName]
    
    if (value === undefined || value === null) {
      return ''
    }
    
    if (serialize && (Array.isArray(value) || typeof value === 'object')) {
      return JSON.stringify(value)
    }
    
    return String(value)
  }

  /**
   * Escape CSV values
   */
  private static escapeCsvValue(value: string, delimiter: string): string {
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  /**
   * Generate filename with timestamp
   */
  private static generateFilename(
    dictionary: DataDictionary, 
    extension: string, 
    prefix?: string
  ): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const basePrefix = prefix || 'data-dictionary'
    return `${basePrefix}-${dictionary.events.length}-events-${timestamp}.${extension}`
  }

  /**
   * Convert to PascalCase
   */
  private static toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  /**
   * Generate event statistics
   */
  private static generateEventStatistics(events: DataDictionaryEvent[]) {
    return {
      intentEvents: events.filter(e => e.event_type === 'intent').length,
      successEvents: events.filter(e => e.event_type === 'success').length,
      failureEvents: events.filter(e => e.event_type === 'failure').length,
      implementedEvents: events.filter(e => e.lifecycle_status === 'implemented').length,
      totalProperties: events.reduce((sum, e) => sum + e.properties.length, 0),
      avgProperties: Math.round((events.reduce((sum, e) => sum + e.properties.length, 0) / events.length) * 10) / 10
    }
  }

  /**
   * Get status color for badges
   */
  private static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'proposed': 'yellow',
      'approved': 'blue', 
      'implemented': 'green',
      'deprecated': 'red'
    }
    return colors[status] || 'gray'
  }

  /**
   * Format example value for display
   */
  private static formatExampleValue(value: any): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return String(value)
    return JSON.stringify(value)
  }

  /**
   * Build TypeScript context type for Datadog functions
   */
  private static buildDatadogContextType(event: DataDictionaryEvent): string {
    if (!event.properties || event.properties.length === 0) {
      return '{ [key: string]: any }'
    }

    const types = event.properties.map(prop => {
      const optional = prop.required ? '' : '?'
      let tsType = 'any'
      
      switch (prop.type) {
        case 'string': tsType = 'string'; break
        case 'number': tsType = 'number'; break
        case 'boolean': tsType = 'boolean'; break
        case 'array': tsType = 'any[]'; break
        case 'object': tsType = 'object'; break
        default: tsType = 'any'
      }
      
      return `  ${prop.name}${optional}: ${tsType}`
    })

    return `{\n${types.join(';\n')};\n  [key: string]: any;\n}`
  }

  /**
   * Generate Datadog usage example
   */
  private static generateDatadogExample(event: DataDictionaryEvent): string {
    const examples: string[] = []
    
    for (const prop of event.properties.slice(0, 3)) { // Limit to first 3 props
      if (prop.example !== undefined) {
        const value = typeof prop.example === 'string' ? `'${prop.example}'` : prop.example
        examples.push(`${prop.name}: ${value}`)
      }
    }
    
    return examples.length > 0 ? `{ ${examples.join(', ')} }` : '{}'
  }

  /**
   * Estimate story points for JIRA ticket
   */
  private static estimateStoryPoints(event: DataDictionaryEvent): number {
    let points = 1 // Base complexity
    
    // Add complexity for properties
    if (event.properties.length > 3) points += 1
    if (event.properties.length > 8) points += 1
    
    // Add complexity for error handling
    if (event.event_type === 'failure') points += 1
    
    // Add complexity for feature flags
    if (event.event_action_type === 'feature_flag') points += 1
    
    // Complex context or business logic
    if (event.event_purpose.length > 100) points += 1
    
    return Math.min(points, 8) // Cap at 8 points
  }
}