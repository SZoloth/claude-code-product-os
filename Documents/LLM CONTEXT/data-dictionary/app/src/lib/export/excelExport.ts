/**
 * Excel/XLSX export functionality
 * Creates multi-sheet workbooks with formatting and validation
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface ExcelExportOptions {
  includeMetadata?: boolean
  includeSummarySheet?: boolean
  includeValidationSheet?: boolean
  groupByCategory?: boolean
  formatHeaders?: boolean
  addDataValidation?: boolean
}

export interface ExcelExportResult {
  data: string // Base64 encoded XLSX data
  filename: string
  sheetCount: number
  totalRows: number
  fileSize: number
}

export class ExcelExporter {
  /**
   * Export data dictionary as Excel workbook with multiple sheets
   */
  static async exportToExcel(
    dictionary: DataDictionary,
    options: ExcelExportOptions = {}
  ): Promise<ExcelExportResult> {
    const {
      includeMetadata = true,
      includeSummarySheet = true,
      includeValidationSheet = true,
      groupByCategory = false,
      formatHeaders = true,
      addDataValidation: _addDataValidation = true
    } = options

    // Create workbook structure
    const workbook = this.createWorkbook()
    let sheetCount = 0
    let totalRows = 0

    // Main events sheet
    const eventsSheet = this.createEventsSheet(dictionary.events, formatHeaders)
    workbook.sheets.push(eventsSheet)
    sheetCount++
    totalRows += eventsSheet.data.length

    // Properties detail sheet
    const propertiesSheet = this.createPropertiesSheet(dictionary.events)
    workbook.sheets.push(propertiesSheet)
    sheetCount++
    totalRows += propertiesSheet.data.length

    // Summary sheet
    if (includeSummarySheet) {
      const summarySheet = this.createSummarySheet(dictionary)
      workbook.sheets.push(summarySheet)
      sheetCount++
      totalRows += summarySheet.data.length
    }

    // Validation sheet
    if (includeValidationSheet) {
      const validationSheet = this.createValidationSheet(dictionary.events)
      workbook.sheets.push(validationSheet)
      sheetCount++
      totalRows += validationSheet.data.length
    }

    // Metadata sheet
    if (includeMetadata) {
      const metadataSheet = this.createMetadataSheet(dictionary)
      workbook.sheets.push(metadataSheet)
      sheetCount++
      totalRows += metadataSheet.data.length
    }

    // Group by category if requested
    if (groupByCategory) {
      const categorySheets = this.createCategorySheets(dictionary.events)
      workbook.sheets.push(...categorySheets)
      sheetCount += categorySheets.length
      totalRows += categorySheets.reduce((sum, sheet) => sum + sheet.data.length, 0)
    }

    // Convert to Excel format (simplified - in real implementation would use a library like xlsx)
    const excelData = await this.convertToExcelFormat(workbook)
    const fileSize = this.calculateFileSize(excelData)

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `data-dictionary-${timestamp}.xlsx`

    return {
      data: excelData,
      filename,
      sheetCount,
      totalRows,
      fileSize
    }
  }

  private static createWorkbook() {
    return {
      sheets: [] as ExcelSheet[],
      metadata: {
        created: new Date().toISOString(),
        application: 'Data Dictionary Generator',
        version: '1.0.0'
      }
    }
  }

  private static createEventsSheet(events: DataDictionaryEvent[], formatHeaders: boolean) {
    const headers = [
      'Event Name', 'Event Type', 'Action Type', 'Purpose', 'When to Fire',
      'Actor', 'Object', 'Context Surface', 'Lifecycle Status', 'Datadog API',
      'Property Count', 'Required Properties', 'Optional Properties'
    ]

    const data = [
      formatHeaders ? this.formatHeaders(headers) : headers,
      ...events.map(event => [
        event.event_name,
        event.event_type,
        event.event_action_type,
        event.event_purpose,
        event.when_to_fire,
        event.actor,
        event.object,
        event.context_surface,
        event.lifecycle_status,
        event.datadog_api,
        event.properties.length,
        event.properties.filter(p => p.required).length,
        event.properties.filter(p => !p.required).length
      ])
    ]

    return {
      name: 'Events',
      data,
      formatting: formatHeaders ? this.getEventsSheetFormatting() : undefined
    }
  }

  private static createPropertiesSheet(events: DataDictionaryEvent[]) {
    const headers = [
      'Event Name', 'Property Name', 'Type', 'Required', 'Example', 'Description'
    ]

    const data = [headers]
    
    for (const event of events) {
      for (const property of event.properties) {
        data.push([
          event.event_name,
          property.name,
          property.type,
          property.required ? 'Yes' : 'No',
          property.example || '',
          property.description || ''
        ])
      }
    }

    return {
      name: 'Properties',
      data,
      formatting: this.getPropertiesSheetFormatting()
    }
  }

  private static createSummarySheet(dictionary: DataDictionary) {
    const eventsByType = this.groupEventsByType(dictionary.events)
    const eventsByStatus = this.groupEventsByStatus(dictionary.events)
    
    const data = [
      ['Data Dictionary Summary'],
      [''],
      ['Generated Date', dictionary.generatedAtIso],
      ['Total Events', dictionary.events.length],
      [''],
      ['Events by Type'],
      ...Object.entries(eventsByType).map(([type, count]) => [type, count]),
      [''],
      ['Events by Status'],
      ...Object.entries(eventsByStatus).map(([status, count]) => [status, count]),
      [''],
      ['Property Statistics'],
      ['Total Properties', this.getTotalPropertyCount(dictionary.events)],
      ['Required Properties', this.getRequiredPropertyCount(dictionary.events)],
      ['Optional Properties', this.getOptionalPropertyCount(dictionary.events)],
      ['Average Properties per Event', this.getAveragePropertiesPerEvent(dictionary.events)]
    ]

    return {
      name: 'Summary',
      data,
      formatting: this.getSummarySheetFormatting()
    }
  }

  private static createValidationSheet(events: DataDictionaryEvent[]) {
    const data = [
      ['Validation Report'],
      [''],
      ['Event Name', 'Issues', 'Severity', 'Description']
    ]

    for (const event of events) {
      const issues = this.validateEvent(event)
      if (issues.length === 0) {
        data.push([event.event_name, 'No issues', 'Success', 'All validations passed'])
      } else {
        for (const issue of issues) {
          data.push([event.event_name, issue.type, issue.severity, issue.description])
        }
      }
    }

    return {
      name: 'Validation',
      data,
      formatting: this.getValidationSheetFormatting()
    }
  }

  private static createMetadataSheet(dictionary: DataDictionary) {
    const data = [
      ['Metadata'],
      [''],
      ['Field', 'Value'],
      ['Generation Date', dictionary.generatedAtIso],
      ['Total Events', dictionary.events.length],
      ['Export Date', new Date().toISOString()],
      ['Export Format', 'Excel (XLSX)'],
      [''],
      ['Schema Information'],
      ['Schema Version', '1.0.0'],
      ['Required Fields', 'event_name, event_type, event_action_type'],
      ['Optional Fields', 'event_purpose, when_to_fire, actor, object, context_surface'],
      [''],
      ['Quality Metrics'],
      ['Events with Purpose', dictionary.events.filter(e => e.event_purpose).length],
      ['Events with Context', dictionary.events.filter(e => e.context_surface).length],
      ['Events with Properties', dictionary.events.filter(e => e.properties.length > 0).length]
    ]

    return {
      name: 'Metadata',
      data,
      formatting: this.getMetadataSheetFormatting()
    }
  }

  private static createCategorySheets(events: DataDictionaryEvent[]) {
    const eventsByType = this.groupEventsByType(events)
    const sheets = []

    for (const [type, eventCount] of Object.entries(eventsByType)) {
      const typeEvents = events.filter(e => e.event_type === type)
      const sheet = this.createEventsSheet(typeEvents, true)
      sheet.name = `${type.charAt(0).toUpperCase() + type.slice(1)} Events`
      sheets.push(sheet)
    }

    return sheets
  }

  // Helper methods
  private static formatHeaders(headers: string[]) {
    return headers.map(header => ({
      value: header,
      style: { font: { bold: true }, fill: { bgColor: '#f0f0f0' } }
    }))
  }

  private static groupEventsByType(events: DataDictionaryEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private static groupEventsByStatus(events: DataDictionaryEvent[]) {
    return events.reduce((acc, event) => {
      acc[event.lifecycle_status] = (acc[event.lifecycle_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private static getTotalPropertyCount(events: DataDictionaryEvent[]) {
    return events.reduce((sum, event) => sum + event.properties.length, 0)
  }

  private static getRequiredPropertyCount(events: DataDictionaryEvent[]) {
    return events.reduce((sum, event) => 
      sum + event.properties.filter(p => p.required).length, 0)
  }

  private static getOptionalPropertyCount(events: DataDictionaryEvent[]) {
    return events.reduce((sum, event) => 
      sum + event.properties.filter(p => !p.required).length, 0)
  }

  private static getAveragePropertiesPerEvent(events: DataDictionaryEvent[]) {
    if (events.length === 0) return 0
    return Math.round((this.getTotalPropertyCount(events) / events.length) * 100) / 100
  }

  private static validateEvent(event: DataDictionaryEvent) {
    const issues = []

    if (!event.event_name) {
      issues.push({ type: 'Missing Name', severity: 'Error', description: 'Event name is required' })
    }

    if (!event.event_purpose) {
      issues.push({ type: 'Missing Purpose', severity: 'Warning', description: 'Event purpose should be defined' })
    }

    if (event.properties.length === 0) {
      issues.push({ type: 'No Properties', severity: 'Info', description: 'Event has no properties defined' })
    }

    return issues
  }

  private static getEventsSheetFormatting() {
    return {
      headerRow: { font: { bold: true }, fill: { bgColor: '#4472C4' }, font: { color: '#FFFFFF' } },
      dataValidation: {
        'B:B': { type: 'list', values: ['intent', 'success', 'failure'] },
        'C:C': { type: 'list', values: ['action', 'view', 'error'] },
        'I:I': { type: 'list', values: ['proposed', 'approved', 'implemented', 'deprecated'] }
      }
    }
  }

  private static getPropertiesSheetFormatting() {
    return {
      headerRow: { font: { bold: true }, fill: { bgColor: '#70AD47' }, font: { color: '#FFFFFF' } },
      conditionalFormatting: {
        'D:D': { condition: 'equals', value: 'Yes', format: { fill: { bgColor: '#E2EFDA' } } }
      }
    }
  }

  private static getSummarySheetFormatting() {
    return {
      titleRow: { font: { bold: true, size: 16 }, fill: { bgColor: '#FFC000' } },
      sectionHeaders: { font: { bold: true }, fill: { bgColor: '#F2F2F2' } }
    }
  }

  private static getValidationSheetFormatting() {
    return {
      headerRow: { font: { bold: true }, fill: { bgColor: '#C5504B' }, font: { color: '#FFFFFF' } },
      conditionalFormatting: {
        'C:C': {
          'Error': { fill: { bgColor: '#FFC7CE' }, font: { color: '#9C0006' } },
          'Warning': { fill: { bgColor: '#FFEB9C' }, font: { color: '#9C6500' } },
          'Success': { fill: { bgColor: '#C6EFCE' }, font: { color: '#006100' } }
        }
      }
    }
  }

  private static getMetadataSheetFormatting() {
    return {
      headerRow: { font: { bold: true }, fill: { bgColor: '#8EA9DB' } },
      labelColumn: { font: { bold: true } }
    }
  }

  private static async convertToExcelFormat(workbook: any): Promise<string> {
    // In a real implementation, this would use a library like xlsx or exceljs
    // For now, return a mock base64 string
    const jsonData = JSON.stringify(workbook, null, 2)
    return btoa(jsonData) // Simple base64 encoding as placeholder
  }

  private static calculateFileSize(data: string): number {
    // Estimate file size (in real implementation, would be actual XLSX size)
    return data.length * 0.75 // Rough estimate for compression
  }
}

interface ExcelSheet {
  name: string
  data: any[][]
  formatting?: any
}