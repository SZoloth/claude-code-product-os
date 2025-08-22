/**
 * Unit tests for Datadog API mapping functionality
 * Tests the comprehensive mapping between event_type, event_action_type, and datadog_api
 */

import { DataDictionaryPostProcessor } from './postProcessor'

describe('Datadog API Mapping', () => {
  const createTestEvent = (overrides: any = {}) => ({
    version: '1.0',
    events: [{
      event_name: 'test_event',
      event_type: 'intent',
      event_action_type: 'action',
      event_purpose: 'Test event for mapping validation',
      when_to_fire: 'When test condition is met',
      actor: 'user',
      object: 'test_object',
      context_surface: 'test_app',
      properties: [],
      lifecycle_status: 'proposed',
      ...overrides
    }]
  })

  describe('Feature Flag Events', () => {
    it('should map feature_flag action type to addFeatureFlagEvaluation regardless of event_type', () => {
      const testCases = [
        { event_type: 'intent', event_action_type: 'feature_flag' },
        { event_type: 'success', event_action_type: 'feature_flag' },
        { event_type: 'failure', event_action_type: 'feature_flag' }
      ]

      testCases.forEach(({ event_type, event_action_type }) => {
        const event = createTestEvent({ event_type, event_action_type })
        const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
        
        expect(result.dataDictionary.events[0].datadog_api).toBe('addFeatureFlagEvaluation')
        expect(result.dataDictionary.events[0].event_type).toBe(event_type)
        expect(result.dataDictionary.events[0].event_action_type).toBe(event_action_type)
      })
    })
  })

  describe('Error Events', () => {
    it('should map error action type to addError regardless of event_type', () => {
      const testCases = [
        { event_type: 'intent', event_action_type: 'error' },
        { event_type: 'success', event_action_type: 'error' },
        { event_type: 'failure', event_action_type: 'error' }
      ]

      testCases.forEach(({ event_type, event_action_type }) => {
        const event = createTestEvent({ event_type, event_action_type })
        const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
        
        expect(result.dataDictionary.events[0].datadog_api).toBe('addError')
        expect(result.dataDictionary.events[0].event_type).toBe(event_type)
        expect(result.dataDictionary.events[0].event_action_type).toBe(event_action_type)
      })
    })
  })

  describe('Action Events', () => {
    it('should map action + failure to addError', () => {
      const event = createTestEvent({ 
        event_type: 'failure', 
        event_action_type: 'action' 
      })
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
      
      expect(result.dataDictionary.events[0].datadog_api).toBe('addError')
      expect(result.dataDictionary.events[0].event_type).toBe('failure')
      expect(result.dataDictionary.events[0].event_action_type).toBe('action')
    })

    it('should map action + intent to addAction', () => {
      const event = createTestEvent({ 
        event_type: 'intent', 
        event_action_type: 'action' 
      })
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
      
      expect(result.dataDictionary.events[0].datadog_api).toBe('addAction')
      expect(result.dataDictionary.events[0].event_type).toBe('intent')
      expect(result.dataDictionary.events[0].event_action_type).toBe('action')
    })

    it('should map action + success to addAction', () => {
      const event = createTestEvent({ 
        event_type: 'success', 
        event_action_type: 'action' 
      })
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
      
      expect(result.dataDictionary.events[0].datadog_api).toBe('addAction')
      expect(result.dataDictionary.events[0].event_type).toBe('success')
      expect(result.dataDictionary.events[0].event_action_type).toBe('action')
    })
  })

  describe('Explicit Datadog API Values', () => {
    it('should preserve valid explicit datadog_api values', () => {
      const testCases = [
        { datadog_api: 'addAction' },
        { datadog_api: 'addError' },
        { datadog_api: 'addFeatureFlagEvaluation' }
      ]

      testCases.forEach(({ datadog_api }) => {
        const event = createTestEvent({ 
          event_type: 'intent',
          event_action_type: 'action',
          datadog_api
        })
        const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
        
        expect(result.dataDictionary.events[0].datadog_api).toBe(datadog_api)
      })
    })

    it('should normalize case-insensitive explicit values', () => {
      const testCases = [
        { input: 'addaction', expected: 'addAction' },
        { input: 'ADDERROR', expected: 'addError' },
        { input: 'AddFeatureFlagEvaluation', expected: 'addFeatureFlagEvaluation' }
      ]

      testCases.forEach(({ input, expected }) => {
        const event = createTestEvent({ 
          event_type: 'intent',
          event_action_type: 'action',
          datadog_api: input
        })
        const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
        
        expect(result.dataDictionary.events[0].datadog_api).toBe(expected)
      })
    })

    it('should fall back to auto-mapping for invalid explicit values', () => {
      const event = createTestEvent({ 
        event_type: 'failure',
        event_action_type: 'action',
        datadog_api: 'invalid_api_value'
      })
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
      
      // Should fall back to mapping failure + action = addError
      expect(result.dataDictionary.events[0].datadog_api).toBe('addError')
    })
  })

  describe('Default and Edge Cases', () => {
    it('should default to addAction when no event types are provided', () => {
      const event = {
        version: '1.0',
        events: [{
          event_name: 'minimal_event',
          event_purpose: 'Test event',
          when_to_fire: 'When triggered',
          actor: 'user',
          object: 'object',
          context_surface: 'app',
          properties: [],
          lifecycle_status: 'proposed'
          // No event_type or event_action_type provided
        }]
      }
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
      
      expect(result.dataDictionary.events[0].datadog_api).toBe('addAction')
      // Should also get defaults for missing fields
      expect(result.dataDictionary.events[0].event_type).toBe('intent')
      expect(result.dataDictionary.events[0].event_action_type).toBe('action')
    })

    it('should handle legacy event_type only mapping for backward compatibility', () => {
      const event = {
        version: '1.0',
        events: [{
          event_name: 'legacy_failure',
          event_type: 'failure',
          // No event_action_type specified
          event_purpose: 'Legacy failure event',
          when_to_fire: 'When failure occurs',
          actor: 'system',
          object: 'process',
          context_surface: 'backend',
          properties: [],
          lifecycle_status: 'proposed'
        }]
      }
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(event))
      
      expect(result.dataDictionary.events[0].datadog_api).toBe('addError')
      expect(result.dataDictionary.events[0].event_type).toBe('failure')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle multiple events with different mapping patterns', () => {
      const events = {
        version: '1.0',
        events: [
          {
            event_name: 'user_login_intent',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Track login attempts',
            when_to_fire: 'When user starts login',
            actor: 'user',
            object: 'login_form',
            context_surface: 'web',
            properties: [],
            lifecycle_status: 'proposed'
          },
          {
            event_name: 'api_error_occurred',
            event_type: 'failure',
            event_action_type: 'error',
            event_purpose: 'Track API failures',
            when_to_fire: 'When API returns error',
            actor: 'system',
            object: 'api',
            context_surface: 'backend',
            properties: [],
            lifecycle_status: 'proposed'
          },
          {
            event_name: 'feature_flag_evaluated',
            event_type: 'success',
            event_action_type: 'feature_flag',
            event_purpose: 'Track feature flag exposures',
            when_to_fire: 'When feature flag is evaluated',
            actor: 'system',
            object: 'feature_flag',
            context_surface: 'app',
            properties: [],
            lifecycle_status: 'proposed'
          }
        ]
      }

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(events))

      expect(result.dataDictionary.events).toHaveLength(3)
      expect(result.dataDictionary.events[0].datadog_api).toBe('addAction')
      expect(result.dataDictionary.events[1].datadog_api).toBe('addError')
      expect(result.dataDictionary.events[2].datadog_api).toBe('addFeatureFlagEvaluation')
    })

    it('should provide mapping summary in reasoning text', () => {
      const events = {
        version: '1.0',
        events: [
          {
            event_name: 'action_event',
            event_type: 'intent',
            event_action_type: 'action',
            event_purpose: 'Test action',
            when_to_fire: 'When action occurs',
            actor: 'user',
            object: 'button',
            context_surface: 'web',
            properties: [],
            lifecycle_status: 'proposed'
          },
          {
            event_name: 'error_event',
            event_type: 'failure',
            event_action_type: 'error',
            event_purpose: 'Test error',
            when_to_fire: 'When error occurs',
            actor: 'system',
            object: 'api',
            context_surface: 'backend',
            properties: [],
            lifecycle_status: 'proposed'
          }
        ]
      }

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(events))

      expect(result.reasoning).toContain('events')
      expect(result.reasoning).toContain('Intent-Success-Failure')
    })

    it('should automatically generate datadog sample code', () => {
      const events = {
        version: '1.0',
        events: [
          {
            event_name: 'user_checkout_completed',
            event_type: 'success',
            event_action_type: 'action',
            event_purpose: 'Track successful checkout completion',
            when_to_fire: 'When checkout process completes successfully',
            actor: 'user',
            object: 'checkout',
            context_surface: 'web',
            properties: [
              {
                name: 'order_value',
                type: 'number',
                required: true,
                example: 99.99
              },
              {
                name: 'payment_method',
                type: 'string',
                required: true,
                example: 'credit_card'
              }
            ],
            lifecycle_status: 'proposed'
          }
        ]
      }

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify(events))

      expect(result.dataDictionary.events[0].datadog_sample_code).toBeDefined()
      expect(result.dataDictionary.events[0].datadog_sample_code).toContain('addAction')
      expect(result.dataDictionary.events[0].datadog_sample_code).toContain('user_checkout_completed')
      expect(result.dataDictionary.events[0].datadog_sample_code).toContain('order_value')
      expect(result.dataDictionary.events[0].datadog_sample_code).toContain('payment_method')
    })
  })
})