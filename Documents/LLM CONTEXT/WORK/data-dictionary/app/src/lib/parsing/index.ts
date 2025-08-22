/**
 * Main file parsing coordinator
 * Handles routing to appropriate parsers based on file type
 */

import { validateFile } from '../utils/fileValidation'
import { parseMarkdownFile, type MarkdownExtractionResult } from './markdown'
import { parseDOCXFile, type DOCXExtractionResult } from './docx'
import { parsePDFFile, type PDFExtractionResult } from './pdf'
import { preprocessText, chunkText, needsChunking, type PreprocessingResult, type DocumentStructure } from './preprocess'
import { 
  safeAsyncOperation, 
  handleParsingError, 
  validateParsedContent, 
  createUserFriendlyError,
  ParsingErrorCode,
  FileParsingError,
  type ParsingError
} from '../utils/errorHandling'

export type FileExtractionResult = {
  text: string
  cleanedText: string
  fileType: 'markdown' | 'docx' | 'pdf'
  metadata: {
    wordCount: number
    characterCount: number
    originalFileName: string
    fileSize: number
  }
  preprocessing: PreprocessingResult
  structure: DocumentStructure
  warnings?: string[]
  additionalMetadata?: Record<string, any>
  needsChunking: boolean
}

/**
 * Main function to parse any supported file type to plain text
 */
export async function parseFile(file: File): Promise<FileExtractionResult> {
  try {
    // Validate file first
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new FileParsingError(
        validation.errorCode || ParsingErrorCode.INVALID_FILE,
        validation.error || 'Invalid file',
        validation.error || 'Invalid file',
        {
          fileName: file.name,
          fileSize: file.size,
          recoverable: false
        }
      )
    }

    const fileType = validation.fileType!
    const allWarnings = [...(validation.warnings || [])]

    // Parse file with timeout and error handling
    const result = await safeAsyncOperation(
      async () => {
        switch (fileType) {
          case 'markdown':
            return await parseMarkdownFile(file)
          case 'docx':
            return await parseDOCXFile(file)
          case 'pdf':
            return await parsePDFFile(file)
          default:
            throw new Error(`Unsupported file type: ${fileType}`)
        }
      },
      {
        timeoutMs: getParsingTimeout(file),
        fileName: file.name,
        fileSize: file.size,
        operationType: `${fileType.toUpperCase()} parsing`
      }
    )

    // Validate parsed content
    const contentValidation = validateParsedContent(result.text, file.name)
    if (!contentValidation.isValid) {
      throw new FileParsingError(
        ParsingErrorCode.INVALID_FILE,
        'File contains no readable text',
        'File appears to be empty or contains no readable text',
        {
          fileName: file.name,
          fileSize: file.size,
          recoverable: false
        }
      )
    }
    allWarnings.push(...contentValidation.warnings)

    // Apply preprocessing to the extracted text with error handling
    const preprocessingResult = await safeAsyncOperation(
      async () => preprocessText(result.text),
      {
        timeoutMs: 15000, // 15 seconds for preprocessing
        fileName: file.name,
        fileSize: file.size,
        operationType: 'text preprocessing'
      }
    )

    const requiresChunking = needsChunking(preprocessingResult.cleanedText)
    
    // Combine all warnings
    allWarnings.push(
      ...('warnings' in result ? result.warnings || [] : []),
      ...preprocessingResult.warnings
    )

    // Normalize the result format
    return {
      text: result.text, // Original extracted text
      cleanedText: preprocessingResult.cleanedText, // Preprocessed text
      fileType,
      metadata: {
        wordCount: preprocessingResult.statistics.wordCount,
        characterCount: preprocessingResult.statistics.cleanedLength,
        originalFileName: file.name,
        fileSize: file.size
      },
      preprocessing: preprocessingResult,
      structure: preprocessingResult.structure,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      additionalMetadata: {
        ...result.metadata,
        // Add preprocessing statistics
        originalLength: preprocessingResult.statistics.originalLength,
        reductionPercentage: preprocessingResult.statistics.reductionPercentage,
        estimatedReadingTime: preprocessingResult.structure.metadata.estimatedReadingTime,
        complexity: preprocessingResult.structure.metadata.complexity,
        // Add summarization info if available
        ...(preprocessingResult.summarization ? { summarization: preprocessingResult.summarization } : {}),
        // Add type-specific metadata
        ...(fileType === 'pdf' && 'pageCount' in result.metadata ? { pageCount: result.metadata.pageCount } : {}),
        ...(fileType === 'docx' && 'paragraphCount' in result.metadata ? { paragraphCount: result.metadata.paragraphCount } : {}),
        ...(fileType === 'markdown' && 'lineCount' in result.metadata ? { lineCount: result.metadata.lineCount } : {})
      },
      needsChunking: requiresChunking
    }
  } catch (error) {
    const parsingError = error instanceof FileParsingError 
      ? error 
      : createUserFriendlyError(error as Error, file.name, file.size)
    
    handleParsingError(parsingError, 'parseFile')
    throw parsingError
  }
}

/**
 * Checks if a file can be parsed (combines validation and parser availability)
 */
export function canParseFile(file: File): { canParse: boolean; reason?: string } {
  const validation = validateFile(file)
  if (!validation.isValid) {
    return { canParse: false, reason: validation.error }
  }

  // Could add additional checks here for parser availability
  // e.g., checking if PDF.js worker is loaded for PDF files

  return { canParse: true }
}

/**
 * Gets timeout for parsing operation based on file size and type
 */
function getParsingTimeout(file: File): number {
  const fileSizeMB = file.size / (1024 * 1024)
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
    return Math.max(5000, fileSizeMB * 1000) // 1s per MB for markdown, min 5s
  }
  
  if (fileName.endsWith('.docx')) {
    return Math.max(10000, fileSizeMB * 3000) // 3s per MB for DOCX, min 10s
  }
  
  if (fileName.endsWith('.pdf')) {
    return Math.max(15000, fileSizeMB * 5000) // 5s per MB for PDF, min 15s
  }

  return 10000 // Default 10 seconds
}

/**
 * Gets estimated processing time for a file (for UI feedback)
 */
export function getEstimatedProcessingTime(file: File): number {
  const fileSizeMB = file.size / (1024 * 1024)
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
    return Math.max(500, fileSizeMB * 200) // ~200ms per MB for markdown
  }
  
  if (fileName.endsWith('.docx')) {
    return Math.max(1000, fileSizeMB * 800) // ~800ms per MB for DOCX
  }
  
  if (fileName.endsWith('.pdf')) {
    return Math.max(2000, fileSizeMB * 1500) // ~1.5s per MB for PDF
  }

  return 1000 // Default 1 second
}

/**
 * Chunks a processed file result for large documents
 */
export function chunkFileResult(result: FileExtractionResult, maxChunkSize: number = 60000) {
  if (!result.needsChunking) {
    return [result]
  }
  
  const chunks = chunkText(result.preprocessing, maxChunkSize)
  
  return chunks.map((chunk, index) => ({
    ...result,
    text: chunk.text,
    cleanedText: chunk.text,
    metadata: {
      ...result.metadata,
      wordCount: chunk.text.trim().split(/\s+/).length,
      characterCount: chunk.text.length,
      chunkIndex: index,
      totalChunks: chunks.length
    },
    additionalMetadata: {
      ...result.additionalMetadata,
      ...chunk.metadata,
      isChunk: true
    },
    needsChunking: false
  }))
}

// Re-export types and individual parsers for direct use if needed
export type { MarkdownExtractionResult, DOCXExtractionResult, PDFExtractionResult, PreprocessingResult, DocumentStructure }
export { parseMarkdownFile, parseDOCXFile, parsePDFFile, preprocessText, chunkText, needsChunking }

// Re-export error handling types and utilities
export { FileParsingError, ParsingErrorCode, type ParsingError, getRecoveryAction } from '../utils/errorHandling'