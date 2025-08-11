import type { DataDictionary, DataDictionaryEvent, EventProperty } from './dataDictionary'

const snakeCaseRegex = /^[a-z][a-z0-9_]*$/

export interface ValidationIssue {
  path: string
  message: string
}

export function isSnakeCase(value: string): boolean {
  return snakeCaseRegex.test(value)
}

export function validateEvent(event: DataDictionaryEvent, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!isSnakeCase(event.event_name)) {
    issues.push({ path: `events[${index}].event_name`, message: 'event_name must be snake_case' })
  }
  // properties
  const propNames = new Set<string>()
  event.properties.forEach((p: EventProperty, i: number) => {
    if (!isSnakeCase(p.name)) {
      issues.push({ path: `events[${index}].properties[${i}].name`, message: 'property name must be snake_case' })
    }
    if (propNames.has(p.name)) {
      issues.push({ path: `events[${index}].properties[${i}].name`, message: 'duplicate property name in event' })
    }
    propNames.add(p.name)
  })

  // failure events should include error details when present
  if (event.event_type === 'failure' && event.event_action_type === 'error') {
    if (!event.error_code) {
      issues.push({ path: `events[${index}].error_code`, message: 'failure events should include error_code when available' })
    }
    if (!event.error_message) {
      issues.push({ path: `events[${index}].error_message`, message: 'failure events should include error_message when available' })
    }
  }
  return issues
}

export function validateDictionary(dict: DataDictionary): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const seen = new Set<string>()
  dict.events.forEach((e, idx) => {
    if (seen.has(e.event_name)) {
      issues.push({ path: `events[${idx}].event_name`, message: 'duplicate event_name across dictionary' })
    }
    seen.add(e.event_name)
    issues.push(...validateEvent(e, idx))
  })
  return issues
}


