/**
 * ExportManager component - Handle all export functionality (CSV, Markdown, Datadog, JIRA)
 */

import { useState } from 'react'
import type { DataDictionary } from '../lib/schema/dataDictionary'
import type { ExportOptions } from '../lib/export/exportUtils'
import { ExportUtils } from '../lib/export/exportUtils'

interface ExportManagerProps {
  dictionary: DataDictionary
  onClose: () => void
  className?: string
}

type ExportFormat = 'csv' | 'markdown' | 'datadog' | 'jira'

interface ExportState {
  format: ExportFormat
  isExporting: boolean
  lastExport?: {
    format: ExportFormat
    filename: string
    timestamp: string
    size: string
  }
  error?: string
}

export default function ExportManager({ 
  dictionary, 
  onClose, 
  className = '' 
}: ExportManagerProps) {
  const [exportState, setExportState] = useState<ExportState>({
    format: 'csv',
    isExporting: false
  })
  
  const [csvOptions, setCsvOptions] = useState<ExportOptions>({
    includeHeaders: true,
    includeEmptyColumns: true,
    delimiter: ',',
    dateFormat: 'iso',
    validateSchema: true
  })

  const [selectedFormats, setSelectedFormats] = useState<Set<ExportFormat>>(new Set(['csv']))

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
      
    } catch (error) {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['csv', 'markdown', 'datadog', 'jira'] as ExportFormat[]).map((format) => (
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

        {/* Export Status */}
        {exportState.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <h5 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
              Export Error
            </h5>
            <p className="text-sm text-red-800 dark:text-red-200">
              {exportState.error}
            </p>
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
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p><strong>CSV:</strong> Import into Excel, Google Sheets, or data analysis tools</p>
          <p><strong>Markdown:</strong> Share as documentation or convert to PDF</p>
          <p><strong>Datadog:</strong> Copy functions into your TypeScript application</p>
          <p><strong>JIRA:</strong> Copy ticket descriptions for sprint planning</p>
        </div>
      </div>
    </div>
  )
}