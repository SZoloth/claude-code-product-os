export type EventType = 'intent' | 'success' | 'failure'
export type EventActionType = 'action' | 'error' | 'feature_flag'
export type LifecycleStatus = 'proposed' | 'approved' | 'implemented' | 'deprecated'
export type DatadogApi = 'addAction' | 'addError' | 'addFeatureFlagEvaluation'

export interface EventProperty {
  name: string
  type: 'string' | 'number' | 'boolean' | 'enum' | 'object' | 'array' | 'datetime'
  required: boolean
  example?: string | number | boolean | null
  description?: string
}

export interface DataDictionaryEvent {
  event_name: string
  event_type: EventType
  event_action_type: EventActionType
  event_purpose: string
  user_story?: string
  when_to_fire: string
  actor: string
  object: string
  context_surface: string
  properties: EventProperty[]
  context_keys?: string[]
  ownership_team?: string
  priority?: string
  lifecycle_status: LifecycleStatus
  notes?: string
  datadog_api: DatadogApi
  datadog_sample_code?: string
  // Failure specifics when available
  error_code?: string
  error_message?: string
}

export interface DataDictionary {
  version: string
  generatedAtIso: string
  events: DataDictionaryEvent[]
}


