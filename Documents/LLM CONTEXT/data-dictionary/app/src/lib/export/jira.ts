import type { DataDictionary } from '../schema/dataDictionary'

export function toJiraText(dict: DataDictionary): string {
  return dict.events.map((e) => {
    return `Event: ${e.event_name}
Purpose: ${e.event_purpose}
When: ${e.when_to_fire}
Type: ${e.event_type}/${e.event_action_type}
Properties: ${e.properties.map(p => `${p.name}:${p.type}${p.required ? '*' : ''}`).join(', ')}
Datadog: ${e.datadog_api}`
  }).join('\n\n')
}


