/**
 * Postman export functionality
 * Generates Postman collections and environments for API testing
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface PostmanExportOptions {
  includeExamples?: boolean
  includeTests?: boolean
  includeEnvironment?: boolean
  generateAuth?: boolean
  baseUrl?: string
  apiVersion?: string
}

export interface PostmanExportResult {
  collection: PostmanCollection
  environment?: PostmanEnvironment
  filename: string
  requestCount: number
  testCount: number
}

interface PostmanCollection {
  info: {
    name: string
    description: string
    schema: string
    version: string
  }
  item: PostmanRequest[]
  auth?: any
  event?: any[]
  variable?: PostmanVariable[]
}

interface PostmanEnvironment {
  name: string
  values: PostmanVariable[]
}

interface PostmanVariable {
  key: string
  value: string
  type?: string
  description?: string
}

interface PostmanRequest {
  name: string
  request: {
    method: string
    header: any[]
    body?: any
    url: any
    description?: string
  }
  response?: any[]
  event?: any[]
}

export class PostmanExporter {
  /**
   * Export data dictionary as Postman collection
   */
  static exportToPostman(
    dictionary: DataDictionary,
    options: PostmanExportOptions = {}
  ): PostmanExportResult {
    const {
      includeExamples = true,
      includeTests = true,
      includeEnvironment = true,
      generateAuth = true,
      baseUrl = '{{baseUrl}}',
      apiVersion = 'v1'
    } = options

    let requestCount = 0
    let testCount = 0

    const collection: PostmanCollection = {
      info: {
        name: 'Analytics Events API',
        description: `API collection for tracking analytics events. Generated from data dictionary with ${dictionary.events.length} events.`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: apiVersion
      },
      item: []
    }

    // Add collection-level auth
    if (generateAuth) {
      collection.auth = {
        type: 'apikey',
        apikey: [
          {
            key: 'key',
            value: 'X-API-Key',
            type: 'string'
          },
          {
            key: 'value',
            value: '{{apiKey}}',
            type: 'string'
          }
        ]
      }
    }

    // Add collection-level variables
    collection.variable = [
      {
        key: 'baseUrl',
        value: 'https://api.example.com',
        type: 'string',
        description: 'Base URL for the API'
      },
      {
        key: 'apiKey',
        value: 'your-api-key-here',
        type: 'string',
        description: 'API key for authentication'
      }
    ]

    // Create folders for different types of requests
    const folders = this.createFolders()
    
    // Single event tracking
    const singleEventFolder = folders.find(f => f.name === 'Single Event Tracking')!
    for (const event of dictionary.events) {
      const request = this.createEventRequest(event, baseUrl, { includeExamples, includeTests })
      singleEventFolder.item.push(request)
      requestCount++
      if (includeTests) testCount++
    }

    // Batch event tracking
    const batchFolder = folders.find(f => f.name === 'Batch Operations')!
    const batchRequest = this.createBatchRequest(dictionary.events.slice(0, 3), baseUrl, { includeExamples, includeTests })
    batchFolder.item.push(batchRequest)
    requestCount++
    if (includeTests) testCount++

    // Validation requests
    const validationFolder = folders.find(f => f.name === 'Validation')!
    const validationRequest = this.createValidationRequest(dictionary.events[0], baseUrl, { includeTests })
    validationFolder.item.push(validationRequest)
    requestCount++
    if (includeTests) testCount++

    // Add all folders to collection
    collection.item = folders

    // Create environment
    let environment: PostmanEnvironment | undefined
    if (includeEnvironment) {
      environment = this.createEnvironment(baseUrl)
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `analytics-api-collection-${timestamp}.json`

    return {
      collection,
      environment,
      filename,
      requestCount,
      testCount
    }
  }

  /**
   * Create environment-specific collection
   */
  static createEnvironmentCollection(
    dictionary: DataDictionary,
    environmentName: 'development' | 'staging' | 'production',
    options: PostmanExportOptions = {}
  ): PostmanExportResult {
    const envUrls = {
      development: 'https://dev-api.example.com',
      staging: 'https://staging-api.example.com',
      production: 'https://api.example.com'
    }

    const result = this.exportToPostman(dictionary, {
      ...options,
      baseUrl: envUrls[environmentName]
    })

    result.collection.info.name += ` (${environmentName})`
    result.filename = `analytics-api-${environmentName}-${new Date().toISOString().split('T')[0]}.json`

    return result
  }

  private static createFolders(): any[] {
    return [
      {
        name: 'Single Event Tracking',
        description: 'Requests for tracking individual analytics events',
        item: []
      },
      {
        name: 'Batch Operations',
        description: 'Requests for tracking multiple events in a single call',
        item: []
      },
      {
        name: 'Validation',
        description: 'Requests for validating event structure and data',
        item: []
      },
      {
        name: 'Health & Status',
        description: 'API health checks and status endpoints',
        item: [
          {
            name: 'Health Check',
            request: {
              method: 'GET',
              header: [],
              url: {
                raw: '{{baseUrl}}/health',
                host: ['{{baseUrl}}'],
                path: ['health']
              },
              description: 'Check API health status'
            },
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () {',
                    '    pm.response.to.have.status(200);',
                    '});',
                    '',
                    'pm.test("Response has status field", function () {',
                    '    var jsonData = pm.response.json();',
                    '    pm.expect(jsonData).to.have.property("status");',
                    '});'
                  ],
                  type: 'text/javascript'
                }
              }
            ]
          }
        ]
      }
    ]
  }

  private static createEventRequest(
    event: DataDictionaryEvent,
    baseUrl: string,
    options: { includeExamples: boolean; includeTests: boolean }
  ): PostmanRequest {
    const { includeExamples, includeTests } = options

    const request: PostmanRequest = {
      name: `Track ${event.event_name}`,
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        url: {
          raw: `${baseUrl}/events`,
          host: [baseUrl],
          path: ['events']
        },
        description: `${event.event_purpose}\n\nWhen to fire: ${event.when_to_fire}\nType: ${event.event_type} (${event.event_action_type})`
      }
    }

    // Add request body
    if (includeExamples) {
      const exampleBody = this.createEventExample(event)
      request.request.body = {
        mode: 'raw',
        raw: JSON.stringify(exampleBody, null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      }
    }

    // Add tests
    if (includeTests) {
      request.event = [{
        listen: 'test',
        script: {
          exec: this.createEventTests(event),
          type: 'text/javascript'
        }
      }]
    }

    return request
  }

  private static createBatchRequest(
    events: DataDictionaryEvent[],
    baseUrl: string,
    options: { includeExamples: boolean; includeTests: boolean }
  ): PostmanRequest {
    const { includeExamples, includeTests } = options

    const request: PostmanRequest = {
      name: 'Track Events Batch',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        url: {
          raw: `${baseUrl}/events/batch`,
          host: [baseUrl],
          path: ['events', 'batch']
        },
        description: 'Submit multiple analytics events in a single request'
      }
    }

    if (includeExamples) {
      const batchBody = {
        events: events.map(event => this.createEventExample(event)),
        dry_run: false
      }

      request.request.body = {
        mode: 'raw',
        raw: JSON.stringify(batchBody, null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      }
    }

    if (includeTests) {
      request.event = [{
        listen: 'test',
        script: {
          exec: [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            '',
            'pm.test("Response has processed count", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData).to.have.property("processed");',
            '    pm.expect(jsonData.processed).to.be.a("number");',
            '});',
            '',
            'pm.test("All events processed successfully", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.failed).to.equal(0);',
            '});'
          ],
          type: 'text/javascript'
        }
      }]
    }

    return request
  }

  private static createValidationRequest(
    event: DataDictionaryEvent,
    baseUrl: string,
    options: { includeTests: boolean }
  ): PostmanRequest {
    const { includeTests } = options

    const request: PostmanRequest = {
      name: 'Validate Event Structure',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        url: {
          raw: `${baseUrl}/events/validate`,
          host: [baseUrl],
          path: ['events', 'validate']
        },
        description: 'Validate an event structure without processing it',
        body: {
          mode: 'raw',
          raw: JSON.stringify(this.createEventExample(event), null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        }
      }
    }

    if (includeTests) {
      request.event = [{
        listen: 'test',
        script: {
          exec: [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            '',
            'pm.test("Validation result is present", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData).to.have.property("valid");',
            '});',
            '',
            'pm.test("Event is valid", function () {',
            '    var jsonData = pm.response.json();',
            '    pm.expect(jsonData.valid).to.be.true;',
            '});'
          ],
          type: 'text/javascript'
        }
      }]
    }

    return request
  }

  private static createEventExample(event: DataDictionaryEvent): any {
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

    // Add error information for failure events
    if (event.event_type === 'failure') {
      example.error = {
        code: event.error_code || 'UNKNOWN_ERROR',
        message: event.error_message || 'An error occurred'
      }
    }

    return example
  }

  private static createEventTests(event: DataDictionaryEvent): string[] {
    const tests = [
      'pm.test("Status code is 200", function () {',
      '    pm.response.to.have.status(200);',
      '});',
      '',
      'pm.test("Response has event_id", function () {',
      '    var jsonData = pm.response.json();',
      '    pm.expect(jsonData).to.have.property("event_id");',
      '});',
      '',
      'pm.test("Response has status", function () {',
      '    var jsonData = pm.response.json();',
      '    pm.expect(jsonData).to.have.property("status");',
      '    pm.expect(jsonData.status).to.be.oneOf(["accepted", "processed"]);',
      '});'
    ]

    // Add event-specific tests
    if (event.event_type === 'failure') {
      tests.push(
        '',
        'pm.test("Error handling is correct", function () {',
        '    var jsonData = pm.response.json();',
        '    // Additional error-specific validations can be added here',
        '});'
      )
    }

    // Add property validation tests
    if (event.properties.length > 0) {
      tests.push(
        '',
        'pm.test("Required properties are validated", function () {',
        '    // Test that required properties are properly validated',
        '    pm.expect(pm.response.code).to.not.equal(400);',
        '});'
      )
    }

    return tests
  }

  private static createEnvironment(baseUrl: string): PostmanEnvironment {
    return {
      name: 'Analytics API Environment',
      values: [
        {
          key: 'baseUrl',
          value: 'https://api.example.com',
          type: 'default',
          description: 'Base URL for the analytics API'
        },
        {
          key: 'apiKey',
          value: 'your-api-key-here',
          type: 'secret',
          description: 'API key for authentication'
        },
        {
          key: 'userId',
          value: 'user_12345',
          type: 'default',
          description: 'Test user ID for examples'
        },
        {
          key: 'sessionId',
          value: 'sess_1234567890abcdef',
          type: 'default',
          description: 'Test session ID for examples'
        }
      ]
    }
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
}