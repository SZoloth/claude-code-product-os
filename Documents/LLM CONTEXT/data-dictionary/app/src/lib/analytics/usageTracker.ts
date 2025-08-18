/**
 * Privacy-conscious usage tracking for the Data Dictionary Generator
 * Tracks anonymous usage patterns to improve the application
 */

export interface UsageEvent {
  event_name: string
  timestamp: string
  session_id: string
  properties: Record<string, any>
}

export interface SessionInfo {
  session_id: string
  started_at: string
  user_agent: string
  viewport_width: number
  viewport_height: number
  timezone: string
}

export interface UsageAnalytics {
  session: SessionInfo
  events: UsageEvent[]
  app_version: string
}

export class UsageTracker {
  private static instance: UsageTracker
  private sessionId: string
  private events: UsageEvent[] = []
  private sessionStarted: string
  private isEnabled: boolean = true

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.sessionStarted = new Date().toISOString()
    this.initializeSession()
  }

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker()
    }
    return UsageTracker.instance
  }
  
  // Test helper method to reset singleton
  static resetInstance() {
    if (UsageTracker.instance) {
      UsageTracker.instance.clearData()
      UsageTracker.instance = undefined as any
    }
  }

  /**
   * Track a user action with optional properties
   */
  track(eventName: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return

    // Sanitize properties to avoid PII
    const sanitizedProperties = this.sanitizeProperties(properties)

    const event: UsageEvent = {
      event_name: eventName,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      properties: sanitizedProperties
    }

    this.events.push(event)
    this.persistToStorage()

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Usage tracked:', event)
    }
  }

  /**
   * Track wizard step progression
   */
  trackWizardStep(step: string, direction: 'forward' | 'backward' = 'forward') {
    this.track('wizard_step_navigation', {
      step,
      direction,
      total_events: this.getEventCount('wizard_step_navigation')
    })
  }

  /**
   * Track file upload attempts
   */
  trackFileUpload(fileType: string, fileSize: number, success: boolean) {
    this.track('file_upload', {
      file_type: fileType,
      file_size_category: this.categorizeFileSize(fileSize),
      success,
      error_type: success ? null : 'parse_error'
    })
  }

  /**
   * Track LLM processing
   */
  trackLLMProcessing(inputLength: number, outputEventCount: number, processingTime: number) {
    this.track('llm_processing', {
      input_length_category: this.categorizeTextLength(inputLength),
      output_event_count: outputEventCount,
      processing_time_category: this.categorizeProcessingTime(processingTime),
      success: outputEventCount > 0
    })
  }

  /**
   * Track export actions
   */
  trackExport(format: string, eventCount: number, success: boolean) {
    this.track('export_action', {
      format,
      event_count: eventCount,
      success,
      validation_passed: success
    })
  }

  /**
   * Track validation errors
   */
  trackValidationError(errorType: string, fieldName?: string) {
    this.track('validation_error', {
      error_type: errorType,
      field_name: fieldName || 'unknown',
      session_error_count: this.getEventCount('validation_error')
    })
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number) {
    this.track('performance_metric', {
      metric_name: metric,
      value_category: this.categorizePerformanceValue(metric, value),
      raw_value: value
    })
  }

  /**
   * Get session summary for analytics
   */
  getSessionSummary(): UsageAnalytics {
    return {
      session: this.getSessionInfo(),
      events: [...this.events],
      app_version: this.getAppVersion()
    }
  }

  /**
   * Export usage data for analysis (privacy-safe)
   */
  exportUsageData(): string {
    const summary = this.getSessionSummary()
    return JSON.stringify(summary, null, 2)
  }

  /**
   * Clear all tracking data
   */
  clearData() {
    this.events = []
    localStorage.removeItem('usage_analytics')
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Usage data cleared')
    }
  }

  /**
   * Disable tracking (respects user privacy)
   */
  disable() {
    this.isEnabled = false
    this.clearData()
  }

  /**
   * Enable tracking
   */
  enable() {
    this.isEnabled = true
  }

  /**
   * Check if tracking is enabled
   */
  isTrackingEnabled(): boolean {
    return this.isEnabled
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private initializeSession() {
    this.track('session_start', {
      user_agent_category: this.categorizeUserAgent(),
      viewport_size: this.getViewportCategory(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }

  private getSessionInfo(): SessionInfo {
    return {
      session_id: this.sessionId,
      started_at: this.sessionStarted,
      user_agent: this.categorizeUserAgent(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(properties)) {
      // Skip potential PII fields
      if (this.isPotentialPII(key)) continue
      
      // Allow certain safe string values to pass through
      if (typeof value === 'string') {
        if (this.isSafeStringValue(key, value)) {
          sanitized[key] = value
        } else {
          sanitized[key] = this.sanitizeString(value)
        }
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value
      } else if (Array.isArray(value)) {
        sanitized[key] = value.length // Just track array length
      } else if (value && typeof value === 'object') {
        sanitized[key] = Object.keys(value).length // Just track object size
      }
    }
    
    return sanitized
  }

  private isPotentialPII(key: string): boolean {
    const piiPatterns = [
      /^email$/, /^name$/, /^phone$/, /^address$/, /^ip$/, /^user_id$/,
      /^api_key$/, /^token$/, /^password$/, /^secret$/,
      /email_address/, /user_name/, /phone_number/, /ip_address/
    ]
    const lowerKey = key.toLowerCase()
    return piiPatterns.some(pattern => 
      pattern instanceof RegExp ? pattern.test(lowerKey) : lowerKey.includes(pattern)
    )
  }

  private isSafeStringValue(key: string, value: string): boolean {
    // Allow specific enum-like values that are safe for analytics
    const safeKeys = [
      'step', 'direction', 'file_type', 'format', 'error_type', 
      'field_name', 'metric_name', 'input_length_category', 
      'processing_time_category', 'file_size_category'
    ]
    
    if (safeKeys.includes(key)) {
      // Only allow reasonable length values that look like categories/enums
      return value.length < 50 && /^[a-zA-Z0-9_-]+$/.test(value)
    }
    
    return false
  }

  private sanitizeString(value: string): string {
    // Only track string length and basic characteristics
    return `length_${value.length}_chars_${this.categorizeStringContent(value)}`
  }

  private categorizeStringContent(value: string): string {
    if (/^\d+$/.test(value)) return 'numeric'
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) return 'identifier'
    if (value.includes('@')) return 'email_like'
    if (value.includes('http')) return 'url_like'
    return 'text'
  }

  private categorizeFileSize(size: number): string {
    if (size < 1024) return 'tiny' // < 1KB
    if (size < 10240) return 'small' // < 10KB
    if (size < 102400) return 'medium' // < 100KB
    if (size < 1048576) return 'large' // < 1MB
    return 'very_large' // >= 1MB
  }

  private categorizeTextLength(length: number): string {
    if (length < 1000) return 'short'
    if (length < 10000) return 'medium'
    if (length < 50000) return 'long'
    return 'very_long'
  }

  private categorizeProcessingTime(time: number): string {
    if (time < 1000) return 'fast' // < 1s
    if (time < 5000) return 'moderate' // < 5s
    if (time < 15000) return 'slow' // < 15s
    return 'very_slow' // >= 15s
  }

  private categorizeUserAgent(): string {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'chrome'
    if (ua.includes('firefox')) return 'firefox'
    if (ua.includes('safari')) return 'safari'
    if (ua.includes('edge')) return 'edge'
    return 'other'
  }

  private getViewportCategory(): string {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    if (width < 1440) return 'desktop'
    return 'large_desktop'
  }

  private categorizePerformanceValue(metric: string, value: number): string {
    switch (metric) {
      case 'page_load_time':
        if (value < 1000) return 'fast'
        if (value < 3000) return 'moderate'
        return 'slow'
      case 'bundle_size':
        if (value < 100000) return 'small'
        if (value < 500000) return 'medium'
        return 'large'
      default:
        return 'unknown'
    }
  }

  private getEventCount(eventName: string): number {
    return this.events.filter(e => e.event_name === eventName).length
  }

  private getAppVersion(): string {
    return '1.0.0' // Could be loaded from package.json
  }

  private persistToStorage() {
    try {
      const data = {
        session_id: this.sessionId,
        events: this.events.slice(-100), // Keep only last 100 events
        last_updated: new Date().toISOString()
      }
      localStorage.setItem('usage_analytics', JSON.stringify(data))
    } catch (error) {
      // Ignore storage errors
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to persist usage analytics:', error)
      }
    }
  }
}

// Export convenience functions
export const analytics = UsageTracker.getInstance()

export function trackWizardStep(step: string, direction: 'forward' | 'backward' = 'forward') {
  analytics.trackWizardStep(step, direction)
}

export function trackFileUpload(fileType: string, fileSize: number, success: boolean) {
  analytics.trackFileUpload(fileType, fileSize, success)
}

export function trackLLMProcessing(inputLength: number, outputEventCount: number, processingTime: number) {
  analytics.trackLLMProcessing(inputLength, outputEventCount, processingTime)
}

export function trackExport(format: string, eventCount: number, success: boolean) {
  analytics.trackExport(format, eventCount, success)
}

export function trackValidationError(errorType: string, fieldName?: string) {
  analytics.trackValidationError(errorType, fieldName)
}

export function trackPerformance(metric: string, value: number) {
  analytics.trackPerformance(metric, value)
}