/**
 * Unit tests for DataDictionaryPostProcessor
 */

import { DataDictionaryPostProcessor } from './postProcessor'
import { DataDictionary, EventType } from '../schema/dataDictionary'

describe('DataDictionaryPostProcessor', () => {
  describe('processLLMResponse', () => {
    it('should process valid JSON response correctly', () => {
      const rawResponse = JSON.stringify({
        version: '1.0',
        generatedAtIso: '2025-01-15T10:30:00Z',
        events: [
          {
            event_name: 'user_login_attempt',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Track when users attempt to log into the application',
            when_to_fire: 'When user clicks login button',
            actor: 'user',
            object: 'login_form',
            context_surface: 'login_page',
            properties: [
              {
                name: 'login_method',
                type: 'string',
                required: true,
                example: 'email',
                description: 'Method used for login attempt'
              }
            ],
            lifecycle_status: 'proposed',
            datadog_api: 'addAction'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.dataDictionary.events).toHaveLength(1)
      expect(result.dataDictionary.events[0].event_name).toBe('user_login_attempt')
      expect(result.confidence).toBeGreaterThan(80)
    })

    it('should handle JSON in markdown code blocks', () => {
      const rawResponse = `
Here's the data dictionary:

\`\`\`json
{
  "version": "1.0",
  "events": [
    {
      "event_name": "test_event",
      "event_type": "intent",
      "event_action_type": "action",
      "event_purpose": "Test event for validation",
      "when_to_fire": "Test trigger",
      "actor": "user",
      "object": "test",
      "context_surface": "test_page",
      "properties": [],
      "lifecycle_status": "proposed",
      "datadog_api": "addAction"
    }
  ]
}
\`\`\`
      `

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.isValid).toBe(true)
      expect(result.dataDictionary.events).toHaveLength(1)
      expect(result.dataDictionary.events[0].event_name).toBe('test_event')
    })

    it('should normalize event names to snake_case', () => {
      const rawResponse = JSON.stringify({
        events: [
          {
            event_name: 'User Login Attempt!',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Test event',
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [],
            lifecycle_status: 'proposed'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.dataDictionary.events[0].event_name).toBe('user_login_attempt')
    })

    it('should handle duplicate event names', () => {
      const rawResponse = JSON.stringify({
        events: [
          {
            event_name: 'test_event',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'First test event',
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [],
            lifecycle_status: 'proposed'
          },
          {
            event_name: 'test_event',
            event_type: 'success',
            event_action_type: 'action',
            event_purpose: 'Second test event',
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [],
            lifecycle_status: 'proposed'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.dataDictionary.events).toHaveLength(2)
      expect(result.dataDictionary.events[0].event_name).toBe('test_event')
      expect(result.dataDictionary.events[1].event_name).toBe('test_event_1')
      expect(result.warnings).toContain('Duplicate event name "test_event" renamed to "test_event_1"')
    })

    it('should auto-map Datadog API based on event type', () => {
      const rawResponse = JSON.stringify({
        events: [
          {
            event_name: 'success_event',
            event_type: 'success',
            event_action_type: 'action',
            event_purpose: 'Success event',
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [],
            lifecycle_status: 'proposed'
          },
          {
            event_name: 'failure_event',
            event_type: 'failure',
            event_action_type: 'error',
            event_purpose: 'Failure event',
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [],
            lifecycle_status: 'proposed'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.dataDictionary.events[0].datadog_api).toBe('addAction')
      expect(result.dataDictionary.events[1].datadog_api).toBe('addError')
    })

    it('should validate failure events have error context', () => {
      const rawResponse = JSON.stringify({
        events: [
          {
            event_name: 'login_failure',
            event_type: 'failure',
            event_action_type: 'error',
            event_purpose: 'Track login failures',
            when_to_fire: 'When login fails',
            actor: 'user',
            object: 'login',
            context_surface: 'login_page',
            properties: [],
            lifecycle_status: 'proposed',
            datadog_api: 'addError'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.warnings).toContain('Failure event "login_failure" should include error_code and/or error_message')
      expect(result.uncertainties).toContain('login_failure: Failure event lacks error context for debugging')
    })

    it('should normalize property types', () => {
      const rawResponse = JSON.stringify({
        events: [
          {
            event_name: 'test_event',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Test event with properties',
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [
              {
                name: 'User ID',
                type: 'invalid_type',
                required: true,
                example: 123
              },
              {
                name: 'timestamp',
                type: 'datetime',
                required: false,
                description: 'Event timestamp'
              }
            ],
            lifecycle_status: 'proposed'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      const properties = result.dataDictionary.events[0].properties
      expect(properties).toHaveLength(2)
      expect(properties[0].name).toBe('user_id')
      expect(properties[0].type).toBe('string') // Invalid type normalized to string
      expect(properties[1].name).toBe('timestamp')
      expect(properties[1].type).toBe('datetime')
    })

    it('should handle invalid JSON gracefully', () => {
      const rawResponse = 'This is not valid JSON'

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toMatch(/Critical parsing error/)
      expect(result.dataDictionary.events).toHaveLength(0)
      expect(result.confidence).toBe(0)
    })

    it('should handle missing events array', () => {
      const rawResponse = JSON.stringify({
        version: '1.0',
        generatedAtIso: '2025-01-15T10:30:00Z'
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Response missing "events" property')
    })

    it('should calculate confidence based on data quality', () => {
      const highQualityResponse = JSON.stringify({
        events: [
          {
            event_name: 'high_quality_event',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'This is a detailed event purpose with clear business value',
            user_story: 'As a user, I want to...',
            when_to_fire: 'Specific trigger condition',
            actor: 'authenticated_user',
            object: 'product_catalog',
            context_surface: 'search_results_page',
            properties: [
              {
                name: 'search_term',
                type: 'string',
                required: true,
                example: 'wireless headphones',
                description: 'User search query'
              }
            ],
            context_keys: ['user_id', 'session_id'],
            lifecycle_status: 'proposed',
            datadog_api: 'addAction'
          }
        ]
      })

      const lowQualityResponse = JSON.stringify({
        events: [
          {
            event_name: 'event',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Basic event',
            when_to_fire: 'When triggered',
            actor: 'user',
            object: 'thing',
            context_surface: 'page',
            properties: [],
            lifecycle_status: 'proposed'
          }
        ]
      })

      const highQualityResult = DataDictionaryPostProcessor.processLLMResponse(highQualityResponse)
      const lowQualityResult = DataDictionaryPostProcessor.processLLMResponse(lowQualityResponse)

      expect(highQualityResult.confidence).toBeGreaterThan(lowQualityResult.confidence)
      expect(highQualityResult.confidence).toBeGreaterThan(80)
      expect(lowQualityResult.confidence).toBeLessThan(60)
    })

    it('should extract uncertainties from notes and missing data', () => {
      const rawResponse = JSON.stringify({
        events: [
          {
            event_name: 'uncertain_event',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Brief purpose', // Should trigger uncertainty
            when_to_fire: 'Test trigger',
            actor: 'user',
            object: 'test',
            context_surface: 'test_page',
            properties: [], // Should trigger uncertainty
            lifecycle_status: 'proposed',
            notes: 'Uncertain about the exact implementation details'
          }
        ]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(rawResponse)

      expect(result.uncertainties).toContain('uncertain_event: Uncertain about the exact implementation details')
      expect(result.uncertainties).toContain('uncertain_event: No context properties defined - may limit segmentation capabilities')
      expect(result.uncertainties).toContain('uncertain_event: Brief event purpose may need clarification')
    })
  })
})