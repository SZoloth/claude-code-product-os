/**
 * Unit tests for UsageTracker
 */

import { UsageTracker } from './usageTracker'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

// Mock window and performance objects
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true
})

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true
})

Object.defineProperty(global, 'performance', {
  value: { now: () => 1000 }
})

Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124',
  writable: true
})

describe('UsageTracker', () => {
  let tracker: UsageTracker

  beforeEach(() => {
    // Clear localStorage
    mockLocalStorage.clear()
    
    // Reset singleton and get fresh instance
    UsageTracker.resetInstance()
    tracker = UsageTracker.getInstance()
    tracker.enable()
  })

  afterEach(() => {
    tracker.clearData()
    UsageTracker.resetInstance()
  })

  describe('Basic tracking', () => {
    it('should track events with properties', () => {
      tracker.track('test_event', { test_prop: 'test_value' })
      
      const summary = tracker.getSessionSummary()
      expect(summary.events).toHaveLength(2) // session_start + test_event
      
      const testEvent = summary.events.find(e => e.event_name === 'test_event')
      expect(testEvent).toBeDefined()
      expect(testEvent?.properties).toBeDefined()
    })

    it('should sanitize properties to avoid PII', () => {
      tracker.track('test_event', {
        email: 'user@example.com',
        name: 'John Doe',
        safe_prop: 'safe_value',
        count: 42
      })
      
      const summary = tracker.getSessionSummary()
      const testEvent = summary.events.find(e => e.event_name === 'test_event')
      
      // PII fields should be filtered out
      expect(testEvent?.properties.email).toBeUndefined()
      expect(testEvent?.properties.name).toBeUndefined()
      
      // Safe properties should be included
      expect(testEvent?.properties.count).toBe(42)
    })

    it('should generate unique session IDs', () => {
      const summary1 = tracker.getSessionSummary()
      
      // Reset and create new instance
      UsageTracker.resetInstance()
      const tracker2 = UsageTracker.getInstance()
      const summary2 = tracker2.getSessionSummary()
      
      expect(summary1.session.session_id).not.toBe(summary2.session.session_id)
    })
  })

  describe('Wizard tracking', () => {
    it('should track wizard step navigation', () => {
      tracker.trackWizardStep('describe', 'forward')
      tracker.trackWizardStep('preview', 'forward')
      
      const summary = tracker.getSessionSummary()
      const wizardEvents = summary.events.filter(e => e.event_name === 'wizard_step_navigation')
      
      expect(wizardEvents).toHaveLength(2)
      expect(wizardEvents[0].properties.step).toBe('describe')
      expect(wizardEvents[1].properties.step).toBe('preview')
    })
  })

  describe('File upload tracking', () => {
    it('should track file upload attempts', () => {
      tracker.trackFileUpload('pdf', 1024000, true)
      tracker.trackFileUpload('docx', 512000, false)
      
      const summary = tracker.getSessionSummary()
      const uploadEvents = summary.events.filter(e => e.event_name === 'file_upload')
      
      expect(uploadEvents).toHaveLength(2)
      expect(uploadEvents[0].properties.file_type).toBe('pdf')
      expect(uploadEvents[0].properties.success).toBe(true)
      expect(uploadEvents[1].properties.success).toBe(false)
    })

    it('should categorize file sizes correctly', () => {
      tracker.trackFileUpload('pdf', 500, true) // tiny
      tracker.trackFileUpload('pdf', 5000, true) // small
      tracker.trackFileUpload('pdf', 50000, true) // medium
      tracker.trackFileUpload('pdf', 500000, true) // large
      tracker.trackFileUpload('pdf', 2000000, true) // very_large
      
      const summary = tracker.getSessionSummary()
      const uploadEvents = summary.events.filter(e => e.event_name === 'file_upload')
      
      expect(uploadEvents[0].properties.file_size_category).toBe('tiny')
      expect(uploadEvents[1].properties.file_size_category).toBe('small')
      expect(uploadEvents[2].properties.file_size_category).toBe('medium')
      expect(uploadEvents[3].properties.file_size_category).toBe('large')
      expect(uploadEvents[4].properties.file_size_category).toBe('very_large')
    })
  })

  describe('LLM processing tracking', () => {
    it('should track LLM processing metrics', () => {
      tracker.trackLLMProcessing(5000, 10, 3000)
      
      const summary = tracker.getSessionSummary()
      const llmEvent = summary.events.find(e => e.event_name === 'llm_processing')
      
      expect(llmEvent).toBeDefined()
      expect(llmEvent?.properties.input_length_category).toBe('medium')
      expect(llmEvent?.properties.output_event_count).toBe(10)
      expect(llmEvent?.properties.processing_time_category).toBe('moderate')
      expect(llmEvent?.properties.success).toBe(true)
    })
  })

  describe('Export tracking', () => {
    it('should track export attempts', () => {
      tracker.trackExport('csv', 5, true)
      tracker.trackExport('markdown', 0, false)
      
      const summary = tracker.getSessionSummary()
      const exportEvents = summary.events.filter(e => e.event_name === 'export_action')
      
      expect(exportEvents).toHaveLength(2)
      expect(exportEvents[0].properties.format).toBe('csv')
      expect(exportEvents[0].properties.success).toBe(true)
      expect(exportEvents[1].properties.success).toBe(false)
    })
  })

  describe('Privacy controls', () => {
    it('should respect tracking disable', () => {
      tracker.disable()
      tracker.track('test_event')
      
      const summary = tracker.getSessionSummary()
      // Should only have session_start event from before disable
      expect(summary.events.filter(e => e.event_name === 'test_event')).toHaveLength(0)
    })

    it('should clear data when requested', () => {
      tracker.track('test_event')
      tracker.track('another_event')
      expect(tracker.getSessionSummary().events.length).toBeGreaterThan(2) // session_start + 2 events
      
      tracker.clearData()
      expect(tracker.getSessionSummary().events.length).toBe(0)
    })

    it('should export usage data as JSON', () => {
      tracker.track('test_event', { prop: 'value' })
      
      const exportData = tracker.exportUsageData()
      const parsed = JSON.parse(exportData)
      
      expect(parsed.session).toBeDefined()
      expect(parsed.events).toBeDefined()
      expect(parsed.app_version).toBeDefined()
    })
  })

  describe('Session information', () => {
    it('should capture browser and viewport information', () => {
      const summary = tracker.getSessionSummary()
      
      expect(summary.session.user_agent).toBe('chrome')
      expect(summary.session.viewport_width).toBe(1024)
      expect(summary.session.viewport_height).toBe(768)
      expect(summary.session.timezone).toBeDefined()
    })
  })

  describe('String sanitization', () => {
    it('should categorize string content', () => {
      tracker.track('test_event', {
        numeric_string: '12345',
        identifier_string: 'event_name',
        email_like: 'user@domain.com',
        url_like: 'https://example.com',
        text_string: 'Some random text content'
      })
      
      const summary = tracker.getSessionSummary()
      const testEvent = summary.events.find(e => e.event_name === 'test_event')
      
      // All should be sanitized to length_X_chars_Y format since none are safe keys
      expect(testEvent?.properties.numeric_string).toBe('length_5_chars_numeric')
      expect(testEvent?.properties.identifier_string).toBe('length_10_chars_identifier') 
      expect(testEvent?.properties.email_like).toBe('length_15_chars_email_like')
      expect(testEvent?.properties.url_like).toBe('length_19_chars_url_like')
      expect(testEvent?.properties.text_string).toBe('length_24_chars_text')
    })
    
    it('should preserve safe enum values', () => {
      tracker.track('test_event', {
        step: 'describe',
        format: 'csv',
        direction: 'forward',
        file_type: 'pdf',
        random_key: 'should_be_sanitized'
      })
      
      const summary = tracker.getSessionSummary()
      const testEvent = summary.events.find(e => e.event_name === 'test_event')
      
      // Safe keys should preserve their values
      expect(testEvent?.properties.step).toBe('describe')
      expect(testEvent?.properties.format).toBe('csv')
      expect(testEvent?.properties.direction).toBe('forward')
      expect(testEvent?.properties.file_type).toBe('pdf')
      
      // Non-safe keys should be sanitized (should_be_sanitized = 19 chars)
      expect(testEvent?.properties.random_key).toBe('length_19_chars_identifier')
    })
  })
})