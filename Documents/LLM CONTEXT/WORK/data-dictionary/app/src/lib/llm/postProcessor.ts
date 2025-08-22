/**
 * Post-processing utilities for normalizing LLM output into valid DataDictionary format
 * Handles schema validation, data normalization, and error correction
 */

import { DataDictionary, DataDictionaryEvent, EventType, EventActionType, LifecycleStatus, DatadogApi, EventProperty } from '../schema/dataDictionary'
import { generateDatadogSample } from './datadogSamples'

export interface PostProcessingResult {
  dataDictionary: DataDictionary
  isValid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
  reasoning: string
  uncertainties?: string[]
}

export interface RawLLMResponse {
  version?: string
  generatedAtIso?: string
  events?: any[]
  [key: string]: any
}

/**
 * Main post-processor for LLM output
 */
export class DataDictionaryPostProcessor {
  
  /**
   * Process raw LLM response into normalized DataDictionary
   */
  static processLLMResponse(rawContent: string): PostProcessingResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Step 1: Parse JSON from various formats
      const parsedResponse = this.parseJsonContent(rawContent)
      
      // Step 2: Validate basic structure
      const structureValidation = this.validateBasicStructure(parsedResponse)
      if (!structureValidation.isValid) {
        errors.push(...structureValidation.errors)
      }
      
      // Step 3: Normalize and validate each event
      const normalizedEvents = this.normalizeEvents(parsedResponse.events || [], warnings)
      
      // Step 4: Create normalized DataDictionary
      const dataDictionary: DataDictionary = {
        version: parsedResponse.version || '1.0',
        generatedAtIso: parsedResponse.generatedAtIso || new Date().toISOString(),
        events: normalizedEvents
      }
      
      // Step 5: Validate final structure
      const finalValidation = this.validateDataDictionary(dataDictionary)
      if (!finalValidation.isValid) {
        errors.push(...finalValidation.errors)
      }
      
      // Step 6: Calculate confidence and extract insights
      const confidence = this.calculateConfidence(dataDictionary)
      const reasoning = this.generateReasoning(dataDictionary)
      const uncertainties = this.extractUncertainties(dataDictionary)
      
      return {
        dataDictionary,
        isValid: errors.length === 0,
        errors,
        warnings,
        confidence,
        reasoning,
        uncertainties
      }
      
    } catch (error) {
      return {
        dataDictionary: {
          version: '1.0',
          generatedAtIso: new Date().toISOString(),
          events: []
        },
        isValid: false,
        errors: [`Critical parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        confidence: 0,
        reasoning: 'Failed to process LLM response',
        uncertainties: []
      }
    }
  }
  
  /**
   * Parse JSON content from various formats (raw JSON, markdown code blocks, etc.)
   */
  private static parseJsonContent(content: string): RawLLMResponse {
    // Try parsing as direct JSON first
    try {
      return JSON.parse(content)
    } catch (error) {
      // Try extracting from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0])
        } catch (parseError) {
          throw new Error(`Failed to parse JSON from code block: ${parseError}`)
        }
      }
      
      throw new Error(`No valid JSON found in content. Original error: ${error}`)
    }
  }
  
  /**
   * Validate basic response structure
   */
  private static validateBasicStructure(response: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (typeof response !== 'object' || response === null) {
      errors.push('Response must be an object')
      return { isValid: false, errors }
    }
    
    if (!response.events) {
      errors.push('Response missing "events" property')
    } else if (!Array.isArray(response.events)) {
      errors.push('Events must be an array')
    } else if (response.events.length === 0) {
      errors.push('Events array cannot be empty')
    }
    
    return { isValid: errors.length === 0, errors }
  }
  
  /**
   * Normalize events array with validation and error correction
   */
  private static normalizeEvents(rawEvents: any[], warnings: string[]): DataDictionaryEvent[] {
    const normalizedEvents: DataDictionaryEvent[] = []
    const seenNames = new Set<string>()
    
    for (let i = 0; i < rawEvents.length; i++) {
      const rawEvent = rawEvents[i]
      
      try {
        const normalizedEvent = this.normalizeEvent(rawEvent, seenNames, warnings)
        if (normalizedEvent) {
          normalizedEvents.push(normalizedEvent)
        }
      } catch (error) {
        warnings.push(`Failed to normalize event ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return normalizedEvents
  }
  
  /**
   * Normalize a single event with validation and defaults
   */
  private static normalizeEvent(
    rawEvent: any,
    seenNames: Set<string>,
    warnings: string[]
  ): DataDictionaryEvent | null {
    if (typeof rawEvent !== 'object' || rawEvent === null) {
      warnings.push('Event must be an object')
      return null
    }
    
    // Normalize event name (required)
    let eventName = this.normalizeEventName(rawEvent.event_name || rawEvent.eventName || rawEvent.name)
    if (!eventName) {
      warnings.push('Event missing required field: event_name')
      return null
    }
    
    // Ensure uniqueness
    let uniqueName = eventName
    let counter = 1
    while (seenNames.has(uniqueName)) {
      uniqueName = `${eventName}_${counter}`
      counter++
    }
    if (uniqueName !== eventName) {
      warnings.push(`Duplicate event name "${eventName}" renamed to "${uniqueName}"`)
    }
    seenNames.add(uniqueName)
    
    // Normalize other required fields
    const eventType = this.normalizeEventType(rawEvent.event_type || rawEvent.eventType)
    if (!eventType) {
      warnings.push(`Event "${uniqueName}" has invalid event_type, defaulting to 'intent'`)
    }
    
    const eventActionType = this.normalizeEventActionType(rawEvent.event_action_type || rawEvent.eventActionType)
    if (!eventActionType) {
      warnings.push(`Event "${uniqueName}" has invalid event_action_type, defaulting to 'action'`)
    }
    
    const lifecycleStatus = this.normalizeLifecycleStatus(rawEvent.lifecycle_status || rawEvent.lifecycleStatus)
    const datadogApi = this.normalizeDatadogApi(rawEvent.datadog_api || rawEvent.datadogApi, eventType, eventActionType)
    
    // Normalize properties
    const properties = this.normalizeProperties(rawEvent.properties || [])
    
    // Build normalized event
    const normalizedEvent: DataDictionaryEvent = {
      event_name: uniqueName,
      event_type: eventType || 'intent',
      event_action_type: eventActionType || 'action',
      event_purpose: String(rawEvent.event_purpose || rawEvent.eventPurpose || rawEvent.purpose || ''),
      user_story: rawEvent.user_story || rawEvent.userStory,
      when_to_fire: String(rawEvent.when_to_fire || rawEvent.whenToFire || rawEvent.trigger || ''),
      actor: String(rawEvent.actor || rawEvent.user || 'user'),
      object: String(rawEvent.object || rawEvent.target || rawEvent.entity || ''),
      context_surface: String(rawEvent.context_surface || rawEvent.contextSurface || rawEvent.surface || ''),
      properties,
      context_keys: Array.isArray(rawEvent.context_keys) ? rawEvent.context_keys : 
                   Array.isArray(rawEvent.contextKeys) ? rawEvent.contextKeys : undefined,
      ownership_team: rawEvent.ownership_team || rawEvent.ownershipTeam || rawEvent.team,
      priority: rawEvent.priority,
      lifecycle_status: lifecycleStatus,
      notes: rawEvent.notes,
      datadog_api: datadogApi,
      datadog_sample_code: rawEvent.datadog_sample_code || rawEvent.datadogSampleCode
    }
    
    // Generate sample code if not provided
    if (!normalizedEvent.datadog_sample_code) {
      const sample = generateDatadogSample(normalizedEvent)
      normalizedEvent.datadog_sample_code = sample.code
    }
    
    // Add failure-specific fields
    if (eventType === 'failure') {
      normalizedEvent.error_code = rawEvent.error_code || rawEvent.errorCode
      normalizedEvent.error_message = rawEvent.error_message || rawEvent.errorMessage
      
      if (!normalizedEvent.error_code && !normalizedEvent.error_message) {
        warnings.push(`Failure event "${uniqueName}" should include error_code and/or error_message`)
      }
    }
    
    return normalizedEvent
  }
  
  /**
   * Normalize event name to snake_case and validate
   */
  private static normalizeEventName(name: any): string | null {
    if (!name || typeof name !== 'string') return null
    
    // Convert to snake_case
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_') || null
  }
  
  /**
   * Normalize event type with validation
   */
  private static normalizeEventType(type: any): EventType | null {
    if (typeof type !== 'string') return null
    
    const normalized = type.toLowerCase()
    const validTypes: EventType[] = ['intent', 'success', 'failure']
    
    return validTypes.find(t => t === normalized) || null
  }
  
  /**
   * Normalize event action type with validation
   */
  private static normalizeEventActionType(type: any): EventActionType | null {
    if (typeof type !== 'string') return null
    
    const normalized = type.toLowerCase()
    const validTypes: EventActionType[] = ['action', 'error', 'feature_flag']
    
    return validTypes.find(t => t === normalized) || null
  }
  
  /**
   * Normalize lifecycle status with validation
   */
  private static normalizeLifecycleStatus(status: any): LifecycleStatus {
    if (typeof status !== 'string') return 'proposed'
    
    const normalized = status.toLowerCase()
    const validStatuses: LifecycleStatus[] = ['proposed', 'approved', 'implemented', 'deprecated']
    
    return validStatuses.find(s => s === normalized) || 'proposed'
  }
  
  /**
   * Normalize Datadog API with validation and intelligent auto-mapping
   * Maps based on both event_type and event_action_type combinations
   */
  private static normalizeDatadogApi(
    api: any, 
    eventType?: EventType | null, 
    eventActionType?: EventActionType | null
  ): DatadogApi {
    // If explicitly provided and valid, use it
    if (typeof api === 'string') {
      const normalized = api.toLowerCase()
      const validApis: DatadogApi[] = ['addAction', 'addError', 'addFeatureFlagEvaluation']
      const found = validApis.find(a => a.toLowerCase() === normalized)
      if (found) return found
    }
    
    // Auto-map based on event_action_type first (most specific)
    if (eventActionType === 'feature_flag') {
      return 'addFeatureFlagEvaluation'
    }
    
    if (eventActionType === 'error') {
      return 'addError'
    }
    
    // For 'action' event_action_type, map based on event_type
    if (eventActionType === 'action') {
      // Failure actions are still errors from Datadog perspective
      if (eventType === 'failure') {
        return 'addError'
      }
      // Intent and success actions are regular actions
      return 'addAction'
    }
    
    // Fallback mapping based on event_type only (for backward compatibility)
    if (eventType === 'failure') {
      return 'addError'
    }
    
    // Default to addAction for intent/success events
    return 'addAction'
  }
  
  /**
   * Normalize properties array
   */
  private static normalizeProperties(rawProperties: any[]): EventProperty[] {
    if (!Array.isArray(rawProperties)) return []
    
    return rawProperties
      .map(prop => this.normalizeProperty(prop))
      .filter((prop): prop is EventProperty => prop !== null)
  }
  
  /**
   * Normalize a single property
   */
  private static normalizeProperty(rawProp: any): EventProperty | null {
    if (typeof rawProp !== 'object' || rawProp === null) return null
    
    const name = this.normalizeEventName(rawProp.name)
    if (!name) return null
    
    const validTypes = ['string', 'number', 'boolean', 'enum', 'object', 'array', 'datetime']
    const type = validTypes.includes(rawProp.type) ? rawProp.type : 'string'
    
    return {
      name,
      type: type as EventProperty['type'],
      required: Boolean(rawProp.required),
      example: rawProp.example,
      description: rawProp.description ? String(rawProp.description) : undefined
    }
  }
  
  /**
   * Validate final DataDictionary structure
   */
  private static validateDataDictionary(dataDictionary: DataDictionary): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!dataDictionary.version) {
      errors.push('Missing version')
    }
    
    if (!dataDictionary.generatedAtIso) {
      errors.push('Missing generatedAtIso')
    }
    
    if (!dataDictionary.events || dataDictionary.events.length === 0) {
      errors.push('No valid events found')
    }
    
    // Validate event completeness
    for (const event of dataDictionary.events) {
      if (!event.event_name) {
        errors.push(`Event missing event_name`)
      }
      if (!event.event_purpose) {
        errors.push(`Event "${event.event_name}" missing event_purpose`)
      }
      if (!event.when_to_fire) {
        errors.push(`Event "${event.event_name}" missing when_to_fire`)
      }
      if (event.event_type === 'failure' && !event.error_code && !event.error_message) {
        errors.push(`Failure event "${event.event_name}" should include error details`)
      }
    }
    
    return { isValid: errors.length === 0, errors }
  }
  
  /**
   * Calculate confidence score based on data quality
   */
  private static calculateConfidence(dataDictionary: DataDictionary): number {
    if (!dataDictionary.events || dataDictionary.events.length === 0) {
      return 0
    }

    let totalScore = 0
    let eventCount = dataDictionary.events.length

    for (const event of dataDictionary.events) {
      let eventScore = 0
      
      // Required fields present and meaningful
      if (event.event_name && event.event_type && event.when_to_fire) eventScore += 25
      if (event.event_purpose && event.event_purpose.length > 20) eventScore += 20
      if (event.properties && event.properties.length > 0) eventScore += 20
      if (event.actor && event.object && event.context_surface) eventScore += 15
      if (event.datadog_api) eventScore += 10
      if (event.context_keys && event.context_keys.length > 0) eventScore += 5
      if (event.user_story) eventScore += 5
      
      totalScore += Math.min(eventScore, 100)
    }

    return Math.round(totalScore / eventCount)
  }
  
  /**
   * Generate reasoning text about the extraction
   */
  private static generateReasoning(dataDictionary: DataDictionary): string {
    const eventCount = dataDictionary.events?.length || 0
    const intentCount = dataDictionary.events?.filter(e => e.event_type === 'intent').length || 0
    const successCount = dataDictionary.events?.filter(e => e.event_type === 'success').length || 0
    const failureCount = dataDictionary.events?.filter(e => e.event_type === 'failure').length || 0
    
    const hasProperties = dataDictionary.events?.filter(e => e.properties.length > 0).length || 0
    const propPercentage = eventCount > 0 ? Math.round((hasProperties / eventCount) * 100) : 0
    
    return `Extracted ${eventCount} events following Intent-Success-Failure analytics pattern: ${intentCount} intent, ${successCount} success, and ${failureCount} failure events. ${propPercentage}% of events include context properties for segmentation analysis.`
  }
  
  /**
   * Extract uncertainties and potential issues
   */
  private static extractUncertainties(dataDictionary: DataDictionary): string[] {
    const uncertainties: string[] = []
    
    if (!dataDictionary.events) return uncertainties
    
    for (const event of dataDictionary.events) {
      // Check for explicit uncertainty notes
      if (event.notes && event.notes.toLowerCase().includes('uncertain')) {
        uncertainties.push(`${event.event_name}: ${event.notes}`)
      }
      
      // Check for missing context properties
      if (!event.properties || event.properties.length === 0) {
        uncertainties.push(`${event.event_name}: No context properties defined - may limit segmentation capabilities`)
      }
      
      // Check for vague descriptions
      if (event.event_purpose.length < 20) {
        uncertainties.push(`${event.event_name}: Brief event purpose may need clarification`)
      }
      
      // Check for failure events without error details
      if (event.event_type === 'failure' && !event.error_code && !event.error_message) {
        uncertainties.push(`${event.event_name}: Failure event lacks error context for debugging`)
      }
      
      // Apply pressure testing validation
      const pressureTestIssues = this.validatePressureTest(event)
      uncertainties.push(...pressureTestIssues)
    }
    
    return uncertainties
  }
  
  /**
   * Validate if an event passes basic pressure testing criteria
   */
  private static validatePressureTest(event: DataDictionaryEvent): string[] {
    const issues: string[] = []
    
    // Check for overly generic events that might not pass pressure testing
    const genericTerms = [
      'click', 'view', 'load', 'render', 'display', 'show', 'hide',
      'open', 'close', 'visit', 'see', 'appear', 'disappear'
    ]
    
    const eventNameWords = event.event_name.toLowerCase().split('_')
    const hasGenericTerm = genericTerms.some(term => 
      eventNameWords.some(word => word.includes(term))
    )
    
    if (hasGenericTerm && !event.notes) {
      issues.push(
        `${event.event_name}: Generic tracking event may not pass pressure test - consider what specific action this would drive`
      )
    }
    
    // Check for events with weak purpose statements
    const weakPurposeIndicators = [
      'track when', 'monitor', 'capture', 'record', 'log', 'measure'
    ]
    
    const purposeLower = event.event_purpose.toLowerCase()
    const hasWeakPurpose = weakPurposeIndicators.some(indicator => 
      purposeLower.startsWith(indicator)
    )
    
    if (hasWeakPurpose && !event.notes && !purposeLower.includes('because') && !purposeLower.includes('enable')) {
      issues.push(
        `${event.event_name}: Purpose focuses on data collection rather than business value - clarify actionable insights`
      )
    }
    
    // Check for missing context that would limit actionability
    if (event.event_type === 'intent' && (!event.properties || event.properties.length < 2)) {
      issues.push(
        `${event.event_name}: Intent event with minimal context may not enable meaningful segmentation or "why" analysis`
      )
    }
    
    // Check for events that track outcomes without context about what led to them
    if (event.event_type === 'success' && (!event.properties || event.properties.length === 0)) {
      issues.push(
        `${event.event_name}: Success event without context properties limits ability to understand what drives success`
      )
    }
    
    // Check for failure events that don't provide debugging context
    if (event.event_type === 'failure' && (!event.error_code && !event.error_message) && 
        (!event.properties || !event.properties.some(p => p.name.includes('error') || p.name.includes('reason')))) {
      issues.push(
        `${event.event_name}: Failure event lacks error context needed for actionable debugging`
      )
    }
    
    // Flag events with vague actor/object definitions
    if ((event.actor === 'user' || event.actor === 'customer') && 
        (event.object === 'system' || event.object === 'app' || event.object === 'page') && 
        !event.notes) {
      issues.push(
        `${event.event_name}: Generic actor/object definitions may limit segmentation potential`
      )
    }
    
    return issues
  }
}