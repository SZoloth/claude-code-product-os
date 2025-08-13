/**
 * DOCX file text extraction utilities using Mammoth.js
 */

import * as mammoth from 'mammoth'

export interface DOCXExtractionResult {
  text: string
  html?: string
  metadata: {
    wordCount: number
    characterCount: number
    paragraphCount: number
  }
  warnings: string[]
}

/**
 * Extracts text content from a DOCX file
 */
export async function parseDOCXFile(file: File): Promise<DOCXExtractionResult> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Extract text using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    // Also extract HTML for potential future use
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer }).catch(() => ({ value: '', messages: [] }))
    
    const text = result.value.trim()
    const html = htmlResult.value
    
    // Calculate statistics
    const words = text.trim() ? text.trim().split(/\s+/) : []
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    
    // Collect warnings from both extractions
    const warnings = [
      ...result.messages.map(m => m.message),
      ...htmlResult.messages.map(m => m.message)
    ].filter((warning, index, arr) => arr.indexOf(warning) === index) // Remove duplicates
    
    return {
      text,
      html: html || undefined,
      metadata: {
        wordCount: words.length,
        characterCount: text.length,
        paragraphCount: paragraphs.length
      },
      warnings
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse DOCX file: ${error.message}`)
    }
    throw new Error('Failed to parse DOCX file: Unknown error')
  }
}

/**
 * Extracts text with basic formatting preserved (HTML)
 */
export async function parseDOCXToHTML(file: File): Promise<{ html: string; warnings: string[] }> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    
    const result = await mammoth.convertToHtml({ 
      arrayBuffer,
      convertImage: mammoth.images.ignoreAllImages // Ignore images for now
    })
    
    return {
      html: result.value,
      warnings: result.messages.map(m => m.message)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert DOCX to HTML: ${error.message}`)
    }
    throw new Error('Failed to convert DOCX to HTML: Unknown error')
  }
}

/**
 * Validates that the file appears to be a valid DOCX
 */
export function isValidDOCX(file: File): boolean {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  )
}

/**
 * Cleans extracted text by removing excessive whitespace
 */
export function cleanExtractedText(text: string): string {
  return text
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Normalize paragraph breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim()
}