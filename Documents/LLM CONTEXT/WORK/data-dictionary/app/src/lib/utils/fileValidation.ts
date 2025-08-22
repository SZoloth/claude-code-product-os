/**
 * File validation utilities for upload handling
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
  errorCode?: FileValidationErrorCode
  fileType?: 'markdown' | 'docx' | 'pdf'
  warnings?: string[]
}

export enum FileValidationErrorCode {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  FILE_EMPTY = 'FILE_EMPTY',
  INVALID_FILE_NAME = 'INVALID_FILE_NAME',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  MIME_TYPE_MISMATCH = 'MIME_TYPE_MISMATCH',
  SECURITY_RISK = 'SECURITY_RISK'
}

export interface SupportedFileType {
  extensions: string[]
  mimeTypes: string[]
  displayName: string
}

export const SUPPORTED_FILE_TYPES: Record<string, SupportedFileType> = {
  markdown: {
    extensions: ['.md', '.markdown'],
    mimeTypes: ['text/markdown', 'text/x-markdown'],
    displayName: 'Markdown'
  },
  docx: {
    extensions: ['.docx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    displayName: 'Word Document'
  },
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    displayName: 'PDF Document'
  }
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validates a file for upload with comprehensive checks
 */
export function validateFile(file: File): FileValidationResult {
  const warnings: string[] = []
  
  // Check if file exists and has content
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided',
      errorCode: FileValidationErrorCode.FILE_EMPTY
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty',
      errorCode: FileValidationErrorCode.FILE_EMPTY
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      errorCode: FileValidationErrorCode.FILE_TOO_LARGE
    }
  }

  // Check for potentially dangerous file names
  const fileName = file.name
  if (isUnsafeFileName(fileName)) {
    return {
      isValid: false,
      error: 'File name contains potentially unsafe characters',
      errorCode: FileValidationErrorCode.SECURITY_RISK
    }
  }

  // Check file name length
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'File name is too long (maximum 255 characters)',
      errorCode: FileValidationErrorCode.INVALID_FILE_NAME
    }
  }

  // Determine file type from extension and MIME type
  const fileType = getFileType(fileName.toLowerCase(), file.type)

  if (!fileType) {
    const supportedExts = Object.values(SUPPORTED_FILE_TYPES)
      .flatMap(type => type.extensions)
      .join(', ')
    return {
      isValid: false,
      error: `File type not supported. Please upload: ${supportedExts}`,
      errorCode: FileValidationErrorCode.UNSUPPORTED_FILE_TYPE
    }
  }

  // Check for MIME type mismatch
  const expectedMimeTypes = SUPPORTED_FILE_TYPES[fileType].mimeTypes
  if (file.type && !expectedMimeTypes.includes(file.type)) {
    warnings.push(`File MIME type (${file.type}) doesn't match expected types for ${fileType} files`)
  }

  // Size warnings
  if (file.size > 5 * 1024 * 1024) { // 5MB warning
    warnings.push('Large file may take longer to process')
  }

  return {
    isValid: true,
    fileType,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Determines file type from filename and MIME type
 */
function getFileType(fileName: string, mimeType?: string): 'markdown' | 'docx' | 'pdf' | null {
  for (const [key, type] of Object.entries(SUPPORTED_FILE_TYPES)) {
    // Check by extension
    if (type.extensions.some(ext => fileName.endsWith(ext))) {
      return key as 'markdown' | 'docx' | 'pdf'
    }
    
    // Check by MIME type if available
    if (mimeType && type.mimeTypes.includes(mimeType)) {
      return key as 'markdown' | 'docx' | 'pdf'
    }
  }
  
  return null
}

/**
 * Gets a human-readable description of supported file types
 */
export function getSupportedTypesDescription(): string {
  return Object.values(SUPPORTED_FILE_TYPES)
    .map(type => `${type.displayName} (${type.extensions.join(', ')})`)
    .join(', ')
}

/**
 * Gets all supported file extensions as an array
 */
export function getAllSupportedExtensions(): string[] {
  return Object.values(SUPPORTED_FILE_TYPES)
    .flatMap(type => type.extensions)
}

/**
 * Checks if a filename contains potentially unsafe characters
 */
function isUnsafeFileName(fileName: string): boolean {
  // Check for null bytes, control characters, or suspicious patterns
  const unsafePatterns = [
    /[\x00-\x1f\x7f-\x9f]/, // Control characters
    /[<>:"|?*]/, // Windows forbidden characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i, // Windows reserved names
    /^\.$/, // Current directory
    /^\.\.$/, // Parent directory
    /\.\.[\\/]/, // Directory traversal (both / and \)
    /^\s/, // Starting with whitespace
    /\s$/, // Ending with whitespace
  ]
  
  return unsafePatterns.some(pattern => pattern.test(fileName))
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}