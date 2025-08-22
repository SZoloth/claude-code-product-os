/**
 * Email export functionality
 * Generates HTML email templates and plain text versions
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface EmailExportOptions {
  format?: 'html' | 'text' | 'both'
  includeHeader?: boolean
  includeFooter?: boolean
  includeStatistics?: boolean
  maxEventsInEmail?: number
  templateStyle?: 'formal' | 'casual' | 'technical'
}

export interface EmailExportResult {
  subject: string
  htmlContent?: string
  textContent?: string
  filename: string
  recipientSuggestions: string[]
  priority: 'low' | 'normal' | 'high'
}

export class EmailExporter {
  /**
   * Export data dictionary as email content
   */
  static exportToEmail(
    dictionary: DataDictionary,
    options: EmailExportOptions = {}
  ): EmailExportResult {
    const {
      format = 'both',
      includeHeader = true,
      includeFooter = true,
      includeStatistics = true,
      maxEventsInEmail = 20,
      templateStyle = 'formal'
    } = options

    const subject = this.generateSubject(dictionary, templateStyle)
    const stats = this.generateStatistics(dictionary.events)
    
    let htmlContent: string | undefined
    let textContent: string | undefined

    if (format === 'html' || format === 'both') {
      htmlContent = this.generateHtmlContent(dictionary, stats, {
        includeHeader,
        includeFooter,
        includeStatistics,
        maxEventsInEmail,
        templateStyle
      })
    }

    if (format === 'text' || format === 'both') {
      textContent = this.generateTextContent(dictionary, stats, {
        includeHeader,
        includeFooter,
        includeStatistics,
        maxEventsInEmail,
        templateStyle
      })
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `email-data-dictionary-${timestamp}.html`

    return {
      subject,
      htmlContent,
      textContent,
      filename,
      recipientSuggestions: this.getRecipientSuggestions(dictionary),
      priority: this.determinePriority(dictionary)
    }
  }

  /**
   * Generate notification email for new events
   */
  static generateNewEventsEmail(
    newEvents: DataDictionaryEvent[],
    options: EmailExportOptions = {}
  ): EmailExportResult {
    const { templateStyle = 'formal' } = options
    
    const subject = `New Analytics Events Added (${newEvents.length} events)`
    
    const htmlContent = this.generateNewEventsHtml(newEvents, templateStyle)
    const textContent = this.generateNewEventsText(newEvents, templateStyle)
    
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `email-new-events-${timestamp}.html`

    return {
      subject,
      htmlContent,
      textContent,
      filename,
      recipientSuggestions: ['analytics-team@company.com', 'engineering@company.com'],
      priority: 'normal'
    }
  }

  /**
   * Generate weekly digest email
   */
  static generateWeeklyDigest(
    dictionary: DataDictionary,
    changedEvents: DataDictionaryEvent[] = [],
    _options: EmailExportOptions = {}
  ): EmailExportResult {
    const subject = `Weekly Analytics Events Digest - ${new Date().toLocaleDateString()}`
    const stats = this.generateStatistics(dictionary.events)
    
    const htmlContent = this.generateDigestHtml(dictionary, changedEvents, stats)
    const textContent = this.generateDigestText(dictionary, changedEvents, stats)
    
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `email-weekly-digest-${timestamp}.html`

    return {
      subject,
      htmlContent,
      textContent,
      filename,
      recipientSuggestions: ['stakeholders@company.com', 'product-team@company.com'],
      priority: 'low'
    }
  }

  private static generateSubject(dictionary: DataDictionary, _style: string): string {
    const eventCount = dictionary.events.length
    
    switch (_style) {
      case 'casual':
        return `📊 Data Dictionary Update - ${eventCount} events ready to go!`
      case 'technical':
        return `[DATA-DICT] ${eventCount} events defined - Implementation ready`
      default:
        return `Data Dictionary: ${eventCount} Analytics Events Defined`
    }
  }

  private static generateHtmlContent(
    dictionary: DataDictionary,
stats: any,
    options: any
  ): string {
    const { includeHeader, includeFooter, includeStatistics, maxEventsInEmail, templateStyle: _templateStyle } = options
    
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Dictionary</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #2563eb; }
        .stats { background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .event { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .event-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .event-name { font-weight: bold; color: #1f2937; }
        .event-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .status-implemented { background: #d1fae5; color: #065f46; }
        .status-proposed { background: #fef3c7; color: #92400e; }
        .properties { margin-top: 10px; }
        .property { background: #f9fafb; padding: 8px; border-radius: 4px; margin: 5px 0; font-size: 14px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>`

    if (includeHeader) {
      html += `
    <div class="header">
        <h1>📊 Data Dictionary</h1>
        <p>Analytics events specification and implementation guide</p>
        <p><strong>Generated:</strong> ${new Date(dictionary.generatedAtIso).toLocaleString()}</p>
    </div>`
    }

    if (includeStatistics) {
      html += `
    <div class="stats">
        <h2>Summary Statistics</h2>
        <ul>
            <li><strong>Total Events:</strong> ${dictionary.events.length}</li>
            <li><strong>By Type:</strong> ${stats.intentEvents} intent, ${stats.successEvents} success, ${stats.failureEvents} failure</li>
            <li><strong>Status:</strong> ${stats.implementedEvents} implemented, ${stats.proposedEvents} proposed</li>
            <li><strong>Properties:</strong> ${stats.totalProperties} total (avg ${stats.avgProperties} per event)</li>
        </ul>
    </div>`
    }

    html += `<h2>Event Definitions</h2>`

    const eventsToShow = dictionary.events.slice(0, maxEventsInEmail)
    for (const event of eventsToShow) {
      html += this.generateEventHtml(event)
    }

    if (dictionary.events.length > maxEventsInEmail) {
      html += `
    <div class="event" style="text-align: center; background: #f3f4f6;">
        <p><em>...and ${dictionary.events.length - maxEventsInEmail} more events</em></p>
        <p><a href="https://your-app.com/data-dictionary">View full dictionary</a></p>
    </div>`
    }

    if (includeFooter) {
      html += `
    <div class="footer">
        <p>This data dictionary was generated automatically. For questions or updates, contact the analytics team.</p>
        <p><a href="https://your-app.com/data-dictionary">View Online</a> | <a href="https://your-app.com/export/csv">Download CSV</a></p>
    </div>`
    }

    html += `
</body>
</html>`

    return html
  }

  private static generateEventHtml(event: DataDictionaryEvent): string {
    const statusClass = `status-${event.lifecycle_status}`
    
    let html = `
    <div class="event">
        <div class="event-header">
            <span class="event-name">${event.event_name}</span>
            <span class="event-status ${statusClass}">${event.lifecycle_status}</span>
        </div>
        <p><strong>Purpose:</strong> ${event.event_purpose}</p>
        <p><strong>When to Fire:</strong> ${event.when_to_fire}</p>
        <p><strong>Type:</strong> ${event.event_type} (${event.event_action_type})</p>
        <p><strong>Context:</strong> ${event.actor} → ${event.object} @ ${event.context_surface}</p>`

    if (event.properties.length > 0) {
      html += `
        <div class="properties">
            <strong>Properties (${event.properties.length}):</strong>`
      
      for (const prop of event.properties.slice(0, 5)) {
        const required = prop.required ? ' (required)' : ''
        html += `
            <div class="property">
                <strong>${prop.name}</strong> (${prop.type}${required}): ${prop.description || 'No description'}
            </div>`
      }
      
      if (event.properties.length > 5) {
        html += `<p><em>...and ${event.properties.length - 5} more properties</em></p>`
      }
      
      html += `</div>`
    }

    html += `</div>`
    
    return html
  }

  private static generateTextContent(
    dictionary: DataDictionary,
stats: any,
    options: any
  ): string {
    const { includeHeader, includeFooter, includeStatistics, maxEventsInEmail } = options
    
    let text = ''

    if (includeHeader) {
      text += `DATA DICTIONARY\n`
      text += `===============\n\n`
      text += `Analytics events specification and implementation guide\n`
      text += `Generated: ${new Date(dictionary.generatedAtIso).toLocaleString()}\n\n`
    }

    if (includeStatistics) {
      text += `SUMMARY STATISTICS\n`
      text += `------------------\n`
      text += `Total Events: ${dictionary.events.length}\n`
      text += `By Type: ${stats.intentEvents} intent, ${stats.successEvents} success, ${stats.failureEvents} failure\n`
      text += `Status: ${stats.implementedEvents} implemented, ${stats.proposedEvents} proposed\n`
      text += `Properties: ${stats.totalProperties} total (avg ${stats.avgProperties} per event)\n\n`
    }

    text += `EVENT DEFINITIONS\n`
    text += `=================\n\n`

    const eventsToShow = dictionary.events.slice(0, maxEventsInEmail)
    for (let i = 0; i < eventsToShow.length; i++) {
      text += this.generateEventText(eventsToShow[i], i + 1)
    }

    if (dictionary.events.length > maxEventsInEmail) {
      text += `...and ${dictionary.events.length - maxEventsInEmail} more events\n`
      text += `View full dictionary at: https://your-app.com/data-dictionary\n\n`
    }

    if (includeFooter) {
      text += `---\n`
      text += `This data dictionary was generated automatically.\n`
      text += `For questions or updates, contact the analytics team.\n`
      text += `View Online: https://your-app.com/data-dictionary\n`
      text += `Download CSV: https://your-app.com/export/csv\n`
    }

    return text
  }

  private static generateEventText(event: DataDictionaryEvent, index: number): string {
    let text = `${index}. ${event.event_name} [${event.lifecycle_status}]\n`
    text += `   Purpose: ${event.event_purpose}\n`
    text += `   When to Fire: ${event.when_to_fire}\n`
    text += `   Type: ${event.event_type} (${event.event_action_type})\n`
    text += `   Context: ${event.actor} → ${event.object} @ ${event.context_surface}\n`
    
    if (event.properties.length > 0) {
      text += `   Properties (${event.properties.length}):\n`
      for (const prop of event.properties.slice(0, 3)) {
        const required = prop.required ? ' (required)' : ''
        text += `     - ${prop.name} (${prop.type}${required})\n`
      }
      if (event.properties.length > 3) {
        text += `     - ...and ${event.properties.length - 3} more properties\n`
      }
    }
    
    text += `\n`
    return text
  }

  private static generateNewEventsHtml(events: DataDictionaryEvent[], _style: string): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .event { border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🆕 New Analytics Events</h1>
        <p>${events.length} new events have been added to the data dictionary.</p>
    </div>`

    for (const event of events) {
      html += `
    <div class="event">
        <h3>${event.event_name}</h3>
        <p><strong>Purpose:</strong> ${event.event_purpose}</p>
        <p><strong>Type:</strong> ${event.event_type}</p>
        <p><strong>Properties:</strong> ${event.properties.length}</p>
    </div>`
    }

    html += `
    <p><a href="https://your-app.com/data-dictionary">View full data dictionary</a></p>
</body>
</html>`

    return html
  }

  private static generateNewEventsText(events: DataDictionaryEvent[], _style: string): string {
    let text = `NEW ANALYTICS EVENTS\n`
    text += `====================\n\n`
    text += `${events.length} new events have been added to the data dictionary:\n\n`

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      text += `${i + 1}. ${event.event_name}\n`
      text += `   Purpose: ${event.event_purpose}\n`
      text += `   Type: ${event.event_type}\n`
      text += `   Properties: ${event.properties.length}\n\n`
    }

    text += `View full data dictionary at: https://your-app.com/data-dictionary\n`
    
    return text
  }

  private static generateDigestHtml(
    _dictionary: DataDictionary,
    _changedEvents: DataDictionaryEvent[],
_stats: any
  ): string {
    // Implementation for weekly digest HTML
    return `<!DOCTYPE html><html><body><h1>Weekly Digest</h1><p>Summary content...</p></body></html>`
  }

  private static generateDigestText(
    _dictionary: DataDictionary,
    _changedEvents: DataDictionaryEvent[],
_stats: any
  ): string {
    // Implementation for weekly digest text
    return `WEEKLY DIGEST\n=============\n\nSummary content...`
  }

  private static generateStatistics(events: DataDictionaryEvent[]) {
    return {
      intentEvents: events.filter(e => e.event_type === 'intent').length,
      successEvents: events.filter(e => e.event_type === 'success').length,
      failureEvents: events.filter(e => e.event_type === 'failure').length,
      implementedEvents: events.filter(e => e.lifecycle_status === 'implemented').length,
      proposedEvents: events.filter(e => e.lifecycle_status === 'proposed').length,
      totalProperties: events.reduce((sum, e) => sum + e.properties.length, 0),
      avgProperties: Math.round((events.reduce((sum, e) => sum + e.properties.length, 0) / events.length) * 10) / 10
    }
  }

  private static getRecipientSuggestions(_dictionary: DataDictionary): string[] {
    return [
      'analytics-team@company.com',
      'engineering@company.com',
      'product-managers@company.com',
      'data-team@company.com'
    ]
  }

  private static determinePriority(dictionary: DataDictionary): 'low' | 'normal' | 'high' {
    const failureEvents = dictionary.events.filter(e => e.event_type === 'failure').length
    const totalEvents = dictionary.events.length
    
    if (failureEvents > totalEvents * 0.3) return 'high'
    if (totalEvents > 50) return 'normal'
    return 'low'
  }
}