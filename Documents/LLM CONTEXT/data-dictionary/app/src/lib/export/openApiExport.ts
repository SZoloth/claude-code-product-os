/**
 * OpenAPI/Swagger export functionality
 * Generates OpenAPI 3.0 specifications for analytics APIs
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface OpenApiExportOptions {
  apiVersion?: string
  includeExamples?: boolean
  includeValidation?: boolean
  generatePaths?: boolean
  includeWebhooks?: boolean
  addSecuritySchemes?: boolean
  serverUrl?: string
}

export interface OpenApiExportResult {
  spec: any
  filename: string
  pathCount: number
  schemaCount: number
  operationCount: number
}

export class OpenApiExporter {
  /**
   * Export data dictionary as OpenAPI 3.0 specification
   */
  static exportToOpenApi(
    dictionary: DataDictionary,
    options: OpenApiExportOptions = {}
  ): OpenApiExportResult {
    const {
      apiVersion = '1.0.0',
      includeExamples = true,
      includeValidation = true,
      generatePaths = true,
      includeWebhooks = false,
      addSecuritySchemes = true,
      serverUrl = 'https://api.example.com'
    } = options

    const spec = this.createBaseSpec(apiVersion, serverUrl, dictionary)
    let pathCount = 0
    let schemaCount = 0
    let operationCount = 0

    // Add schemas for each event
    spec.components.schemas = {}
    
    for (const event of dictionary.events) {
      const eventSchema = this.createEventSchema(event, { includeExamples, includeValidation })
      const schemaName = this.getSchemaName(event)
      spec.components.schemas[schemaName] = eventSchema
      schemaCount++
    }

    // Add common schemas
    spec.components.schemas = {
      ...spec.components.schemas,
      ...this.createCommonSchemas()
    }
    schemaCount += Object.keys(this.createCommonSchemas()).length

    // Add security schemes
    if (addSecuritySchemes) {
      spec.components.securitySchemes = this.createSecuritySchemes()
    }

    // Generate API paths
    if (generatePaths) {
      spec.paths = this.createApiPaths(dictionary.events, { includeExamples })
      pathCount = Object.keys(spec.paths).length
      operationCount = this.countOperations(spec.paths)
    }

    // Add webhooks
    if (includeWebhooks) {
      spec.webhooks = this.createWebhooks(dictionary.events)
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `analytics-api-spec-${timestamp}.json`

    return {
      spec,
      filename,
      pathCount,
      schemaCount,
      operationCount
    }
  }

  private static createBaseSpec(apiVersion: string, serverUrl: string, dictionary: DataDictionary) {
    return {
      openapi: '3.0.3',
      info: {
        title: 'Analytics Events API',
        description: 'API for tracking analytics events generated from data dictionary',
        version: apiVersion,
        contact: {
          name: 'Analytics Team',
          email: 'analytics@example.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: serverUrl,
          description: 'Production server'
        },
        {
          url: `${serverUrl.replace('api.', 'staging-api.')}`,
          description: 'Staging server'
        }
      ],
      components: {
        schemas: {},
        responses: this.createCommonResponses(),
        parameters: this.createCommonParameters(),
        headers: this.createCommonHeaders()
      },
      tags: this.createTags(dictionary.events),
      externalDocs: {
        description: 'Data Dictionary Documentation',
        url: 'https://docs.example.com/analytics'
      }
    }
  }

  private static createEventSchema(
    event: DataDictionaryEvent,
    options: { includeExamples: boolean; includeValidation: boolean }
  ) {
    const { includeExamples, includeValidation } = options

    const schema: any = {
      type: 'object',
      title: this.formatTitle(event.event_name),
      description: event.event_purpose || `Analytics event: ${event.event_name}`,
      required: ['event_name', 'timestamp'],
      properties: {
        event_name: {
          type: 'string',
          const: event.event_name,
          description: 'The name of the analytics event'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'When the event occurred (ISO 8601)',
          example: includeExamples ? new Date().toISOString() : undefined
        },
        session_id: {
          type: 'string',
          description: 'Unique session identifier',
          pattern: includeValidation ? '^[a-zA-Z0-9_-]{8,64}$' : undefined,
          example: includeExamples ? 'sess_1234567890abcdef' : undefined
        },
        user_id: {
          type: 'string',
          description: 'Unique user identifier',
          pattern: includeValidation ? '^[a-zA-Z0-9_-]{1,64}$' : undefined,
          example: includeExamples ? 'user_12345' : undefined
        }
      },
      additionalProperties: false
    }

    // Add event-specific properties
    if (event.properties.length > 0) {
      schema.properties.properties = {
        type: 'object',
        description: 'Event-specific properties',
        properties: {},
        required: []
      }

      for (const property of event.properties) {
        const propSchema = this.createPropertySchema(property, options)
        schema.properties.properties.properties[property.name] = propSchema

        if (property.required) {
          schema.properties.properties.required.push(property.name)
        }
      }
    }

    // Add context properties based on event type
    if (event.event_type === 'failure') {
      schema.properties.error = {
        $ref: '#/components/schemas/ErrorInfo'
      }
      schema.required.push('error')
    }

    if (includeExamples) {
      schema.examples = [this.createEventExample(event)]
    }

    return schema
  }

  private static createPropertySchema(
    property: any,
    options: { includeExamples: boolean; includeValidation: boolean }
  ) {
    const { includeExamples, includeValidation } = options
    
    const schema: any = {
      type: this.mapPropertyType(property.type),
      description: property.description || `${property.name} property`
    }

    if (includeExamples && property.example) {
      schema.example = this.parseExampleValue(property.example, property.type)
    }

    if (includeValidation) {
      // Add validation based on property patterns
      if (property.name.includes('email')) {
        schema.format = 'email'
      } else if (property.name.includes('url')) {
        schema.format = 'uri'
      } else if (property.name.includes('id') && schema.type === 'string') {
        schema.pattern = '^[a-zA-Z0-9_-]+$'
        schema.maxLength = 255
      }

      if (schema.type === 'string') {
        schema.minLength = 1
        schema.maxLength = schema.maxLength || 1000
      }

      if (schema.type === 'number') {
        schema.minimum = 0
      }
    }

    return schema
  }

  private static createCommonSchemas() {
    return {
      ErrorInfo: {
        type: 'object',
        description: 'Error information for failure events',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            description: 'Error code identifier',
            pattern: '^[A-Z_]+$',
            example: 'VALIDATION_FAILED'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message',
            maxLength: 500,
            example: 'The request failed validation'
          },
          details: {
            type: 'object',
            description: 'Additional error details',
            additionalProperties: true
          }
        }
      },
      BatchEventRequest: {
        type: 'object',
        description: 'Batch request for multiple events',
        required: ['events'],
        properties: {
          events: {
            type: 'array',
            description: 'Array of events to process',
            minItems: 1,
            maxItems: 100,
            items: {
              oneOf: [
                { $ref: '#/components/schemas/GenericEvent' }
              ]
            }
          },
          dry_run: {
            type: 'boolean',
            description: 'If true, validate events without processing',
            default: false
          }
        }
      },
      GenericEvent: {
        type: 'object',
        description: 'Generic analytics event structure',
        required: ['event_name', 'timestamp'],
        properties: {
          event_name: {
            type: 'string',
            description: 'The name of the analytics event'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'When the event occurred'
          },
          properties: {
            type: 'object',
            description: 'Event-specific properties',
            additionalProperties: true
          }
        }
      },
      EventResponse: {
        type: 'object',
        description: 'Response after processing an event',
        properties: {
          event_id: {
            type: 'string',
            description: 'Unique identifier for the processed event'
          },
          status: {
            type: 'string',
            enum: ['accepted', 'rejected', 'processed'],
            description: 'Processing status'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'When the event was processed'
          }
        }
      }
    }
  }

  private static createApiPaths(events: DataDictionaryEvent[], options: { includeExamples: boolean }) {
    const paths: any = {}

    // Single event tracking endpoint
    paths['/events'] = {
      post: {
        tags: ['Events'],
        summary: 'Track a single analytics event',
        description: 'Submit a single analytics event for processing',
        operationId: 'trackEvent',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: events.map(event => ({
                  $ref: `#/components/schemas/${this.getSchemaName(event)}`
                }))
              },
              examples: options.includeExamples ? this.createRequestExamples(events) : undefined
            }
          }
        },
        responses: {
          '200': {
            description: 'Event processed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventResponse' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/RateLimited' }
        },
        security: [{ apiKey: [] }]
      }
    }

    // Batch events endpoint
    paths['/events/batch'] = {
      post: {
        tags: ['Events'],
        summary: 'Track multiple analytics events',
        description: 'Submit multiple analytics events in a single request',
        operationId: 'trackEventsBatch',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BatchEventRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Batch processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    processed: { type: 'integer' },
                    failed: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EventResponse' }
                    }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' }
        }
      }
    }

    // Event validation endpoint
    paths['/events/validate'] = {
      post: {
        tags: ['Validation'],
        summary: 'Validate event structure',
        description: 'Validate an event without processing it',
        operationId: 'validateEvent',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GenericEvent' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Validation result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    valid: { type: 'boolean' },
                    errors: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return paths
  }

  private static createCommonResponses() {
    return {
      BadRequest: {
        description: 'Bad request - invalid event data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                details: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized - invalid API key',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Invalid API key' }
              }
            }
          }
        }
      },
      RateLimited: {
        description: 'Rate limit exceeded',
        headers: {
          'X-RateLimit-Limit': {
            description: 'Request limit per hour',
            schema: { type: 'integer' }
          },
          'X-RateLimit-Remaining': {
            description: 'Remaining requests in current window',
            schema: { type: 'integer' }
          }
        }
      }
    }
  }

  private static createCommonParameters() {
    return {
      dryRun: {
        name: 'dry_run',
        in: 'query',
        description: 'Validate without processing',
        schema: { type: 'boolean', default: false }
      }
    }
  }

  private static createCommonHeaders() {
    return {
      'X-Request-ID': {
        description: 'Unique request identifier',
        schema: { type: 'string' }
      }
    }
  }

  private static createSecuritySchemes() {
    return {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication'
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication'
      }
    }
  }

  private static createTags(events: DataDictionaryEvent[]) {
    const eventTypes = [...new Set(events.map(e => e.event_type))]
    
    return [
      { name: 'Events', description: 'Analytics event tracking' },
      { name: 'Validation', description: 'Event validation and testing' },
      ...eventTypes.map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `${type} events`
      }))
    ]
  }

  private static createWebhooks(events: DataDictionaryEvent[]) {
    return {
      eventProcessed: {
        post: {
          summary: 'Event processed notification',
          description: 'Webhook called when an event is successfully processed',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    event_id: { type: 'string' },
                    event_name: { type: 'string' },
                    processed_at: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['processed', 'failed'] }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Webhook received successfully' }
          }
        }
      }
    }
  }

  // Helper methods
  private static createEventExample(event: DataDictionaryEvent) {
    const example: any = {
      event_name: event.event_name,
      timestamp: new Date().toISOString(),
      session_id: 'sess_1234567890abcdef',
      user_id: 'user_12345'
    }

    if (event.properties.length > 0) {
      example.properties = {}
      for (const property of event.properties) {
        if (property.example) {
          example.properties[property.name] = this.parseExampleValue(property.example, property.type)
        }
      }
    }

    return example
  }

  private static createRequestExamples(events: DataDictionaryEvent[]) {
    const examples: any = {}
    
    for (const event of events.slice(0, 3)) { // Limit to first 3 events
      examples[event.event_name] = {
        summary: `Example ${event.event_name} event`,
        value: this.createEventExample(event)
      }
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

  private static getSchemaName(event: DataDictionaryEvent): string {
    return event.event_name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Event'
  }

  private static formatTitle(eventName: string): string {
    return eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Event'
  }

  private static countOperations(paths: any): number {
    let count = 0
    for (const path of Object.values(paths)) {
      count += Object.keys(path as any).length
    }
    return count
  }
}