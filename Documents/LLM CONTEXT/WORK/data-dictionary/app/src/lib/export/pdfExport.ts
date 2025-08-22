/**
 * PDF export functionality
 * Generates PDF reports and documentation
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface PdfExportOptions {
  format?: 'a4' | 'letter' | 'legal'
  orientation?: 'portrait' | 'landscape'
  includeTableOfContents?: boolean
  includeStatistics?: boolean
  includeProperties?: boolean
  includeCharts?: boolean
  theme?: 'professional' | 'minimal' | 'colorful'
  fontSize?: number
}

export interface PdfExportResult {
  content: PdfDocumentContent
  filename: string
  pageCount: number
  sections: string[]
  fileSize: number
}

interface PdfDocumentContent {
  pageSize: string
  pageOrientation: string
  content: any[]
  styles: Record<string, any>
  defaultStyle: any
  header?: any
  footer?: any
}

export class PdfExporter {
  /**
   * Export data dictionary as PDF document
   */
  static exportToPdf(
    dictionary: DataDictionary,
    options: PdfExportOptions = {}
  ): PdfExportResult {
    const {
      format = 'a4',
      orientation = 'portrait',
      includeTableOfContents = true,
      includeStatistics = true,
      includeProperties = true,
      includeCharts = false,
      theme = 'professional',
      fontSize = 10
    } = options

    const content: any[] = []
    const sections: string[] = []
    let pageCount = 1

    // Document header
    content.push({
      text: 'Data Dictionary',
      style: 'title',
      margin: [0, 0, 0, 20]
    })

    content.push({
      text: `Generated: ${new Date(dictionary.generatedAtIso).toLocaleString()}`,
      style: 'metadata',
      margin: [0, 0, 0, 10]
    })

    content.push({
      text: `Version: ${dictionary.version}`,
      style: 'metadata',
      margin: [0, 0, 0, 20]
    })

    sections.push('header')

    // Executive Summary
    content.push({
      text: 'Executive Summary',
      style: 'heading1',
      pageBreak: 'before'
    })

    const stats = this.generateStatistics(dictionary.events)
    content.push({
      text: this.createExecutiveSummary(dictionary, stats),
      style: 'body',
      margin: [0, 10, 0, 20]
    })

    sections.push('executive-summary')
    pageCount++

    // Statistics Section
    if (includeStatistics) {
      content.push({
        text: 'Statistics Overview',
        style: 'heading1',
        pageBreak: 'before'
      })

      const statisticsTable = this.createStatisticsTable(stats, dictionary)
      content.push(statisticsTable)

      if (includeCharts) {
        // Placeholder for charts - would need chart generation library
        content.push({
          text: 'Event Distribution Charts',
          style: 'heading2',
          margin: [0, 20, 0, 10]
        })
        
        content.push({
          text: '[Chart: Event Types Distribution]',
          style: 'placeholder',
          margin: [20, 10, 0, 10]
        })
        
        content.push({
          text: '[Chart: Implementation Status]',
          style: 'placeholder',
          margin: [20, 10, 0, 20]
        })
      }

      sections.push('statistics')
      pageCount++
    }

    // Table of Contents
    if (includeTableOfContents) {
      content.push({
        text: 'Table of Contents',
        style: 'heading1',
        pageBreak: 'before'
      })

      const tocItems = dictionary.events.map((event, index) => ({
        text: `${index + 1}. ${event.event_name}`,
        link: `event_${event.event_name}`,
        style: 'tocItem'
      }))

      content.push({
        ul: tocItems,
        margin: [0, 10, 0, 20]
      })

      sections.push('table-of-contents')
      pageCount++
    }

    // Event Definitions
    content.push({
      text: 'Event Definitions',
      style: 'heading1',
      pageBreak: 'before'
    })

    for (let i = 0; i < dictionary.events.length; i++) {
      const event = dictionary.events[i]
      const eventContent = this.createEventSection(event, i + 1, includeProperties)
      content.push(...eventContent)
      
      // Add page break every 3 events
      if ((i + 1) % 3 === 0 && i < dictionary.events.length - 1) {
        content[content.length - 1].pageBreak = 'after'
        pageCount++
      }
    }

    sections.push('event-definitions')
    pageCount += Math.ceil(dictionary.events.length / 3)

    // Appendices
    content.push({
      text: 'Appendices',
      style: 'heading1',
      pageBreak: 'before'
    })

    // Appendix A: Glossary
    content.push({
      text: 'Appendix A: Glossary',
      style: 'heading2',
      margin: [0, 20, 0, 10]
    })

    content.push(this.createGlossaryTable())

    // Appendix B: Implementation Guide
    content.push({
      text: 'Appendix B: Implementation Guide',
      style: 'heading2',
      margin: [0, 20, 0, 10]
    })

    content.push({
      text: this.createImplementationGuide(),
      style: 'body'
    })

    sections.push('appendices')
    pageCount += 2

    const pdfContent: PdfDocumentContent = {
      pageSize: format.toUpperCase(),
      pageOrientation: orientation,
      content,
      styles: this.createStyles(theme, fontSize),
      defaultStyle: {
        fontSize,
        font: 'Helvetica'
      },
      header: this.createHeader(dictionary),
      footer: this.createFooter()
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `data-dictionary-${timestamp}.pdf`

    return {
      content: pdfContent,
      filename,
      pageCount,
      sections,
      fileSize: this.estimateFileSize(content, pageCount)
    }
  }

  /**
   * Create summary report PDF
   */
  static createSummaryReport(
    dictionary: DataDictionary,
    options: PdfExportOptions = {}
  ): PdfExportResult {
    const stats = this.generateStatistics(dictionary.events)
    
    const content = [
      {
        text: 'Analytics Events Summary Report',
        style: 'title',
        margin: [0, 0, 0, 30]
      },
      {
        text: `Report Date: ${new Date().toLocaleDateString()}`,
        style: 'metadata',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Key Metrics',
        style: 'heading1'
      },
      this.createStatisticsTable(stats, dictionary),
      {
        text: 'Event Types Breakdown',
        style: 'heading1',
        margin: [0, 30, 0, 10]
      },
      this.createEventTypesTable(dictionary.events),
      {
        text: 'Implementation Status',
        style: 'heading1',
        margin: [0, 30, 0, 10]
      },
      this.createImplementationStatusTable(dictionary.events)
    ]

    const pdfContent: PdfDocumentContent = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      content,
      styles: this.createStyles('professional', 11),
      defaultStyle: {
        fontSize: 11,
        font: 'Helvetica'
      }
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `analytics-summary-${timestamp}.pdf`

    return {
      content: pdfContent,
      filename,
      pageCount: 2,
      sections: ['summary'],
      fileSize: this.estimateFileSize(content, 2)
    }
  }

  private static createExecutiveSummary(dictionary: DataDictionary, stats: any): string {
    return [
      `This document defines ${dictionary.events.length} analytics events for comprehensive user behavior tracking.`,
      ``,
      `The events are categorized into ${stats.intentEvents} intent events, ${stats.successEvents} success events, and ${stats.failureEvents} failure events.`,
      ``,
      `Currently, ${stats.implementedEvents} events are implemented in production, with ${stats.proposedEvents} events proposed for future implementation.`,
      ``,
      `The events collectively define ${stats.totalProperties} properties, with an average of ${stats.avgProperties} properties per event.`,
      ``,
      `This dictionary serves as the authoritative specification for analytics implementation across all platforms and applications.`
    ].join('\n')
  }

  private static createStatisticsTable(stats: any, dictionary: DataDictionary): any {
    return {
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Metric', style: 'tableHeader' },
            { text: 'Value', style: 'tableHeader' }
          ],
          ['Total Events', dictionary.events.length.toString()],
          ['Intent Events', stats.intentEvents.toString()],
          ['Success Events', stats.successEvents.toString()],
          ['Failure Events', stats.failureEvents.toString()],
          ['Implemented Events', stats.implementedEvents.toString()],
          ['Proposed Events', stats.proposedEvents.toString()],
          ['Total Properties', stats.totalProperties.toString()],
          ['Avg Properties per Event', stats.avgProperties.toString()]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 10, 0, 20]
    }
  }

  private static createEventTypesTable(events: DataDictionaryEvent[]): any {
    const typeGroups = this.groupEventsByType(events)
    
    const body = [
      [
        { text: 'Event Type', style: 'tableHeader' },
        { text: 'Count', style: 'tableHeader' },
        { text: 'Description', style: 'tableHeader' }
      ]
    ]

    for (const [type, eventList] of Object.entries(typeGroups)) {
      body.push([
        { text: type, style: 'tableCell' },
        { text: eventList.length.toString(), style: 'tableCell' },
        { text: this.getTypeDescription(type), style: 'tableCell' }
      ])
    }

    return {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', '*'],
        body
      },
      layout: 'lightHorizontalLines'
    }
  }

  private static createImplementationStatusTable(events: DataDictionaryEvent[]): any {
    const statusGroups = this.groupEventsByStatus(events)
    
    const body = [
      [
        { text: 'Status', style: 'tableHeader' },
        { text: 'Count', style: 'tableHeader' },
        { text: 'Percentage', style: 'tableHeader' }
      ]
    ]

    for (const [status, eventList] of Object.entries(statusGroups)) {
      const percentage = Math.round((eventList.length / events.length) * 100)
      body.push([
        { text: status, style: 'tableCell' },
        { text: eventList.length.toString(), style: 'tableCell' },
        { text: `${percentage}%`, style: 'tableCell' }
      ])
    }

    return {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto'],
        body
      },
      layout: 'lightHorizontalLines'
    }
  }

  private static createEventSection(event: DataDictionaryEvent, index: number, includeProperties: boolean): any[] {
    const section = []

    // Event header
    section.push({
      text: `${index}. ${event.event_name}`,
      style: 'heading2',
      id: `event_${event.event_name}`,
      margin: [0, 20, 0, 10]
    })

    // Status badge
    section.push({
      text: `Status: ${event.lifecycle_status}`,
      style: 'status',
      margin: [0, 0, 0, 10]
    })

    // Basic information table
    const basicInfoTable = {
      table: {
        widths: ['auto', '*'],
        body: [
          ['Purpose', event.event_purpose || 'Not specified'],
          ['When to Fire', event.when_to_fire || 'Not specified'],
          ['Event Type', event.event_type],
          ['Action Type', event.event_action_type],
          ['Actor', event.actor || 'Not specified'],
          ['Object', event.object || 'Not specified'],
          ['Context Surface', event.context_surface || 'Not specified'],
          ['Datadog API', event.datadog_api || 'Not specified']
        ]
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 15]
    }

    section.push(basicInfoTable)

    // Properties table
    if (includeProperties && event.properties.length > 0) {
      section.push({
        text: `Properties (${event.properties.length})`,
        style: 'heading3',
        margin: [0, 15, 0, 5]
      })

      const propertiesTable = {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', '*'],
          body: [
            [
              { text: 'Name', style: 'tableHeader' },
              { text: 'Type', style: 'tableHeader' },
              { text: 'Required', style: 'tableHeader' },
              { text: 'Description', style: 'tableHeader' }
            ],
            ...event.properties.map(prop => [
              prop.name,
              prop.type,
              prop.required ? 'Yes' : 'No',
              prop.description || 'No description'
            ])
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 0]
      }

      section.push(propertiesTable)
    }

    return section
  }

  private static createGlossaryTable(): any {
    return {
      table: {
        headerRows: 1,
        widths: ['auto', '*'],
        body: [
          [
            { text: 'Term', style: 'tableHeader' },
            { text: 'Definition', style: 'tableHeader' }
          ],
          ['Intent Event', 'Tracks user intention to perform an action'],
          ['Success Event', 'Tracks successful completion of an action'],
          ['Failure Event', 'Tracks failed attempts or errors'],
          ['Event Property', 'Additional data associated with an event'],
          ['Lifecycle Status', 'Current state of event implementation'],
          ['Context Surface', 'The UI location where the event occurs'],
          ['Actor', 'The entity performing the action'],
          ['Object', 'The entity being acted upon']
        ]
      },
      layout: 'lightHorizontalLines'
    }
  }

  private static createImplementationGuide(): string {
    return [
      '1. Review all proposed events with stakeholders',
      '2. Implement events using the specified Datadog API methods',
      '3. Include all required properties in event payloads',
      '4. Test events in development environment',
      '5. Validate events in staging before production deployment',
      '6. Monitor event firing and data quality in production',
      '7. Update event status to "implemented" after successful deployment'
    ].join('\n')
  }

  private static createStyles(theme: string, fontSize: number): Record<string, any> {
    const baseStyles = {
      title: {
        fontSize: fontSize + 8,
        bold: true,
        alignment: 'center',
        color: '#1f2937'
      },
      heading1: {
        fontSize: fontSize + 4,
        bold: true,
        color: '#1f2937',
        margin: [0, 20, 0, 10]
      },
      heading2: {
        fontSize: fontSize + 2,
        bold: true,
        color: '#374151',
        margin: [0, 15, 0, 8]
      },
      heading3: {
        fontSize: fontSize + 1,
        bold: true,
        color: '#4b5563'
      },
      body: {
        fontSize,
        lineHeight: 1.4,
        color: '#374151'
      },
      metadata: {
        fontSize: fontSize - 1,
        color: '#6b7280',
        alignment: 'center'
      },
      tableHeader: {
        fontSize: fontSize,
        bold: true,
        fillColor: '#f3f4f6',
        color: '#1f2937'
      },
      status: {
        fontSize: fontSize - 1,
        bold: true,
        color: '#059669'
      },
      tocItem: {
        fontSize: fontSize,
        color: '#2563eb'
      },
      placeholder: {
        fontSize: fontSize,
        italics: true,
        color: '#9ca3af',
        alignment: 'center'
      }
    }

    if (theme === 'colorful') {
      baseStyles.title.color = '#2563eb'
      baseStyles.heading1.color = '#2563eb'
      baseStyles.heading2.color = '#7c3aed'
    }

    return baseStyles
  }

  private static createHeader(dictionary: DataDictionary): any {
    return {
      text: `Data Dictionary - ${dictionary.events.length} Events`,
      style: {
        fontSize: 8,
        color: '#6b7280'
      },
      alignment: 'right',
      margin: [0, 10, 20, 0]
    }
  }

  private static createFooter(): any {
    return {
      text: [
        'Page ',
        { text: 'pageNumber', italics: true },
        ' of ',
        { text: 'pageCount', italics: true }
      ],
      style: {
        fontSize: 8,
        color: '#6b7280'
      },
      alignment: 'center',
      margin: [0, 10, 0, 0]
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

  private static groupEventsByStatus(events: DataDictionaryEvent[]): Record<string, DataDictionaryEvent[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.lifecycle_status]) {
        acc[event.lifecycle_status] = []
      }
      acc[event.lifecycle_status].push(event)
      return acc
    }, {} as Record<string, DataDictionaryEvent[]>)
  }

  private static getTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'intent': 'User expresses intention to perform an action',
      'success': 'User successfully completes an action',
      'failure': 'User encounters an error or fails to complete an action'
    }
    return descriptions[type] || 'No description available'
  }

  private static estimateFileSize(content: any[], pageCount: number): number {
    // Rough estimation: 50KB per page
    return pageCount * 50 * 1024
  }
}