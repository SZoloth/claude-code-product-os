/**
 * Error handling utilities for file parsing operations
 */

export enum ParsingErrorCode {
  // File validation errors
  INVALID_FILE = 'INVALID_FILE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  
  // Parser-specific errors
  MARKDOWN_PARSE_ERROR = 'MARKDOWN_PARSE_ERROR',
  DOCX_PARSE_ERROR = 'DOCX_PARSE_ERROR',
  PDF_PARSE_ERROR = 'PDF_PARSE_ERROR',
  
  // Content processing errors
  PREPROCESSING_ERROR = 'PREPROCESSING_ERROR',
  SUMMARIZATION_ERROR = 'SUMMARIZATION_ERROR',
  CHUNKING_ERROR = 'CHUNKING_ERROR',
  
  // System errors
  MEMORY_ERROR = 'MEMORY_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ParsingError extends Error {
  code: ParsingErrorCode
  fileName?: string
  fileSize?: number
  details?: Record<string, any>
  recoverable: boolean
  userMessage: string
}

export class FileParsingError extends Error implements ParsingError {
  public readonly code: ParsingErrorCode
  public readonly fileName?: string
  public readonly fileSize?: number
  public readonly details?: Record<string, any>
  public readonly recoverable: boolean
  public readonly userMessage: string

  constructor(
    code: ParsingErrorCode,
    message: string,
    userMessage: string,
    options?: {
      fileName?: string
      fileSize?: number
      details?: Record<string, any>
      recoverable?: boolean
      cause?: Error
    }
  ) {
    super(message)
    this.name = 'FileParsingError'
    this.code = code
    this.fileName = options?.fileName
    this.fileSize = options?.fileSize
    this.details = options?.details
    this.recoverable = options?.recoverable ?? false
    this.userMessage = userMessage
    
    // Set the cause manually if provided
    if (options?.cause) {
      (this as any).cause = options.cause
    }
  }
}

/**
 * Creates a user-friendly error from a parsing error
 */
export function createUserFriendlyError(
  error: Error,
  fileName?: string,
  fileSize?: number
): ParsingError {
  // If it's already a ParsingError, return as-is
  if (error instanceof FileParsingError) {
    return error
  }

  // Map common error patterns to specific error codes
  const errorMessage = error.message.toLowerCase()
  
  if (errorMessage.includes('out of memory') || errorMessage.includes('memory')) {
    return new FileParsingError(
      ParsingErrorCode.MEMORY_ERROR,
      `Memory error while processing file: ${error.message}`,
      'File is too large to process. Please try a smaller file.',
      {
        fileName,
        fileSize,
        recoverable: true,
        cause: error
      }
    )
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return new FileParsingError(
      ParsingErrorCode.TIMEOUT_ERROR,
      `Timeout error while processing file: ${error.message}`,
      'File processing timed out. Please try again or use a smaller file.',
      {
        fileName,
        fileSize,
        recoverable: true,
        cause: error
      }
    )
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return new FileParsingError(
      ParsingErrorCode.NETWORK_ERROR,
      `Network error while processing file: ${error.message}`,
      'Network error occurred. Please check your connection and try again.',
      {
        fileName,
        fileSize,
        recoverable: true,
        cause: error
      }
    )
  }

  // Parser-specific error detection
  if (errorMessage.includes('pdf') || errorMessage.includes('pdfjs')) {
    return new FileParsingError(
      ParsingErrorCode.PDF_PARSE_ERROR,
      `PDF parsing error: ${error.message}`,
      'Unable to read PDF file. The file may be corrupted or password-protected.',
      {
        fileName,
        fileSize,
        recoverable: false,
        cause: error
      }
    )
  }

  if (errorMessage.includes('docx') || errorMessage.includes('mammoth')) {
    return new FileParsingError(
      ParsingErrorCode.DOCX_PARSE_ERROR,
      `DOCX parsing error: ${error.message}`,
      'Unable to read Word document. The file may be corrupted or in an unsupported format.',
      {
        fileName,
        fileSize,
        recoverable: false,
        cause: error
      }
    )
  }

  if (errorMessage.includes('markdown') || errorMessage.includes('md')) {
    return new FileParsingError(
      ParsingErrorCode.MARKDOWN_PARSE_ERROR,
      `Markdown parsing error: ${error.message}`,
      'Unable to read Markdown file. Please check the file format.',
      {
        fileName,
        fileSize,
        recoverable: false,
        cause: error
      }
    )
  }

  // Default unknown error
  return new FileParsingError(
    ParsingErrorCode.UNKNOWN_ERROR,
    `Unknown error while processing file: ${error.message}`,
    'An unexpected error occurred while processing the file. Please try again.',
    {
      fileName,
      fileSize,
      recoverable: true,
      cause: error
    }
  )
}

/**
 * Safely executes an async operation with timeout and error handling
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    timeoutMs?: number
    fileName?: string
    fileSize?: number
    operationType?: string
  } = {}
): Promise<T> {
  const { timeoutMs = 30000, fileName, fileSize, operationType = 'operation' } = options

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operationType} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    // Race between the operation and timeout
    const result = await Promise.race([operation(), timeoutPromise])
    return result
  } catch (error) {
    throw createUserFriendlyError(error as Error, fileName, fileSize)
  }
}

/**
 * Handles and logs parsing errors appropriately
 */
export function handleParsingError(error: ParsingError, context?: string): void {
  // Log the full error for debugging
  console.error(`Parsing error${context ? ` in ${context}` : ''}:`, {
    code: error.code,
    message: error.message,
    fileName: error.fileName,
    fileSize: error.fileSize,
    recoverable: error.recoverable,
    details: error.details,
    stack: error.stack
  })

  // Log user message separately for UI display
  console.warn(`User message: ${error.userMessage}`)
}

/**
 * Determines if an error is recoverable and suggests next steps
 */
export function getRecoveryAction(error: ParsingError): {
  canRetry: boolean
  suggestedAction: string
} {
  if (!error.recoverable) {
    return {
      canRetry: false,
      suggestedAction: 'Please try with a different file or check the file format.'
    }
  }

  switch (error.code) {
    case ParsingErrorCode.MEMORY_ERROR:
    case ParsingErrorCode.FILE_TOO_LARGE:
      return {
        canRetry: false,
        suggestedAction: 'Try using a smaller file or splitting the content into multiple files.'
      }

    case ParsingErrorCode.TIMEOUT_ERROR:
      return {
        canRetry: true,
        suggestedAction: 'The operation timed out. You can try again, or use a smaller file.'
      }

    case ParsingErrorCode.NETWORK_ERROR:
      return {
        canRetry: true,
        suggestedAction: 'Check your internet connection and try again.'
      }

    default:
      return {
        canRetry: true,
        suggestedAction: 'Please try again. If the problem persists, check your file format.'
      }
  }
}

/**
 * Validation for file content integrity after parsing
 */
export function validateParsedContent(
  content: string,
  fileName?: string
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []

  // Check if content is empty or too short
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      warnings: ['File appears to be empty or contains no readable text']
    }
  }

  if (content.length < 10) {
    warnings.push('File contains very little text content')
  }

  // Check for suspicious content patterns
  const suspiciousPatterns = [
    { pattern: /�{5,}/, warning: 'File may contain corrupted characters (encoding issues)' },
    { pattern: /(.)\1{100,}/, warning: 'File contains excessive repeated characters' },
    { pattern: /^[\s\n\r]+$/, warning: 'File contains only whitespace' }
  ]

  for (const { pattern, warning } of suspiciousPatterns) {
    if (pattern.test(content)) {
      warnings.push(warning)
    }
  }

  // Content length warnings
  if (content.length > 500000) {
    warnings.push('File is very large and may require chunking for optimal processing')
  }

  return {
    isValid: true,
    warnings
  }
}