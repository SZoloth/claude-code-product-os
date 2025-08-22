import type { DataDictionaryEvent } from '../schema/dataDictionary'

export function generateDatadogStub(e: DataDictionaryEvent): string {
  if (e.event_type === 'failure') {
    return `const error = new Error('${e.event_name} failed')
DD_RUM.addError(error, {
  actor: '${e.actor}',
  object: '${e.object}',
  context_surface: '${e.context_surface}',
  error_code: '${e.error_code ?? ''}',
  error_message: '${e.error_message ?? ''}',
  properties: {}
})`
  }
  if (e.event_action_type === 'feature_flag') {
    return `DD_RUM.addFeatureFlagEvaluation('${e.event_name}', {
  actor: '${e.actor}',
  object: '${e.object}',
  context_surface: '${e.context_surface}',
  properties: {}
})`
  }
  return `DD_RUM.addAction('${e.event_name}', {
  actor: '${e.actor}',
  object: '${e.object}',
  context_surface: '${e.context_surface}',
  properties: {}
})`
}


