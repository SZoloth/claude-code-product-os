/**
 * Unit tests for schema validation system
 */

import { 
  DataDictionaryValidator,
  validateDataDictionary,
  validateEvent,
  validateProperty,
  validateCsvCompatibility
} from './validator'
import { DataDictionary, DataDictionaryEvent, EventProperty } from './dataDictionary'

describe('DataDictionaryValidator', () => {
  let validator: DataDictionaryValidator

  beforeEach(() => {
    validator = new DataDictionaryValidator()
  })

  const createValidEvent = (overrides: Partial<DataDictionaryEvent> = {}): DataDictionaryEvent => ({
    event_name: 'test_event_created',
    event_type: 'success',
    event_action_type: 'action',
    event_purpose: 'Track when users successfully create test events for validation purposes',
    when_to_fire: 'When user completes test event creation',
    actor: 'authenticated_user',
    object: 'test_event',
    context_surface: 'admin_dashboard',
    properties: [
      {
        name: 'event_category',
        type: 'string',
        required: true,
        example: 'user_action',
        description: 'Category of the event being tracked'
      }
    ],
    lifecycle_status: 'proposed',
    datadog_api: 'addAction',
    ...overrides
  })

  const createValidDataDictionary = (events?: DataDictionaryEvent[]): DataDictionary => ({
    version: '1.0',
    generatedAtIso: new Date().toISOString(),
    events: events ?? [createValidEvent()]
  })

  describe('Event Validation', () => {
    it('should validate a well-formed event', () => {
      const event = createValidEvent()
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require snake_case event names', () => {
      const event = createValidEvent({ event_name: 'InvalidEventName' })
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must match pattern'))).toBe(true)
    })

    it('should enforce minimum event_purpose length', () => {
      const event = createValidEvent({ event_purpose: 'Too short' })
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field.includes('event_purpose'))).toBe(true)
    })

    it('should validate required fields', () => {
      const event = createValidEvent()
      delete (event as any).event_name
      
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('required'))).toBe(true)
    })

    it('should validate event_type enum', () => {
      const event = createValidEvent({ event_type: 'invalid' as any })
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must be equal to one of the allowed values'))).toBe(true)
    })

    it('should validate event_action_type enum', () => {
      const event = createValidEvent({ event_action_type: 'invalid' as any })
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must be equal to one of the allowed values'))).toBe(true)
    })

    it('should validate lifecycle_status enum', () => {
      const event = createValidEvent({ lifecycle_status: 'invalid' as any })
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must be equal to one of the allowed values'))).toBe(true)
    })

    it('should validate datadog_api enum', () => {
      const event = createValidEvent({ datadog_api: 'invalid' as any })
      const result = validator.validateEvent(event)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must be equal to one of the allowed values'))).toBe(true)
    })
  })

  describe('Property Validation', () => {
    const createValidProperty = (overrides: Partial<EventProperty> = {}): EventProperty => ({
      name: 'test_property',
      type: 'string',
      required: true,
      example: 'test_value',
      description: 'Test property for validation',
      ...overrides
    })

    it('should validate a well-formed property', () => {
      const property = createValidProperty()
      const result = validator.validateProperty(property)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require snake_case property names', () => {
      const property = createValidProperty({ name: 'InvalidPropertyName' })
      const result = validator.validateProperty(property)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must match pattern') || e.message.includes('snake_case'))).toBe(true)
    })

    it('should validate property type enum', () => {
      const property = createValidProperty({ type: 'invalid' as any })
      const result = validator.validateProperty(property)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must be equal to one of the allowed values'))).toBe(true)
    })

    it('should require property name minimum length', () => {
      const property = createValidProperty({ name: 'a' })
      const result = validator.validateProperty(property)
      
      expect(result.isValid).toBe(false)
    })
  })

  describe('Data Dictionary Validation', () => {
    it('should validate a well-formed data dictionary', () => {
      const dictionary = createValidDataDictionary()
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require unique event names', () => {
      const event1 = createValidEvent({ event_name: 'duplicate_event' })
      const event2 = createValidEvent({ event_name: 'duplicate_event' })
      const dictionary = createValidDataDictionary([event1, event2])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Duplicate event name'))).toBe(true)
    })

    it('should require unique property names within an event', () => {
      const eventWithDuplicateProps = createValidEvent({
        properties: [
          {
            name: 'duplicate_prop',
            type: 'string',
            required: true,
            example: 'value1',
            description: 'First property'
          },
          {
            name: 'duplicate_prop',
            type: 'number',
            required: false,
            example: 123,
            description: 'Second property with same name'
          }
        ]
      })
      const dictionary = createValidDataDictionary([eventWithDuplicateProps])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Duplicate property name'))).toBe(true)
    })

    it('should require at least one event', () => {
      const dictionary: DataDictionary = {
        version: '1.0',
        generatedAtIso: new Date().toISOString(),
        events: [] // Empty array
      }
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('must have at least') || e.message.includes('minItems'))).toBe(true)
    })

    it('should validate version format', () => {
      const dictionary = createValidDataDictionary()
      dictionary.version = 'invalid-version'
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field.includes('version'))).toBe(true)
    })

    it('should validate ISO timestamp format', () => {
      const dictionary = createValidDataDictionary()
      dictionary.generatedAtIso = 'invalid-date'
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field.includes('generatedAtIso'))).toBe(true)
    })
  })

  describe('Failure Event Validation', () => {
    it('should warn when failure events lack error context', () => {
      const failureEvent = createValidEvent({
        event_type: 'failure',
        event_action_type: 'action',
        datadog_api: 'addError',
        properties: [] // No error properties
        // No error_code, error_message, or notes
      })
      const dictionary = createValidDataDictionary([failureEvent])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('Failure events should include error')
      )).toBe(true)
    })

    it('should not warn when failure events have error_code', () => {
      const failureEvent = createValidEvent({
        event_type: 'failure',
        error_code: 'VALIDATION_ERROR'
      })
      const dictionary = createValidDataDictionary([failureEvent])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('Failure events should include error')
      )).toBe(false)
    })

    it('should not warn when failure events have error properties', () => {
      const failureEvent = createValidEvent({
        event_type: 'failure',
        properties: [{
          name: 'error_type',
          type: 'string',
          required: true,
          example: 'validation',
          description: 'Type of error that occurred'
        }]
      })
      const dictionary = createValidDataDictionary([failureEvent])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('Failure events should include error')
      )).toBe(false)
    })
  })

  describe('Datadog API Mapping Validation', () => {
    it('should warn about incorrect feature_flag mapping', () => {
      const event = createValidEvent({
        event_action_type: 'feature_flag',
        datadog_api: 'addAction' // Should be addFeatureFlagEvaluation
      })
      const dictionary = createValidDataDictionary([event])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('Expected \'addFeatureFlagEvaluation\'')
      )).toBe(true)
    })

    it('should warn about incorrect error mapping', () => {
      const event = createValidEvent({
        event_action_type: 'error',
        datadog_api: 'addAction' // Should be addError
      })
      const dictionary = createValidDataDictionary([event])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('Expected \'addError\'')
      )).toBe(true)
    })

    it('should warn about incorrect failure action mapping', () => {
      const event = createValidEvent({
        event_type: 'failure',
        event_action_type: 'action',
        datadog_api: 'addAction' // Should be addError
      })
      const dictionary = createValidDataDictionary([event])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('Expected \'addError\'')
      )).toBe(true)
    })
  })

  describe('Context Requirements Validation', () => {
    it('should warn when intent events have insufficient context', () => {
      const intentEvent = createValidEvent({
        event_type: 'intent',
        properties: [] // Less than minimum of 2
      })
      const dictionary = createValidDataDictionary([intentEvent])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('intent events should have at least 2 context properties')
      )).toBe(true)
    })

    it('should not warn when intent events have sufficient context', () => {
      const intentEvent = createValidEvent({
        event_type: 'intent',
        properties: [
          {
            name: 'user_segment',
            type: 'string',
            required: true,
            example: 'premium'
          },
          {
            name: 'feature_context',
            type: 'string',
            required: true,
            example: 'dashboard'
          }
        ]
      })
      const dictionary = createValidDataDictionary([intentEvent])
      
      const result = validator.validateDataDictionary(dictionary)
      
      expect(result.warnings.some(w => 
        w.message.includes('intent events should have at least')
      )).toBe(false)
    })
  })

  describe('CSV Compatibility Validation', () => {
    it('should validate CSV export compatibility', () => {
      const dictionary = createValidDataDictionary()
      const result = validator.validateCsvCompatibility(dictionary)
      
      expect(result.isValid).toBe(true)
    })

    it('should error when required CSV columns are missing', () => {
      const event = createValidEvent()
      delete (event as any).event_name
      const dictionary = createValidDataDictionary([event])
      
      const result = validator.validateCsvCompatibility(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('Required CSV column'))).toBe(true)
    })

    it('should validate JSON serialization of properties', () => {
      const event = createValidEvent({
        properties: [{
          name: 'test_prop',
          type: 'string',
          required: true
        }] as any
      })
      
      // Create circular reference to break JSON serialization
      const circularProperty = { name: 'circular', type: 'object' } as any
      circularProperty.self = circularProperty
      event.properties.push(circularProperty)
      
      const dictionary = createValidDataDictionary([event])
      const result = validator.validateCsvCompatibility(dictionary)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => 
        e.message.includes('cannot be serialized to JSON')
      )).toBe(true)
    })
  })

  describe('Exported Helper Functions', () => {
    it('should export validateDataDictionary function', () => {
      const dictionary = createValidDataDictionary()
      const result = validateDataDictionary(dictionary)
      
      expect(result.isValid).toBe(true)
    })

    it('should export validateEvent function', () => {
      const event = createValidEvent()
      const result = validateEvent(event)
      
      expect(result.isValid).toBe(true)
    })

    it('should export validateProperty function', () => {
      const property: EventProperty = {
        name: 'test_property',
        type: 'string',
        required: true
      }
      const result = validateProperty(property)
      
      expect(result.isValid).toBe(true)
    })

    it('should export validateCsvCompatibility function', () => {
      const dictionary = createValidDataDictionary()
      const result = validateCsvCompatibility(dictionary)
      
      expect(result.isValid).toBe(true)
    })
  })
})