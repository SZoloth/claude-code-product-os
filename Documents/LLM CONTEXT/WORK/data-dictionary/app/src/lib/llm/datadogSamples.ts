/**
 * Utility for generating Datadog implementation samples based on event configuration
 * Provides code examples that developers can copy-paste for implementation
 */

import { DataDictionaryEvent, DatadogApi } from '../schema/dataDictionary'

export interface DatadogSample {
  code: string
  description: string
  imports?: string[]
}

/**
 * Generate Datadog implementation code sample for an event
 */
export function generateDatadogSample(event: DataDictionaryEvent): DatadogSample {
  const { event_name, datadog_api, properties, error_code, error_message } = event
  
  switch (datadog_api) {
    case 'addAction':
      return generateAddActionSample(event_name, properties)
    
    case 'addError':
      return generateAddErrorSample(event_name, properties, error_code, error_message)
    
    case 'addFeatureFlagEvaluation':
      return generateFeatureFlagSample(event_name, properties)
    
    default:
      return {
        code: `// Unknown datadog_api: ${datadog_api}`,
        description: 'Unknown Datadog API type'
      }
  }
}

function generateAddActionSample(eventName: string, properties: any[]): DatadogSample {
  const propsObj = generatePropertiesObject(properties)
  
  return {
    code: `// Track ${eventName} action
datadogLogs.logger.info('${eventName}', ${propsObj});

// Alternative with Datadog RUM
import { datadogRum } from '@datadog/browser-rum';
datadogRum.addAction('${eventName}', ${propsObj});`,
    description: 'Use addAction for user behaviors, successful operations, and intent tracking',
    imports: ['@datadog/browser-logs', '@datadog/browser-rum']
  }
}

function generateAddErrorSample(eventName: string, properties: any[], errorCode?: string, errorMessage?: string): DatadogSample {
  const propsObj = generatePropertiesObject(properties, { error_code: errorCode, error_message: errorMessage })
  
  return {
    code: `// Track ${eventName} error
datadogLogs.logger.error('${eventName}', ${propsObj});

// Alternative with Datadog RUM
import { datadogRum } from '@datadog/browser-rum';
datadogRum.addError(new Error('${errorMessage || eventName}'), ${propsObj});`,
    description: 'Use addError for failures, exceptions, and unsuccessful operations',
    imports: ['@datadog/browser-logs', '@datadog/browser-rum']
  }
}

function generateFeatureFlagSample(eventName: string, properties: any[]): DatadogSample {
  const propsObj = generatePropertiesObject(properties)
  
  return {
    code: `// Track ${eventName} feature flag evaluation
import { datadogRum } from '@datadog/browser-rum';
datadogRum.addFeatureFlagEvaluation('feature_name', 'variant_value');

// Also log for analytics
datadogLogs.logger.info('${eventName}', ${propsObj});`,
    description: 'Use addFeatureFlagEvaluation for A/B tests, feature toggles, and experimental feature exposures',
    imports: ['@datadog/browser-rum', '@datadog/browser-logs']
  }
}

function generatePropertiesObject(properties: any[], additionalProps: Record<string, any> = {}): string {
  const propEntries: string[] = []
  
  // Add context properties
  properties?.forEach(prop => {
    const { name, example, type } = prop
    let valueExample: string
    
    switch (type) {
      case 'string':
        valueExample = example ? `'${example}'` : `'example_${name}'`
        break
      case 'number':
        valueExample = example?.toString() || '123'
        break
      case 'boolean':
        valueExample = example?.toString() || 'true'
        break
      case 'datetime':
        valueExample = 'new Date().toISOString()'
        break
      default:
        valueExample = example ? JSON.stringify(example) : `'${name}_value'`
    }
    
    propEntries.push(`  ${name}: ${valueExample}`)
  })
  
  // Add additional properties (like error details)
  Object.entries(additionalProps).forEach(([key, value]) => {
    if (value) {
      propEntries.push(`  ${key}: '${value}'`)
    }
  })
  
  // Add common context
  propEntries.push('  timestamp: new Date().toISOString()')
  propEntries.push('  user_id: getCurrentUserId()')
  propEntries.push('  session_id: getSessionId()')
  
  return propEntries.length > 0 
    ? `{\n${propEntries.join(',\n')}\n}`
    : '{}'
}

/**
 * Generate implementation guide for all events in a data dictionary
 */
export function generateImplementationGuide(events: DataDictionaryEvent[]): string {
  const samples = events.map(event => {
    const sample = generateDatadogSample(event)
    return `
## ${event.event_name}
**Purpose:** ${event.event_purpose}
**Datadog API:** ${event.datadog_api}
**Trigger:** ${event.when_to_fire}

${sample.description}

\`\`\`typescript
${sample.code}
\`\`\`

---`
  })
  
  const allImports = new Set<string>()
  events.forEach(event => {
    const sample = generateDatadogSample(event)
    sample.imports?.forEach(imp => allImports.add(imp))
  })
  
  return `# Datadog Implementation Guide

## Required Imports
\`\`\`typescript
${Array.from(allImports).map(imp => `import from '${imp}';`).join('\n')}
\`\`\`

## Event Implementations
${samples.join('\n')}
`
}

/**
 * Generate a summary of Datadog API usage patterns
 */
export function generateDatadogApiSummary(events: DataDictionaryEvent[]): {
  addAction: number
  addError: number
  addFeatureFlagEvaluation: number
  breakdown: Record<DatadogApi, string[]>
} {
  const breakdown: Record<DatadogApi, string[]> = {
    addAction: [],
    addError: [],
    addFeatureFlagEvaluation: []
  }
  
  events.forEach(event => {
    breakdown[event.datadog_api].push(event.event_name)
  })
  
  return {
    addAction: breakdown.addAction.length,
    addError: breakdown.addError.length,
    addFeatureFlagEvaluation: breakdown.addFeatureFlagEvaluation.length,
    breakdown
  }
}