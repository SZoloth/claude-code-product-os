/**
 * Slack export functionality
 * Generates Slack-formatted messages and webhook payloads
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface SlackExportOptions {
  includeBlocks?: boolean
  includeAttachments?: boolean
  webhookUrl?: string
  channelName?: string
  includeStatistics?: boolean
  maxEventsInMessage?: number
}

export interface SlackExportResult {
  payload: SlackMessage
  filename: string
  messageCount: number
  blockCount: number
  attachmentCount: number
}

interface SlackMessage {
  channel?: string
  text: string
  blocks?: SlackBlock[]
  attachments?: SlackAttachment[]
}

interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
  }
  elements?: any[]
  fields?: any[]
  accessory?: any
}

interface SlackAttachment {
  color: string
  title: string
  text: string
  fields: Array<{
    title: string
    value: string
    short: boolean
  }>
}

export class SlackExporter {
  /**
   * Export data dictionary as Slack message
   */
  static exportToSlack(
    dictionary: DataDictionary,
    options: SlackExportOptions = {}
  ): SlackExportResult {
    const {
      includeBlocks = true,
      includeAttachments = false,
      channelName = '#analytics',
      includeStatistics = true,
      maxEventsInMessage = 10
    } = options

    let blockCount = 0
    let attachmentCount = 0
    let messageCount = 1

    const message: SlackMessage = {
      channel: channelName,
      text: this.createFallbackText(dictionary),
      blocks: [],
      attachments: []
    }

    if (includeBlocks) {
      // Header block
      message.blocks!.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Data Dictionary Update'
        }
      })
      blockCount++

      // Summary section
      if (includeStatistics) {
        const stats = this.generateStatistics(dictionary.events)
        message.blocks!.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: this.createStatisticsText(stats, dictionary)
          }
        })
        blockCount++
      }

      // Divider
      message.blocks!.push({ type: 'divider' })
      blockCount++

      // Events overview
      const eventsToShow = dictionary.events.slice(0, maxEventsInMessage)
      for (const event of eventsToShow) {
        const eventBlock = this.createEventBlock(event)
        message.blocks!.push(eventBlock)
        blockCount++
      }

      // More events indicator
      if (dictionary.events.length > maxEventsInMessage) {
        message.blocks!.push({
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `_...and ${dictionary.events.length - maxEventsInMessage} more events_`
          }]
        })
        blockCount++
      }

      // Action buttons
      message.blocks!.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Full Dictionary'
            },
            style: 'primary',
            url: 'https://your-app.com/data-dictionary'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Download CSV'
            },
            url: 'https://your-app.com/export/csv'
          }
        ]
      })
      blockCount++
    }

    if (includeAttachments) {
      // Create attachments for each event type
      const eventsByType = this.groupEventsByType(dictionary.events)
      
      for (const [type, events] of Object.entries(eventsByType)) {
        const attachment = this.createEventTypeAttachment(type, events)
        message.attachments!.push(attachment)
        attachmentCount++
      }
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `slack-data-dictionary-${timestamp}.json`

    return {
      payload: message,
      filename,
      messageCount,
      blockCount,
      attachmentCount
    }
  }

  /**
   * Create webhook payload for posting to Slack
   */
  static createWebhookPayload(
    dictionary: DataDictionary,
    webhookUrl: string,
    options: SlackExportOptions = {}
  ): { url: string; payload: SlackMessage } {
    const result = this.exportToSlack(dictionary, options)
    return {
      url: webhookUrl,
      payload: result.payload
    }
  }

  /**
   * Create notification message for new events
   */
  static createNewEventsNotification(
    newEvents: DataDictionaryEvent[],
    channelName = '#analytics'
  ): SlackMessage {
    return {
      channel: channelName,
      text: `${newEvents.length} new analytics events have been added to the data dictionary`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🆕 New Analytics Events'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${newEvents.length}* new events have been added to the data dictionary:`
          }
        },
        ...newEvents.slice(0, 5).map(event => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `• *${event.event_name}* - ${event.event_purpose}`
          }
        })),
        ...(newEvents.length > 5 ? [{
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `_...and ${newEvents.length - 5} more events_`
          }]
        }] : [])
      ]
    }
  }

  private static createFallbackText(dictionary: DataDictionary): string {
    return `Data Dictionary Update: ${dictionary.events.length} events defined. Generated: ${new Date(dictionary.generatedAtIso).toLocaleString()}`
  }

  private static createStatisticsText(stats: any, dictionary: DataDictionary): string {
    return [
      `*Total Events:* ${dictionary.events.length}`,
      `*By Type:* ${stats.intentEvents} intent, ${stats.successEvents} success, ${stats.failureEvents} failure`,
      `*Status:* ${stats.implementedEvents} implemented, ${stats.proposedEvents} proposed`,
      `*Properties:* ${stats.totalProperties} total (avg ${stats.avgProperties} per event)`,
      `*Generated:* ${new Date(dictionary.generatedAtIso).toLocaleString()}`
    ].join('\n')
  }

  private static createEventBlock(event: DataDictionaryEvent): SlackBlock {
    const statusEmoji = this.getStatusEmoji(event.lifecycle_status)
    const typeEmoji = this.getTypeEmoji(event.event_type)
    
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          `${statusEmoji} *${event.event_name}* ${typeEmoji}`,
          `_${event.event_purpose}_`,
          `*When:* ${event.when_to_fire}`,
          `*Properties:* ${event.properties.length}`
        ].join('\n')
      },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'View Details'
            },
            value: `view_${event.event_name}`
          },
          {
            text: {
              type: 'plain_text',
              text: 'Edit Event'
            },
            value: `edit_${event.event_name}`
          }
        ]
      }
    }
  }

  private static createEventTypeAttachment(type: string, events: DataDictionaryEvent[]): SlackAttachment {
    const color = this.getTypeColor(type)
    
    return {
      color,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Events (${events.length})`,
      text: `Events that track ${type} interactions`,
      fields: events.slice(0, 10).map(event => ({
        title: event.event_name,
        value: event.event_purpose || 'No description',
        short: true
      }))
    }
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

  private static groupEventsByType(events: DataDictionaryEvent[]): Record<string, DataDictionaryEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.event_type]) {
        acc[event.event_type] = []
      }
      acc[event.event_type].push(event)
      return acc
    }, {} as Record<string, DataDictionaryEvent[]>)
  }

  private static getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      'proposed': '💡',
      'approved': '✅',
      'implemented': '🚀',
      'deprecated': '🗑️'
    }
    return emojis[status] || '📊'
  }

  private static getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'intent': '🎯',
      'success': '✅',
      'failure': '❌'
    }
    return emojis[type] || '📈'
  }

  private static getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'intent': '#36A2EB',
      'success': '#4BC0C0',
      'failure': '#FF6384'
    }
    return colors[type] || '#9966FF'
  }
}