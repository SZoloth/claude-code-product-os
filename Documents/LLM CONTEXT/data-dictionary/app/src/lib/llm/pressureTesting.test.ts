/**
 * Unit tests for pressure testing functionality
 */

import { DataDictionaryPostProcessor } from './postProcessor'

describe('Pressure Testing Validation', () => {
  describe('validatePressureTest', () => {
    const createTestEvent = (overrides: any = {}) => ({
      event_name: 'test_event',
      event_type: 'intent' as const,
      event_action_type: 'action' as const,
      event_purpose: 'Meaningful business purpose for user segmentation',
      when_to_fire: 'When user performs action',
      actor: 'authenticated_user',
      object: 'product_page',
      context_surface: 'web_app',
      properties: [
        {
          name: 'user_segment',
          type: 'string' as const,
          required: true,
          example: 'premium'
        },
        {
          name: 'feature_flag',
          type: 'boolean' as const,
          required: false,
          example: true
        }
      ],
      lifecycle_status: 'proposed' as const,
      datadog_api: 'addAction' as const,
      ...overrides
    })

    it('should pass well-designed events without issues', () => {
      const wellDesignedEvent = createTestEvent()
      
      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [wellDesignedEvent]
      }))

      expect(result.isValid).toBe(true)
      // Should have minimal pressure test issues for well-designed event
      const pressureTestIssues = result.uncertainties.filter(u => 
        u.includes('pressure test') || u.includes('generic tracking')
      )
      expect(pressureTestIssues).toHaveLength(0)
    })

    it('should flag generic click events', () => {
      const genericClickEvent = createTestEvent({
        event_name: 'button_clicked',
        event_purpose: 'Track when users click buttons',
        properties: []
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [genericClickEvent]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Generic tracking event may not pass pressure test')
      )).toBe(true)
    })

    it('should flag events with weak purpose statements', () => {
      const weakPurposeEvent = createTestEvent({
        event_name: 'user_registration',
        event_purpose: 'Track when users register',
        properties: []
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [weakPurposeEvent]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Purpose focuses on data collection rather than business value')
      )).toBe(true)
    })

    it('should not flag weak purpose statements that include business value', () => {
      const goodPurposeEvent = createTestEvent({
        event_name: 'user_registration',
        event_purpose: 'Track when users register because it enables us to measure conversion funnel efficiency',
        properties: []
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [goodPurposeEvent]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Purpose focuses on data collection rather than business value')
      )).toBe(false)
    })

    it('should flag intent events with insufficient context', () => {
      const lowContextIntent = createTestEvent({
        event_name: 'purchase_attempted',
        event_type: 'intent',
        properties: [{
          name: 'item_id',
          type: 'string',
          required: true,
          example: '123'
        }] // Only one property
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [lowContextIntent]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Intent event with minimal context may not enable meaningful segmentation')
      )).toBe(true)
    })

    it('should flag success events without context', () => {
      const successWithoutContext = createTestEvent({
        event_name: 'checkout_completed',
        event_type: 'success',
        properties: []
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [successWithoutContext]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Success event without context properties limits ability to understand what drives success')
      )).toBe(true)
    })

    it('should flag failure events without debugging context', () => {
      const failureWithoutContext = createTestEvent({
        event_name: 'payment_failed',
        event_type: 'failure',
        properties: [{
          name: 'amount',
          type: 'number',
          required: true,
          example: 99.99
        }]
        // No error_code, error_message, or error-related properties
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [failureWithoutContext]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Failure event lacks error context needed for actionable debugging')
      )).toBe(true)
    })

    it('should not flag failure events with error properties', () => {
      const failureWithErrorProperty = createTestEvent({
        event_name: 'payment_failed',
        event_type: 'failure',
        properties: [{
          name: 'error_reason',
          type: 'string',
          required: true,
          example: 'insufficient_funds'
        }]
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [failureWithErrorProperty]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Failure event lacks error context needed for actionable debugging')
      )).toBe(false)
    })

    it('should flag generic actor/object combinations', () => {
      const genericEvent = createTestEvent({
        event_name: 'action_performed',
        actor: 'user',
        object: 'system',
        properties: []
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [genericEvent]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Generic actor/object definitions may limit segmentation potential')
      )).toBe(true)
    })

    it('should not flag generic actor/object when notes are present', () => {
      const genericEventWithNotes = createTestEvent({
        event_name: 'action_performed',
        actor: 'user',
        object: 'system',
        properties: [],
        notes: 'Generic terms used intentionally for this high-level tracking event'
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [genericEventWithNotes]
      }))

      expect(result.uncertainties.some(u => 
        u.includes('Generic actor/object definitions may limit segmentation potential')
      )).toBe(false)
    })

    it('should handle multiple pressure test issues for one event', () => {
      const problematicEvent = createTestEvent({
        event_name: 'page_viewed',
        event_type: 'intent',
        event_purpose: 'Track when users view pages',
        actor: 'user',
        object: 'page',
        properties: []
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [problematicEvent]
      }))

      const eventIssues = result.uncertainties.filter(u => u.startsWith('page_viewed:'))
      expect(eventIssues.length).toBeGreaterThan(2) // Should flag multiple issues
      
      expect(result.uncertainties.some(u => 
        u.includes('Generic tracking event may not pass pressure test')
      )).toBe(true)
      
      expect(result.uncertainties.some(u => 
        u.includes('Purpose focuses on data collection rather than business value')
      )).toBe(true)
      
      expect(result.uncertainties.some(u => 
        u.includes('Intent event with minimal context')
      )).toBe(true)
    })

    it('should calculate lower confidence for events with pressure test issues', () => {
      const problematicEvent = createTestEvent({
        event_name: 'page_clicked',
        event_purpose: 'Track clicks',
        properties: []
      })

      const wellDesignedEvent = createTestEvent({
        event_name: 'purchase_intent_captured',
        event_purpose: 'Capture user intent to purchase to enable personalized recommendations and conversion optimization',
        properties: [
          {
            name: 'product_category',
            type: 'string',
            required: true,
            example: 'electronics'
          },
          {
            name: 'user_segment',
            type: 'string',
            required: true,
            example: 'premium_customer'
          },
          {
            name: 'referral_source',
            type: 'string',
            required: false,
            example: 'email_campaign'
          }
        ]
      })

      const problematicResult = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [problematicEvent]
      }))

      const wellDesignedResult = DataDictionaryPostProcessor.processLLMResponse(JSON.stringify({
        version: '1.0',
        events: [wellDesignedEvent]
      }))

      expect(problematicResult.confidence).toBeLessThan(wellDesignedResult.confidence)
    })
  })

  describe('shouldUseUncertaintyPrompt', () => {
    // These would test the private method, but since it's private we test the integration
    // through the main API. The tests would check document complexity, uncertainty indicators, etc.
    
    it('should be tested through integration tests', () => {
      // The shouldUseUncertaintyPrompt logic is tested indirectly through the
      // extractDataDictionary method and by verifying that uncertainty prompts
      // are used appropriately based on document characteristics
      expect(true).toBe(true) // Placeholder for integration tests
    })
  })
})