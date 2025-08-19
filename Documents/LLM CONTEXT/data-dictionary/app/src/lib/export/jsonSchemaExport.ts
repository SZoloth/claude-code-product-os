/**
 * JSON Schema export functionality
 * Generates JSON Schema definitions for events and properties
 */

import type { DataDictionary, DataDictionaryEvent, EventProperty } from '../schema/dataDictionary'

export interface JsonSchemaExportOptions {
  includeExamples?: boolean
  includeDescriptions?: boolean
  strictMode?: boolean
  generateRefs?: boolean
  includeMeta?: boolean
  schemaVersion?: string
}

export interface JsonSchemaExportResult {
  schema: any
  filename: string
  definitions: number
  properties: number
  examples: number
}

export class JsonSchemaExporter {
  /**
   * Export data dictionary as JSON Schema
   */
  static exportToJsonSchema(
    dictionary: DataDictionary,
    options: JsonSchemaExportOptions = {}
  ): JsonSchemaExportResult {
    const {
      includeExamples = true,
      includeDescriptions = true,
      strictMode = false,
      generateRefs = true,
      includeMeta = true,
      schemaVersion = 'https://json-schema.org/draft/2020-12/schema'
    } = options

    const schema = this.createBaseSchema(schemaVersion, includeMeta, dictionary)
    let definitionCount = 0
    let propertyCount = 0
    let exampleCount = 0

    // Create definitions for each event
    const definitions: Record<string, any> = {}

    for (const event of dictionary.events) {
      const eventSchema = this.createEventSchema(event, {
        includeExamples,
        includeDescriptions,
        strictMode
      })

      definitions[this.getEventSchemaName(event)] = eventSchema
      definitionCount++
      propertyCount += event.properties.length

      if (includeExamples && eventSchema.examples) {
        exampleCount += eventSchema.examples.length
      }
    }

    // Add definitions to schema
    if (generateRefs) {
      schema.$defs = definitions
      schema.oneOf = dictionary.events.map(event => ({
        $ref: `#/$defs/${this.getEventSchemaName(event)}`
      }))
    } else {
      schema.anyOf = Object.values(definitions)
    }

    // Add common property schemas
    if (generateRefs) {
      schema.$defs.commonProperties = this.createCommonPropertySchemas()
      definitionCount += Object.keys(schema.$defs.commonProperties).length
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `data-dictionary-schema-${timestamp}.json`

    return {
      schema,
      filename,
      definitions: definitionCount,
      properties: propertyCount,
      examples: exampleCount
    }
  }

  private static createBaseSchema(schemaVersion: string, includeMeta: boolean, dictionary: DataDictionary) {
    const schema: any = {
      $schema: schemaVersion,
      $id: 'https://example.com/data-dictionary.schema.json',
      title: 'Data Dictionary Events Schema',
      description: 'JSON Schema for data dictionary events and their properties',
      type: 'object'
    }

    if (includeMeta) {
      schema.meta = {
        generated: new Date().toISOString(),
        version: '1.0.0',
        eventCount: dictionary.events.length,
        totalProperties: dictionary.events.reduce((sum, e) => sum + e.properties.length, 0)
      }
    }

    return schema
  }

  private static createEventSchema(
    event: DataDictionaryEvent,
    options: { includeExamples: boolean; includeDescriptions: boolean; strictMode: boolean }
  ) {
    const { includeExamples, includeDescriptions, strictMode } = options

    const schema: any = {
      type: 'object',
      title: this.formatTitle(event.event_name),
      properties: {
        event_name: {
          type: 'string',
          const: event.event_name
        },
        event_type: {
          type: 'string',
          enum: ['intent', 'success', 'failure']
        },
        event_action_type: {
          type: 'string',
          enum: ['action', 'view', 'error']
        }
      },
      required: ['event_name', 'event_type', 'event_action_type'],
      additionalProperties: strictMode ? false : true
    }

    if (includeDescriptions && event.event_purpose) {
      schema.description = event.event_purpose
    }

    // Add optional event properties
    if (event.when_to_fire) {
      schema.properties.when_to_fire = { type: 'string' }
      if (includeDescriptions) {
        schema.properties.when_to_fire.description = 'When this event should be fired'
      }
    }

    if (event.actor) {
      schema.properties.actor = { type: 'string' }
    }

    if (event.object) {
      schema.properties.object = { type: 'string' }
    }

    if (event.context_surface) {
      schema.properties.context_surface = { type: 'string' }
    }

    // Add custom properties
    if (event.properties.length > 0) {
      schema.properties.properties = {
        type: 'object',
        properties: {},
        required: []
      }

      for (const property of event.properties) {
        const propSchema = this.createPropertySchema(property, { includeExamples, includeDescriptions })
        schema.properties.properties.properties[property.name] = propSchema

        if (property.required) {
          schema.properties.properties.required.push(property.name)
        }
      }

      schema.properties.properties.additionalProperties = strictMode ? false : true
    }

    // Add examples
    if (includeExamples) {
      schema.examples = this.createEventExamples(event)
    }

    return schema
  }

  private static createPropertySchema(
    property: EventProperty,
    options: { includeExamples: boolean; includeDescriptions: boolean }
  ) {
    const { includeExamples, includeDescriptions } = options
    
    const schema: any = {
      type: this.mapPropertyType(property.type)
    }

    if (includeDescriptions && property.description) {
      schema.description = property.description
    }

    if (includeExamples && property.example) {
      schema.examples = [property.example]
    }

    // Add format constraints based on property name patterns
    if (property.name.includes('email')) {
      schema.format = 'email'
    } else if (property.name.includes('url') || property.name.includes('uri')) {
      schema.format = 'uri'
    } else if (property.name.includes('date') || property.name.includes('time')) {
      schema.format = 'date-time'
    } else if (property.name.includes('id') && schema.type === 'string') {
      schema.pattern = '^[a-zA-Z0-9_-]+$'
    }

    // Add value constraints
    if (property.type === 'string' && property.example) {
      const exampleLength = property.example.toString().length
      if (exampleLength > 0) {
        schema.minLength = 1
        schema.maxLength = Math.max(exampleLength * 2, 255)
      }
    }

    if (property.type === 'number' && property.example) {
      const numValue = Number(property.example)
      if (!isNaN(numValue)) {
        schema.minimum = 0
      }
    }

    return schema
  }

  private static createCommonPropertySchemas() {
    return {
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'ISO 8601 timestamp'
      },
      user_id: {
        type: 'string',
        pattern: '^[a-zA-Z0-9_-]+$',
        description: 'User identifier'
      },
      session_id: {
        type: 'string',
        pattern: '^[a-zA-Z0-9_-]+$',
        description: 'Session identifier'
      },
      error_code: {
        type: 'string',
        pattern: '^[A-Z_]+$',
        description: 'Error code identifier'
      },
      error_message: {
        type: 'string',
        minLength: 1,
        maxLength: 500,
        description: 'Human-readable error message'
      }
    }
  }

  private static createEventExamples(event: DataDictionaryEvent) {
    const baseExample: any = {
      event_name: event.event_name,
      event_type: event.event_type,
      event_action_type: event.event_action_type
    }

    if (event.when_to_fire) baseExample.when_to_fire = event.when_to_fire
    if (event.actor) baseExample.actor = event.actor
    if (event.object) baseExample.object = event.object
    if (event.context_surface) baseExample.context_surface = event.context_surface

    if (event.properties.length > 0) {
      baseExample.properties = {}
      for (const property of event.properties) {
        if (property.example) {
          baseExample.properties[property.name] = this.parseExampleValue(property.example, property.type)
        }
      }
    }

    // Generate additional example variations
    const examples = [baseExample]

    // Add minimal example (required fields only)
    const minimalExample = {
      event_name: event.event_name,
      event_type: event.event_type,
      event_action_type: event.event_action_type
    }

    if (event.properties.some(p => p.required)) {
      minimalExample.properties = {}
      for (const property of event.properties.filter(p => p.required)) {
        if (property.example) {
          minimalExample.properties[property.name] = this.parseExampleValue(property.example, property.type)
        }
      }
    }

    if (JSON.stringify(minimalExample) !== JSON.stringify(baseExample)) {
      examples.push(minimalExample)
    }

    return examples
  }

  private static parseExampleValue(example: string, type: string): any {
    switch (type) {
      case 'number':
        const num = Number(example)
        return isNaN(num) ? 0 : num
      case 'boolean':
        return example.toLowerCase() === 'true'
      case 'array':
        try {
          return JSON.parse(example)
        } catch {
          return [example]
        }
      case 'object':
        try {
          return JSON.parse(example)
        } catch {
          return { value: example }
        }
      default:
        return example
    }
  }

  private static mapPropertyType(type: string): string {
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'array':
      case 'object':
        return type
      default:
        return 'string'
    }
  }

  private static getEventSchemaName(event: DataDictionaryEvent): string {
    return event.event_name.replace(/[^a-zA-Z0-9]/g, '_') + '_Event'
  }

  private static formatTitle(eventName: string): string {
    return eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Event'
  }
}