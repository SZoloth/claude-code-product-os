/**
 * PDF file text extraction utilities using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface PDFExtractionResult {
  text: string
  metadata: {
    wordCount: number
    characterCount: number
    pageCount: number
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: string
  }
}

/**
 * Extracts text content from a PDF file
 */
export async function parsePDFFile(file: File): Promise<PDFExtractionResult> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    // Extract metadata
    const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }))
    
    let fullText = ''
    const pageTexts: string[] = []
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Combine text items from the page
        const pageText = textContent.items
          .map((item: any) => {
            // Handle different item types from PDF.js
            if ('str' in item) {
              return item.str
            }
            return ''
          })
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        pageTexts.push(pageText)
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError)
        pageTexts.push('') // Add empty string for failed pages
      }
    }
    
    // Combine all page texts
    fullText = pageTexts
      .filter(text => text.length > 0)
      .join('\n\n')
      .trim()
    
    // Calculate statistics
    const words = fullText.trim() ? fullText.trim().split(/\s+/) : []
    
    // Safely access metadata properties
    const info = metadata.info as any
    
    return {
      text: fullText,
      metadata: {
        wordCount: words.length,
        characterCount: fullText.length,
        pageCount: pdf.numPages,
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
        creator: info?.Creator || undefined,
        producer: info?.Producer || undefined,
        creationDate: info?.CreationDate || undefined
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse PDF file: ${error.message}`)
    }
    throw new Error('Failed to parse PDF file: Unknown error')
  }
}

/**
 * Validates that the file appears to be a valid PDF
 */
export function isValidPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * Checks if PDF.js is properly loaded and worker is available
 */
export function isPDFJSReady(): boolean {
  return typeof pdfjsLib !== 'undefined' && !!pdfjsLib.GlobalWorkerOptions.workerSrc
}