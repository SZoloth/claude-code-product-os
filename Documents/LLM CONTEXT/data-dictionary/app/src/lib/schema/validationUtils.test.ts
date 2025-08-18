/**
 * Tests for UI validation utilities
 */

import { ValidationUtils, useValidation } from './validationUtils'
import { DataDictionary, DataDictionaryEvent, EventProperty } from './dataDictionary'

describe('ValidationUtils', () => {
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

  describe('validateField', () => {
    describe('event_name validation', () => {
      it('should validate valid event names', () => {
        const result = ValidationUtils.validateField('event_name', 'valid_event_name')
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid snake_case names', () => {
        const result = ValidationUtils.validateField('event_name', 'InvalidEventName')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('snake_case format')
      })

      it('should reject names that are too short', () => {
        const result = ValidationUtils.validateField('event_name', 'ab')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('at least 3 characters')
      })

      it('should reject names that are too long', () => {
        const longName = 'a'.repeat(65)
        const result = ValidationUtils.validateField('event_name', longName)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('64 characters or less')
      })

      it('should reject duplicate names', () => {
        const result = ValidationUtils.validateField('event_name', 'duplicate_name', {
          existingNames: ['duplicate_name', 'other_name']
        })
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('must be unique')
      })
    })

    describe('property_name validation', () => {
      it('should validate valid property names', () => {
        const result = ValidationUtils.validateField('property_name', 'valid_property')
        expect(result.isValid).toBe(true)
      })

      it('should reject invalid snake_case names', () => {
        const result = ValidationUtils.validateField('property_name', 'InvalidProperty')
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('snake_case format')
      })

      it('should reject duplicate property names', () => {
        const result = ValidationUtils.validateField('property_name', 'duplicate_prop', {
          existingNames: ['duplicate_prop', 'other_prop']
        })
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('must be unique within this event')
      })
    })

    describe('enum validations', () => {
      it('should validate event_type enum', () => {
        const validResult = ValidationUtils.validateField('event_type', 'success')
        expect(validResult.isValid).toBe(true)

        const invalidResult = ValidationUtils.validateField('event_type', 'invalid')
        expect(invalidResult.isValid).toBe(false)
        expect(invalidResult.error).toContain('must be one of: intent, success, failure')
      })

      it('should validate event_action_type enum', () => {
        const validResult = ValidationUtils.validateField('event_action_type', 'action')
        expect(validResult.isValid).toBe(true)

        const invalidResult = ValidationUtils.validateField('event_action_type', 'invalid')
        expect(invalidResult.isValid).toBe(false)
        expect(invalidResult.error).toContain('must be one of: action, error, feature_flag')
      })

      it('should validate lifecycle_status enum', () => {
        const validResult = ValidationUtils.validateField('lifecycle_status', 'proposed')
        expect(validResult.isValid).toBe(true)

        const invalidResult = ValidationUtils.validateField('lifecycle_status', 'invalid')
        expect(invalidResult.isValid).toBe(false)
        expect(invalidResult.error).toContain('must be one of: proposed, approved, implemented, deprecated')
      })

      it('should validate property_type enum', () => {
        const validResult = ValidationUtils.validateField('property_type', 'string')
        expect(validResult.isValid).toBe(true)

        const invalidResult = ValidationUtils.validateField('property_type', 'invalid')
        expect(invalidResult.isValid).toBe(false)
        expect(invalidResult.error).toContain('must be one of: string, number, boolean, enum, object, array, datetime')
      })
    })

    describe('text length validations', () => {
      it('should validate event_purpose length', () => {
        const validResult = ValidationUtils.validateField(
          'event_purpose', 
          'This is a valid event purpose description that meets the minimum length requirement'
        )
        expect(validResult.isValid).toBe(true)

        const shortResult = ValidationUtils.validateField('event_purpose', 'Too short')
        expect(shortResult.isValid).toBe(false)
        expect(shortResult.error).toContain('at least 20 characters')

        const longResult = ValidationUtils.validateField('event_purpose', 'x'.repeat(501))
        expect(longResult.isValid).toBe(false)
        expect(longResult.error).toContain('500 characters or less')
      })

      it('should validate when_to_fire length', () => {
        const validResult = ValidationUtils.validateField('when_to_fire', 'When user clicks button')
        expect(validResult.isValid).toBe(true)

        const shortResult = ValidationUtils.validateField('when_to_fire', 'Short')
        expect(shortResult.isValid).toBe(false)
        expect(shortResult.error).toContain('at least 10 characters')
      })
    })
  })

  describe('validateEventForUI', () => {
    it('should validate a well-formed event', () => {
      const event = createValidEvent()
      const result = ValidationUtils.validateEventForUI(event)

      expect(result.isValid).toBe(true)
      expect(result.fieldErrors.event_name.isValid).toBe(true)
      expect(result.fieldErrors.event_type.isValid).toBe(true)
    })

    it('should return field-specific errors', () => {
      const event = createValidEvent({
        event_name: 'InvalidName',
        event_type: 'invalid' as any
      })
      const result = ValidationUtils.validateEventForUI(event)

      expect(result.isValid).toBe(false)
      expect(result.fieldErrors.event_name.isValid).toBe(false)
      expect(result.fieldErrors.event_name.error).toContain('snake_case')
      expect(result.fieldErrors.event_type.isValid).toBe(false)
    })
  })

  describe('validateDictionaryForUI', () => {
    it('should validate a well-formed dictionary', () => {
      const dictionary = createValidDataDictionary()
      const result = ValidationUtils.validateDictionaryForUI(dictionary)

      expect(result.isValid).toBe(true)
      expect(result.summary.totalErrors).toBe(0)
      expect(result.summary.criticalIssues).toHaveLength(0)
    })

    it('should identify critical issues', () => {
      const event1 = createValidEvent({ event_name: 'duplicate_name' })
      const event2 = createValidEvent({ event_name: 'duplicate_name' })
      const dictionary = createValidDataDictionary([event1, event2])
      const result = ValidationUtils.validateDictionaryForUI(dictionary)

      expect(result.isValid).toBe(false)
      expect(result.summary.totalErrors).toBeGreaterThan(0)
      expect(result.summary.criticalIssues).toContain('Duplicate event names found')
    })

    it('should count errors per event', () => {
      const badEvent = createValidEvent({
        event_name: 'InvalidName',
        event_type: 'invalid' as any
      })
      const dictionary = createValidDataDictionary([badEvent])
      const result = ValidationUtils.validateDictionaryForUI(dictionary)

      expect(result.summary.eventErrorCount.InvalidName).toBeGreaterThan(0)
    })
  })

  describe('getValidationStatus', () => {
    it('should return valid status for clean dictionary', () => {
      const dictionary = createValidDataDictionary()
      const status = ValidationUtils.getValidationStatus(dictionary)

      expect(status.status).toBe('valid')
      expect(status.canExport).toBe(true)
      expect(status.message).toContain('ready to export')
    })

    it('should return error status for invalid dictionary', () => {
      const badEvent = createValidEvent({
        event_name: 'InvalidName'
      })
      const dictionary = createValidDataDictionary([badEvent])
      const status = ValidationUtils.getValidationStatus(dictionary)

      expect(status.status).toBe('error')
      expect(status.canExport).toBe(false)
      expect(status.message).toContain('validation error')
    })

    it('should return warning status for dictionary with warnings', () => {
      // Create intent event with minimal properties to trigger context warnings but no errors
      const intentEvent = createValidEvent({
        event_type: 'intent',
        event_action_type: 'action',
        datadog_api: 'addAction',
        properties: [] // Less than minimum of 2 for intent events - should warn but not error
      })
      const dictionary = createValidDataDictionary([intentEvent])
      const status = ValidationUtils.getValidationStatus(dictionary)

      expect(status.status).toBe('warning')
      expect(status.canExport).toBe(true)
      expect(status.message).toContain('recommendation')
    })
  })

  describe('suggestSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(ValidationUtils.suggestSnakeCase('camelCaseExample')).toBe('camel_case_example')
    })

    it('should convert spaces to underscores', () => {
      expect(ValidationUtils.suggestSnakeCase('event name with spaces')).toBe('event_name_with_spaces')
    })

    it('should remove invalid characters', () => {
      expect(ValidationUtils.suggestSnakeCase('event-name@#$%')).toBe('event_name')
    })

    it('should handle numbers at start', () => {
      expect(ValidationUtils.suggestSnakeCase('123event')).toBe('n123event')
    })

    it('should remove multiple underscores', () => {
      expect(ValidationUtils.suggestSnakeCase('event___name')).toBe('event_name')
    })

    it('should remove leading/trailing underscores', () => {
      expect(ValidationUtils.suggestSnakeCase('_event_name_')).toBe('event_name')
    })
  })

  describe('useValidation hook helpers', () => {
    it('should provide field validation', () => {
      const result = useValidation.validateField('event_name', 'valid_event_name')
      expect(result.isValid).toBe(true)
    })

    it('should provide form validation', () => {
      const event = createValidEvent()
      const result = useValidation.getFormValidation(event)
      expect(result.isValid).toBe(true)
    })

    it('should provide status validation', () => {
      const dictionary = createValidDataDictionary()
      const result = useValidation.getStatus(dictionary)
      expect(result.status).toBe('valid')
    })
  })
})