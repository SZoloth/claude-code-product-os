/**
 * JSON Schema definitions for Data Dictionary validation
 * Implements Section 7 schema requirements for CSV export compatibility
 */

export interface JSONSchema {
  $schema?: string
  type?: string
  properties?: Record<string, any>
  required?: string[]
  additionalProperties?: boolean
  definitions?: Record<string, any>
  items?: JSONSchema
  enum?: any[]
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  format?: string
  oneOf?: JSONSchema[]
  anyOf?: JSONSchema[]
  allOf?: JSONSchema[]
  if?: JSONSchema
  then?: JSONSchema
  const?: any
  maxItems?: number
  uniqueItems?: boolean
  minItems?: number
}

/**
 * JSON Schema for EventProperty
 */
export const eventPropertySchema: JSONSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    name: {
      type: "string",
      pattern: "^[a-z][a-z0-9_]*[a-z0-9]$",
      minLength: 2,
      maxLength: 64,
      description: "Property name in snake_case format"
    },
    type: {
      type: "string",
      enum: ["string", "number", "boolean", "enum", "object", "array", "datetime"],
      description: "Data type of the property"
    },
    required: {
      type: "boolean",
      description: "Whether this property is required for the event"
    },
    example: {
      oneOf: [
        { type: "string" },
        { type: "number" },
        { type: "boolean" },
        { type: "null" }
      ],
      description: "Example value for documentation"
    },
    description: {
      type: "string",
      minLength: 1,
      maxLength: 500,
      description: "Human-readable description of the property"
    }
  },
  required: ["name", "type", "required"],
  additionalProperties: false
}

/**
 * JSON Schema for DataDictionaryEvent (Section 7 fields)
 */
export const dataDictionaryEventSchema: JSONSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    event_name: {
      type: "string",
      pattern: "^[a-z][a-z0-9_]*[a-z0-9]$",
      minLength: 3,
      maxLength: 64,
      description: "Unique event name in snake_case format"
    },
    event_type: {
      type: "string",
      enum: ["intent", "success", "failure"],
      description: "Event classification following Intent-Success-Failure pattern"
    },
    event_action_type: {
      type: "string",
      enum: ["action", "error", "feature_flag"],
      description: "Type of action being tracked"
    },
    event_purpose: {
      type: "string",
      minLength: 20,
      maxLength: 500,
      description: "Clear business justification for tracking this event"
    },
    user_story: {
      type: "string",
      minLength: 10,
      maxLength: 200,
      description: "Optional user story format description"
    },
    when_to_fire: {
      type: "string",
      minLength: 10,
      maxLength: 300,
      description: "Specific trigger conditions for the event"
    },
    actor: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      description: "Who performs this action (user, system, admin, etc.)"
    },
    object: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      description: "What is being acted upon"
    },
    context_surface: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      description: "Where in the product this happens"
    },
    properties: {
      type: "array",
      items: eventPropertySchema,
      maxItems: 20,
      description: "Context properties for segmentation"
    },
    context_keys: {
      type: "array",
      items: {
        type: "string",
        minLength: 2,
        maxLength: 50
      },
      maxItems: 10,
      uniqueItems: true,
      description: "Key context properties for quick reference"
    },
    ownership_team: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      description: "Team responsible for this event"
    },
    priority: {
      type: "string",
      enum: ["Low", "Medium", "High"],
      description: "Business priority level"
    },
    lifecycle_status: {
      type: "string",
      enum: ["proposed", "approved", "implemented", "deprecated"],
      description: "Current status in development lifecycle"
    },
    notes: {
      type: "string",
      minLength: 1,
      maxLength: 1000,
      description: "Additional notes, uncertainties, or implementation details"
    },
    datadog_api: {
      type: "string",
      enum: ["addAction", "addError", "addFeatureFlagEvaluation"],
      description: "Corresponding Datadog API method"
    },
    datadog_sample_code: {
      type: "string",
      minLength: 10,
      maxLength: 2000,
      description: "Generated implementation code sample"
    },
    error_code: {
      type: "string",
      minLength: 1,
      maxLength: 50,
      description: "Error code for failure events"
    },
    error_message: {
      type: "string",
      minLength: 1,
      maxLength: 200,
      description: "Error message for failure events"
    }
  },
  required: [
    "event_name",
    "event_type", 
    "event_action_type",
    "event_purpose",
    "when_to_fire",
    "actor",
    "object", 
    "context_surface",
    "properties",
    "lifecycle_status",
    "datadog_api"
  ],
  additionalProperties: false,
  allOf: [
    {
      // Failure events should have error context when event_type is 'failure'
      if: {
        properties: { event_type: { const: "failure" } }
      },
      then: {
        anyOf: [
          { required: ["error_code"] },
          { required: ["error_message"] },
          {
            properties: {
              notes: {
                type: "string",
                minLength: 1
              }
            },
            required: ["notes"]
          }
        ]
      }
    }
  ]
}

/**
 * JSON Schema for complete DataDictionary
 */
export const dataDictionarySchema: JSONSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    version: {
      type: "string",
      pattern: "^\\d+\\.\\d+(\\.\\d+)?$",
      description: "Schema version"
    },
    generatedAtIso: {
      type: "string",
      format: "date-time",
      description: "ISO timestamp when dictionary was generated"
    },
    events: {
      type: "array",
      items: dataDictionaryEventSchema,
      minItems: 1,
      maxItems: 100,
      description: "Array of event definitions"
    }
  },
  required: ["version", "generatedAtIso", "events"],
  additionalProperties: false
}

/**
 * Section 7 CSV Column Schema - defines the expected columns for CSV export
 * This ensures compatibility with external systems expecting specific column format
 */
export const csvColumnSchema = {
  event_name: { type: "string", required: true, csvIndex: 0 },
  event_type: { type: "string", required: true, csvIndex: 1 },
  event_action_type: { type: "string", required: true, csvIndex: 2 },
  event_purpose: { type: "string", required: true, csvIndex: 3 },
  user_story: { type: "string", required: false, csvIndex: 4 },
  when_to_fire: { type: "string", required: true, csvIndex: 5 },
  actor: { type: "string", required: true, csvIndex: 6 },
  object: { type: "string", required: true, csvIndex: 7 },
  context_surface: { type: "string", required: true, csvIndex: 8 },
  properties: { type: "json", required: true, csvIndex: 9, serialized: true },
  context_keys: { type: "json", required: false, csvIndex: 10, serialized: true },
  ownership_team: { type: "string", required: false, csvIndex: 11 },
  priority: { type: "string", required: false, csvIndex: 12 },
  lifecycle_status: { type: "string", required: true, csvIndex: 13 },
  notes: { type: "string", required: false, csvIndex: 14 },
  datadog_api: { type: "string", required: true, csvIndex: 15 },
  datadog_sample_code: { type: "string", required: false, csvIndex: 16 },
  error_code: { type: "string", required: false, csvIndex: 17 },
  error_message: { type: "string", required: false, csvIndex: 18 }
} as const

/**
 * Get ordered CSV column headers based on Section 7 schema
 */
export function getCsvColumnHeaders(): string[] {
  return Object.entries(csvColumnSchema)
    .sort(([, a], [, b]) => a.csvIndex - b.csvIndex)
    .map(([columnName]) => columnName)
}

/**
 * Get required CSV columns
 */
export function getRequiredCsvColumns(): string[] {
  return Object.entries(csvColumnSchema)
    .filter(([, config]) => config.required)
    .map(([columnName]) => columnName)
}

/**
 * Validation constraints for specific field combinations
 */
export const validationRules = {
  // Event name uniqueness (enforced at dictionary level)
  uniqueEventNames: true,
  
  // Snake case validation pattern
  snakeCasePattern: /^[a-z][a-z0-9_]*[a-z0-9]$/,
  
  // Datadog API mapping rules
  datadogApiRules: {
    feature_flag: 'addFeatureFlagEvaluation',
    error: 'addError',
    action_failure: 'addError',
    action_intent: 'addAction',
    action_success: 'addAction'
  },
  
  // Minimum context requirements
  minimumProperties: {
    intent: 2, // Intent events need sufficient context
    success: 1, // Success events need outcome context
    failure: 1  // Failure events need error context
  }
} as const

export type CsvColumnConfig = typeof csvColumnSchema[keyof typeof csvColumnSchema]