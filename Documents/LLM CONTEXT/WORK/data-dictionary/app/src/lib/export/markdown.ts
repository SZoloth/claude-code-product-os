import type { DataDictionary } from '../schema/dataDictionary'

export function toMarkdown(dict: DataDictionary): string {
  const lines: string[] = []
  lines.push('## Event Dictionary')
  lines.push('')
  dict.events.forEach((e) => {
    lines.push(`### ${e.event_name}`)
    lines.push('')
    lines.push(`- purpose: ${e.event_purpose}`)
    lines.push(`- type: ${e.event_type} / ${e.event_action_type}`)
    lines.push(`- when_to_fire: ${e.when_to_fire}`)
    lines.push(`- actor: ${e.actor}`)
    lines.push(`- object: ${e.object}`)
    lines.push(`- context_surface: ${e.context_surface}`)
    if (e.notes) lines.push(`- notes: ${e.notes}`)
    lines.push('')
    lines.push('Properties:')
    lines.push('')
    lines.push('| name | type | required | example | description |')
    lines.push('|------|------|----------|---------|-------------|')
    e.properties.forEach((p) => {
      lines.push(`| ${p.name} | ${p.type} | ${p.required ? 'true' : 'false'} | ${p.example ?? ''} | ${p.description ?? ''} |`)
    })
    lines.push('')
  })
  return lines.join('\n')
}


