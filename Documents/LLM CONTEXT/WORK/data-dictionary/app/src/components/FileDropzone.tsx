/**
 * FileDropzone component - File upload with drag-and-drop support
 * Supports .md, .docx, and .pdf files with validation
 */

import { useState, useRef, useCallback } from 'react'
import { validateFile, getAllSupportedExtensions, getSupportedTypesDescription, formatFileSize } from '../lib/utils/fileValidation'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  onError: (error: string) => void
  disabled?: boolean
  maxSizeBytes?: number
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function FileDropzone({ 
  onFileSelect, 
  onError, 
  disabled = false, 
  maxSizeBytes = DEFAULT_MAX_SIZE 
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFileUpload = useCallback((file: File): string | null => {
    const result = validateFile(file)
    return result.isValid ? null : result.error || 'Invalid file'
  }, [])

  const processFile = useCallback(async (file: File) => {
    if (disabled || isProcessing) return

    setIsProcessing(true)
    
    try {
      const validationError = validateFileUpload(file)
      if (validationError) {
        onError(validationError)
        return
      }

      onFileSelect(file)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }, [disabled, isProcessing, validateFileUpload, onFileSelect, onError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isProcessing) {
      setIsDragOver(true)
    }
  }, [disabled, isProcessing])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled || isProcessing) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 1) {
      onError('Please upload only one file at a time')
      return
    }

    if (files.length === 1) {
      processFile(files[0])
    }
  }, [disabled, isProcessing, processFile, onError])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 1) {
      processFile(files[0])
    }
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFile])

  const openFileDialog = useCallback(() => {
    if (!disabled && !isProcessing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled, isProcessing])

  const getStatusText = () => {
    if (isProcessing) return 'Processing file...'
    if (disabled) return 'File upload disabled'
    return 'Drop your file here or click to browse'
  }

  const getStatusIcon = () => {
    if (isProcessing) return '⏳'
    if (disabled) return '🚫'
    if (isDragOver) return '📎'
    return '📁'
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={getAllSupportedExtensions().join(',')}
        onChange={handleFileSelect}
        disabled={disabled || isProcessing}
        aria-label="File upload input"
      />

      {/* Dropzone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
          }
          ${disabled || isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        role="button"
        tabIndex={disabled || isProcessing ? -1 : 0}
        aria-label="File upload area"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isProcessing) {
            e.preventDefault()
            openFileDialog()
          }
        }}
      >
        <div className="space-y-3">
          <div className="text-4xl" aria-hidden="true">
            {getStatusIcon()}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getStatusText()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getSupportedTypesDescription()}
            </p>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            Maximum file size: {formatFileSize(maxSizeBytes)}
          </div>
        </div>

        {/* Loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/75 dark:bg-gray-900/75 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Processing...
            </div>
          </div>
        )}
      </div>

      {/* File format guidance */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong>Supported formats:</strong></p>
        <ul className="list-disc list-inside pl-4 space-y-0.5">
          <li><strong>Markdown (.md):</strong> Plain text documents with formatting</li>
          <li><strong>Word (.docx):</strong> Microsoft Word documents</li>
          <li><strong>PDF (.pdf):</strong> Portable Document Format files</li>
        </ul>
      </div>
    </div>
  )
}