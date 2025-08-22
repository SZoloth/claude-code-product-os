import type { DataDictionary } from '../schema/dataDictionary'

export function toCsv(dict: DataDictionary): string {
  const header = [
    'event_name','event_type','event_action_type','event_purpose','user_story','when_to_fire','actor','object','context_surface',
    'properties','context_keys','ownership_team','priority','lifecycle_status','notes','datadog_api','datadog_sample_code','error_code','error_message'
  ]
  const rows = dict.events.map((e) => {
    const properties = JSON.stringify(e.properties)
    const contextKeys = e.context_keys ? e.context_keys.join('|') : ''
    return [
      e.event_name, e.event_type, e.event_action_type, e.event_purpose, e.user_story ?? '', e.when_to_fire, e.actor, e.object, e.context_surface,
      properties, contextKeys, e.ownership_team ?? '', e.priority ?? '', e.lifecycle_status, e.notes ?? '', e.datadog_api, e.datadog_sample_code ?? '',
      e.error_code ?? '', e.error_message ?? ''
    ].map(cell => escapeCsv(String(cell)))
    .join(',')
  })
  return [header.join(','), ...rows].join('\n')
}

function escapeCsv(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return '"' + cell.replace(/"/g, '""') + '"'
  }
  return cell
}


