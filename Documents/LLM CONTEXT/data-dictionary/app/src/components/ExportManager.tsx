/**
 * ExportManager component - Handle all export functionality (CSV, Markdown, Datadog, JIRA)
 */

import { useState, useRef } from 'react'
import type { DataDictionary } from '../lib/schema/dataDictionary'
import type { ExportOptions } from '../lib/export/exportUtils'
import { ExportUtils } from '../lib/export/exportUtils'
import { ExportValidator } from '../lib/export/exportValidator'
import type { ExportValidationResult, ImportResult } from '../lib/export/exportValidator'
import { trackExport } from '../lib/analytics/usageTracker'
import { ExcelExporter } from '../lib/export/excelExport'
import { JsonSchemaExporter } from '../lib/export/jsonSchemaExport'
import { OpenApiExporter } from '../lib/export/openApiExport'
import { SlackExporter } from '../lib/export/slackExport'
import { EmailExporter } from '../lib/export/emailExport'
import { PdfExporter } from '../lib/export/pdfExport'
import { PostmanExporter } from '../lib/export/postmanExport'
import { SqlExporter } from '../lib/export/sqlExport'

interface ExportManagerProps {
  dictionary: DataDictionary
  onClose: () => void
  className?: string
}

type ExportFormat = 'csv' | 'markdown' | 'datadog' | 'jira' | 'excel' | 'json-schema' | 'openapi' | 'slack' | 'email' | 'pdf' | 'postman' | 'sql'

interface ExportState {
  format: ExportFormat
  isExporting: boolean
  isValidating: boolean
  isImporting: boolean
  lastExport?: {
    format: ExportFormat
    filename: string
    timestamp: string
    size: string
  }
  validationResult?: ExportValidationResult
  importResult?: ImportResult
  error?: string
}

export default function ExportManager({ 
  dictionary, 
  onClose, 
  className = '' 
}: ExportManagerProps) {
  const [exportState, setExportState] = useState<ExportState>({
    format: 'csv',
    isExporting: false,
    isValidating: false,
    isImporting: false
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showValidation, setShowValidation] = useState(false)
  
  const [csvOptions, setCsvOptions] = useState<ExportOptions>({
    includeHeaders: true,
    includeEmptyColumns: true,
    delimiter: ',',
    dateFormat: 'iso',
    validateSchema: true
  })

  const [selectedFormats, setSelectedFormats] = useState<Set<ExportFormat>>(new Set(['csv']))
  const [advancedOptions, setAdvancedOptions] = useState({
    excel: { includeMetadata: true, includeValidationSheet: true },
    jsonSchema: { includeExamples: true, strictMode: false },
    openapi: { includeExamples: true, generatePaths: true },
    slack: { includeBlocks: true, includeStatistics: true },
    email: { format: 'both' as 'html' | 'text' | 'both', templateStyle: 'formal' as 'formal' | 'casual' | 'technical' },
    pdf: { includeTableOfContents: true, includeStatistics: true },
    postman: { includeExamples: true, includeTests: true },
    sql: { dialect: 'postgresql' as 'postgresql' | 'mysql' | 'sqlite' | 'bigquery', includeIndexes: true }
  })

  const handleSingleExport = async (format: ExportFormat) => {
    setExportState(prev => ({ ...prev, isExporting: true, error: undefined }))
    
    try {
      let result: any
      let blob: Blob
      
      switch (format) {
        case 'csv':
          result = ExportUtils.exportToCsv(dictionary, csvOptions)
          blob = new Blob([result.data], { type: 'text/csv' })
          break
          
        case 'markdown':
          result = ExportUtils.exportToMarkdown(dictionary)
          blob = new Blob([result.data], { type: 'text/markdown' })
          break
          
        case 'datadog':
          result = ExportUtils.exportToDatadog(dictionary)
          blob = new Blob([result.data], { type: 'text/typescript' })
          break
          
        case 'jira':
          result = ExportUtils.exportToJira(dictionary)
          blob = new Blob([result.data], { type: 'text/plain' })
          break

        case 'excel':
          result = await ExcelExporter.exportToExcel(dictionary, advancedOptions.excel)
          // Convert base64 to blob
          const excelData = atob(result.data)
          const excelBytes = new Uint8Array(excelData.length)
          for (let i = 0; i < excelData.length; i++) {
            excelBytes[i] = excelData.charCodeAt(i)
          }
          blob = new Blob([excelBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          break

        case 'json-schema':
          result = JsonSchemaExporter.exportToJsonSchema(dictionary, advancedOptions.jsonSchema)
          blob = new Blob([JSON.stringify(result.schema, null, 2)], { type: 'application/json' })
          break

        case 'openapi':
          result = OpenApiExporter.exportToOpenApi(dictionary, advancedOptions.openapi)
          blob = new Blob([JSON.stringify(result.spec, null, 2)], { type: 'application/json' })
          break

        case 'slack':
          result = SlackExporter.exportToSlack(dictionary, advancedOptions.slack)
          blob = new Blob([JSON.stringify(result.payload, null, 2)], { type: 'application/json' })
          break

        case 'email':
          result = EmailExporter.exportToEmail(dictionary, advancedOptions.email)
          const emailContent = result.htmlContent || result.textContent || ''
          blob = new Blob([emailContent], { type: result.htmlContent ? 'text/html' : 'text/plain' })
          break

        case 'pdf':
          result = PdfExporter.exportToPdf(dictionary, advancedOptions.pdf)
          blob = new Blob([JSON.stringify(result.content, null, 2)], { type: 'application/json' })
          break

        case 'postman':
          result = PostmanExporter.exportToPostman(dictionary, advancedOptions.postman)
          blob = new Blob([JSON.stringify(result.collection, null, 2)], { type: 'application/json' })
          break

        case 'sql':
          result = SqlExporter.exportToSql(dictionary, advancedOptions.sql)
          blob = new Blob([result.ddl], { type: 'text/plain' })
          break
          
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
      
      // Download the file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
      
      // Update state
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        lastExport: {
          format,
          filename: result.filename,
          timestamp: new Date().toISOString(),
          size: formatSize(blob.size)
        }
      }))
      
      // Show warnings if any (for CSV)
      if (result.warnings && result.warnings.length > 0) {
        alert(`Export completed with warnings:\n\n${result.warnings.join('\n')}`)
      }
      
      // Track export success
      trackExport(format, dictionary.events.length, true)
      
      // Auto-validate the export  
      if (format === 'csv' || format === 'markdown') {
        handleValidateExport(result.data, format as 'csv' | 'markdown')
      }
      
    } catch (error) {
      // Track export failure
      trackExport(format, dictionary.events.length, false)
      
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'Export failed'
      }))
    }
  }

  const handleBatchExport = async () => {
    setExportState(prev => ({ ...prev, isExporting: true, error: undefined }))
    
    try {
      const exports: Array<{ filename: string; data: string; type: string }> = []
      
      for (const format of selectedFormats) {
        let result: any
        let type: string
        
        switch (format) {
          case 'csv':
            result = ExportUtils.exportToCsv(dictionary, csvOptions)
            type = 'text/csv'
            break
            
          case 'markdown':
            result = ExportUtils.exportToMarkdown(dictionary)
            type = 'text/markdown'
            break
            
          case 'datadog':
            result = ExportUtils.exportToDatadog(dictionary)
            type = 'text/typescript'
            break
            
          case 'jira':
            result = ExportUtils.exportToJira(dictionary)
            type = 'text/plain'
            break

          case 'excel':
            result = await ExcelExporter.exportToExcel(dictionary, advancedOptions.excel)
            type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            break

          case 'json-schema':
            result = JsonSchemaExporter.exportToJsonSchema(dictionary, advancedOptions.jsonSchema)
            result.data = JSON.stringify(result.schema, null, 2)
            type = 'application/json'
            break

          case 'openapi':
            result = OpenApiExporter.exportToOpenApi(dictionary, advancedOptions.openapi)
            result.data = JSON.stringify(result.spec, null, 2)
            type = 'application/json'
            break

          case 'slack':
            result = SlackExporter.exportToSlack(dictionary, advancedOptions.slack)
            result.data = JSON.stringify(result.payload, null, 2)
            type = 'application/json'
            break

          case 'email':
            result = EmailExporter.exportToEmail(dictionary, advancedOptions.email)
            result.data = result.htmlContent || result.textContent || ''
            type = result.htmlContent ? 'text/html' : 'text/plain'
            break

          case 'pdf':
            result = PdfExporter.exportToPdf(dictionary, advancedOptions.pdf)
            result.data = JSON.stringify(result.content, null, 2)
            type = 'application/json'
            break

          case 'postman':
            result = PostmanExporter.exportToPostman(dictionary, advancedOptions.postman)
            result.data = JSON.stringify(result.collection, null, 2)
            type = 'application/json'
            break

          case 'sql':
            result = SqlExporter.exportToSql(dictionary, advancedOptions.sql)
            type = 'text/plain'
            break
        }
        
        exports.push({
          filename: result.filename,
          data: result.data,
          type
        })
      }
      
      // Create a zip-like experience by downloading all files
      for (const exportItem of exports) {
        const blob = new Blob([exportItem.data], { type: exportItem.type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = exportItem.filename
        a.click()
        URL.revokeObjectURL(url)
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        lastExport: {
          format: 'csv', // Just use first format for display
          filename: `${exports.length} files`,
          timestamp: new Date().toISOString(),
          size: 'Multiple files'
        }
      }))
      
    } catch (error) {
      setExportState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'Batch export failed'
      }))
    }
  }

  const handleFormatToggle = (format: ExportFormat) => {
    setSelectedFormats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(format)) {
        newSet.delete(format)
      } else {
        newSet.add(format)
      }
      return newSet
    })
  }

  const formatSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${Math.round(size * 10) / 10} ${units[unitIndex]}`
  }
  
  const handleValidateExport = async (exportData: string, format: 'csv' | 'markdown') => {
    setExportState(prev => ({ ...prev, isValidating: true, validationResult: undefined }))
    
    try {
      const validation = ExportValidator.validateExport(exportData, format)
      setExportState(prev => ({ ...prev, isValidating: false, validationResult: validation }))
    } catch (error) {
      setExportState(prev => ({
        ...prev,
        isValidating: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
    }
  }
  
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setExportState(prev => ({ ...prev, isImporting: true, importResult: undefined, error: undefined }))
    
    try {
      const text = await file.text()
      let importResult: ImportResult
      
      if (file.name.endsWith('.csv')) {
        importResult = ExportValidator.importFromCsv(text)
      } else if (file.name.endsWith('.json')) {
        importResult = ExportValidator.importFromJson(text)
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.')
      }
      
      setExportState(prev => ({ ...prev, isImporting: false, importResult }))
      
      if (importResult.success && importResult.dictionary) {
        // Show success and offer to load the imported data
        const shouldLoad = confirm(`Import successful! ${importResult.importedEventCount} events imported. Load into editor?`)
        if (shouldLoad) {
          // Save to localStorage and refresh
          localStorage.setItem('dataDictionary_events', JSON.stringify(importResult.events))
          window.location.reload()
        }
      }
      
    } catch (error) {
      setExportState(prev => ({
        ...prev,
        isImporting: false,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getFormatDescription = (format: ExportFormat): string => {
    switch (format) {
      case 'csv':
        return 'Structured data for Excel, databases, or data analysis tools'
      case 'markdown':
        return 'Human-readable documentation with tables and examples'
      case 'datadog':
        return 'TypeScript implementation stubs for Datadog RUM integration'
      case 'jira':
        return 'JIRA-ready ticket descriptions for implementation planning'
      case 'excel':
        return 'Multi-sheet Excel workbook with advanced formatting and validation'
      case 'json-schema':
        return 'JSON Schema definitions for API documentation and validation'
      case 'openapi':
        return 'OpenAPI 3.0 specification for REST API documentation'
      case 'slack':
        return 'Slack-formatted messages and webhook payloads'
      case 'email':
        return 'HTML and text email templates for stakeholder communication'
      case 'pdf':
        return 'Professional PDF reports with charts and detailed documentation'
      case 'postman':
        return 'Postman collections for API testing and development'
      case 'sql':
        return 'SQL DDL scripts for database schema creation'
      default:
        return ''
    }
  }

  const getFormatIcon = (format: ExportFormat): string => {
    switch (format) {
      case 'csv': return '📊'
      case 'markdown': return '📝'
      case 'datadog': return '🐕'
      case 'jira': return '🎫'
      case 'excel': return '📊'
      case 'json-schema': return '🔧'
      case 'openapi': return '🔌'
      case 'slack': return '💬'
      case 'email': return '📧'
      case 'pdf': return '📄'
      case 'postman': return '🚀'
      case 'sql': return '🗄️'
      default: return '📄'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Export Manager
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Export your data dictionary in multiple formats
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Dictionary Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Ready to Export
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {dictionary.events.length} events • Generated {new Date(dictionary.generatedAtIso).toLocaleDateString()}
          </p>
        </div>

        {/* Export Formats */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Export Formats
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['csv', 'markdown', 'datadog', 'jira', 'excel', 'json-schema', 'openapi', 'slack', 'email', 'pdf', 'postman', 'sql'] as ExportFormat[]).map((format) => (
              <div
                key={format}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedFormats.has(format)
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleFormatToggle(format)}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getFormatIcon(format)}</span>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase">
                        {format}
                      </h5>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {getFormatDescription(format)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <input
                      type="checkbox"
                      checked={selectedFormats.has(format)}
                      onChange={() => handleFormatToggle(format)}
                      className="rounded"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSingleExport(format)
                      }}
                      disabled={exportState.isExporting}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm disabled:opacity-50"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSV Options */}
        {selectedFormats.has('csv') && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              CSV Options
            </h4>
            
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Headers</span>
                <input
                  type="checkbox"
                  checked={csvOptions.includeHeaders}
                  onChange={(e) => setCsvOptions(prev => ({ ...prev, includeHeaders: e.target.checked }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Empty Columns</span>
                <input
                  type="checkbox"
                  checked={csvOptions.includeEmptyColumns}
                  onChange={(e) => setCsvOptions(prev => ({ ...prev, includeEmptyColumns: e.target.checked }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Validate Schema</span>
                <input
                  type="checkbox"
                  checked={csvOptions.validateSchema}
                  onChange={(e) => setCsvOptions(prev => ({ ...prev, validateSchema: e.target.checked }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Delimiter</span>
                <select
                  value={csvOptions.delimiter}
                  onChange={(e) => setCsvOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Export Options */}
        {(selectedFormats.has('excel') || selectedFormats.has('json-schema') || selectedFormats.has('openapi') || 
          selectedFormats.has('slack') || selectedFormats.has('email') || selectedFormats.has('pdf') || 
          selectedFormats.has('postman') || selectedFormats.has('sql')) && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Advanced Options
            </h4>
            
            {/* Excel Options */}
            {selectedFormats.has('excel') && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">📊 Excel Options</h5>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Include Metadata</span>
                    <input
                      type="checkbox"
                      checked={advancedOptions.excel.includeMetadata}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        excel: { ...prev.excel, includeMetadata: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Validation Sheet</span>
                    <input
                      type="checkbox"
                      checked={advancedOptions.excel.includeValidationSheet}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        excel: { ...prev.excel, includeValidationSheet: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* SQL Options */}
            {selectedFormats.has('sql') && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">🗃️ SQL Options</h5>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Database</span>
                    <select
                      value={advancedOptions.sql.dialect}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        sql: { ...prev.sql, dialect: e.target.value as any }
                      }))}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
                    >
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="sqlite">SQLite</option>
                      <option value="bigquery">BigQuery</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Include Indexes</span>
                    <input
                      type="checkbox"
                      checked={advancedOptions.sql.includeIndexes}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        sql: { ...prev.sql, includeIndexes: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Email Options */}
            {selectedFormats.has('email') && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">📧 Email Options</h5>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Format</span>
                    <select
                      value={advancedOptions.email.format}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        email: { ...prev.email, format: e.target.value as any }
                      }))}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
                    >
                      <option value="html">HTML</option>
                      <option value="text">Text</option>
                      <option value="both">Both</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Style</span>
                    <select
                      value={advancedOptions.email.templateStyle}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        email: { ...prev.email, templateStyle: e.target.value as any }
                      }))}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900"
                    >
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="technical">Technical</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* JSON Schema Options */}
            {selectedFormats.has('json-schema') && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">🔧 JSON Schema Options</h5>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Include Examples</span>
                    <input
                      type="checkbox"
                      checked={advancedOptions.jsonSchema.includeExamples}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        jsonSchema: { ...prev.jsonSchema, includeExamples: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Strict Mode</span>
                    <input
                      type="checkbox"
                      checked={advancedOptions.jsonSchema.strictMode}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        jsonSchema: { ...prev.jsonSchema, strictMode: e.target.checked }
                      }))}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Export Actions
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedFormats.size} format{selectedFormats.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleBatchExport}
              disabled={exportState.isExporting || selectedFormats.size === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {exportState.isExporting ? 'Exporting...' : `Export Selected (${selectedFormats.size})`}
            </button>
          </div>
        </div>
        
        {/* Import/Validation Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Import & Validation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={exportState.isImporting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 text-sm font-medium"
            >
              {exportState.isImporting ? 'Importing...' : '📥 Import CSV/JSON'}
            </button>
            
            <button
              onClick={() => setShowValidation(!showValidation)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
            >
              {showValidation ? '🔍 Hide Validation' : '🔍 Show Validation'}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        {/* Export Status */}
        {exportState.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <h5 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
              Error
            </h5>
            <p className="text-sm text-red-800 dark:text-red-200">
              {exportState.error}
            </p>
          </div>
        )}
        
        {/* Import Results */}
        {exportState.importResult && (
          <div className={`p-3 rounded-md border ${
            exportState.importResult.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <h5 className={`text-sm font-medium mb-1 ${
              exportState.importResult.success
                ? 'text-green-900 dark:text-green-100'
                : 'text-red-900 dark:text-red-100'
            }`}>
              {exportState.importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
            </h5>
            <div className={`text-sm space-y-1 ${
              exportState.importResult.success
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              <p>Format: {exportState.importResult.format.toUpperCase()}</p>
              <p>Events: {exportState.importResult.importedEventCount}/{exportState.importResult.originalEventCount} imported</p>
              {exportState.importResult.errors.length > 0 && (
                <div>
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside ml-2">
                    {exportState.importResult.errors.slice(0, 3).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {exportState.importResult.errors.length > 3 && (
                      <li>... and {exportState.importResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Validation Results */}
        {showValidation && exportState.validationResult && (
          <div className={`p-3 rounded-md border ${
            exportState.validationResult.isValid
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <h5 className={`text-sm font-medium mb-2 ${
              exportState.validationResult.isValid
                ? 'text-green-900 dark:text-green-100'
                : 'text-yellow-900 dark:text-yellow-100'
            }`}>
              {exportState.validationResult.isValid ? '✅ Export Valid' : '⚠️ Export Issues'}
            </h5>
            
            <div className={`text-sm space-y-2 ${
              exportState.validationResult.isValid
                ? 'text-green-800 dark:text-green-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Events:</p>
                  <p>{exportState.validationResult.validEventCount}/{exportState.validationResult.eventCount} valid</p>
                </div>
                <div>
                  <p className="font-medium">Format:</p>
                  <p>{exportState.validationResult.format.toUpperCase()}</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium">Schema Compliance:</p>
                <div className="ml-2 space-y-1">
                  <p>Required Fields: {exportState.validationResult.schemaCompliance.hasRequiredFields ? '✅' : '❌'}</p>
                  <p>Valid Naming: {exportState.validationResult.schemaCompliance.hasValidNaming ? '✅' : '❌'}</p>
                  <p>Valid Enums: {exportState.validationResult.schemaCompliance.hasValidEnums ? '✅' : '❌'}</p>
                  <p>CSV Compatible: {exportState.validationResult.schemaCompliance.csvCompatible ? '✅' : '❌'}</p>
                </div>
              </div>
              
              {exportState.validationResult.errors.length > 0 && (
                <div>
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside ml-2">
                    {exportState.validationResult.errors.slice(0, 3).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {exportState.validationResult.errors.length > 3 && (
                      <li>... and {exportState.validationResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {exportState.validationResult.warnings.length > 0 && (
                <div>
                  <p className="font-medium">Warnings:</p>
                  <ul className="list-disc list-inside ml-2">
                    {exportState.validationResult.warnings.slice(0, 3).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {exportState.validationResult.warnings.length > 3 && (
                      <li>... and {exportState.validationResult.warnings.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {exportState.lastExport && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <h5 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              ✅ Export Successful
            </h5>
            <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <p>Format: {exportState.lastExport.format.toUpperCase()}</p>
              <p>File: {exportState.lastExport.filename}</p>
              <p>Size: {exportState.lastExport.size}</p>
              <p>Time: {new Date(exportState.lastExport.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {/* Export Previews */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Export Previews
          </h4>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>📊 CSV:</span>
              <span>Section 7 schema with {dictionary.events.length} rows</span>
            </div>
            <div className="flex justify-between">
              <span>📝 Markdown:</span>
              <span>Documentation with TOC and examples</span>
            </div>
            <div className="flex justify-between">
              <span>🐕 Datadog:</span>
              <span>{dictionary.events.length} TypeScript functions</span>
            </div>
            <div className="flex justify-between">
              <span>🎫 JIRA:</span>
              <span>{dictionary.events.length} implementation tickets</span>
            </div>
            <div className="flex justify-between">
              <span>📊 Excel:</span>
              <span>Multi-sheet workbook with validation</span>
            </div>
            <div className="flex justify-between">
              <span>🔧 JSON Schema:</span>
              <span>API validation schemas</span>
            </div>
            <div className="flex justify-between">
              <span>🔌 OpenAPI:</span>
              <span>REST API specification</span>
            </div>
            <div className="flex justify-between">
              <span>💬 Slack:</span>
              <span>Team communication templates</span>
            </div>
            <div className="flex justify-between">
              <span>📧 Email:</span>
              <span>Stakeholder notification templates</span>
            </div>
            <div className="flex justify-between">
              <span>📄 PDF:</span>
              <span>Professional documentation report</span>
            </div>
            <div className="flex justify-between">
              <span>🚀 Postman:</span>
              <span>API testing collection</span>
            </div>
            <div className="flex justify-between">
              <span>🗄️ SQL:</span>
              <span>Database schema scripts</span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p><strong>Export:</strong> Download in CSV, Markdown, TypeScript, or JIRA formats</p>
          <p><strong>Import:</strong> Load existing CSV or JSON files to continue editing</p>
          <p><strong>Validation:</strong> Verify exports meet schema requirements</p>
          <p><strong>Re-export:</strong> Make changes and export again with validation</p>
        </div>
      </div>
    </div>
  )
}