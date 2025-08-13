/**
 * Text preprocessing utilities
 * Normalizes whitespace, deduplicates headings, and detects document structure
 */

export interface DocumentStructure {
  headings: Array<{
    text: string
    level: number
    position: number
  }>
  sections: Array<{
    title?: string
    content: string
    startPosition: number
    endPosition: number
  }>
  lists: Array<{
    type: 'ordered' | 'unordered'
    items: string[]
    position: number
  }>
  codeBlocks: Array<{
    language?: string
    content: string
    position: number
  }>
  metadata: {
    estimatedReadingTime: number
    complexity: 'low' | 'medium' | 'high'
    primaryTopics: string[]
  }
}

export interface PreprocessingResult {
  cleanedText: string
  originalText: string
  structure: DocumentStructure
  statistics: {
    originalLength: number
    cleanedLength: number
    reductionPercentage: number
    wordCount: number
    sentenceCount: number
    paragraphCount: number
  }
  warnings: string[]
  summarization?: {
    wasSummarized: boolean
    originalLength: number
    summarizedLength: number
    summaryMethod: 'none' | 'chunked' | 'extracted'
    preservedSections: string[]
  }
}

/**
 * Main preprocessing function that cleans and analyzes text
 */
export function preprocessText(text: string, maxLength: number = 60000): PreprocessingResult {
  const originalText = text
  const warnings: string[] = []
  let summarization: PreprocessingResult['summarization']
  
  // Step 1: Basic normalization
  let cleanedText = normalizeWhitespace(text)
  
  // Step 2: Remove duplicated content
  cleanedText = deduplicateContent(cleanedText, warnings)
  
  // Step 3: Further text cleaning
  cleanedText = cleanText(cleanedText)
  
  // Step 4: Check if summarization is needed
  if (cleanedText.length > maxLength) {
    const originalLength = cleanedText.length
    const summarizationResult = summarizeText(cleanedText, maxLength, warnings)
    cleanedText = summarizationResult.text
    summarization = {
      wasSummarized: true,
      originalLength,
      summarizedLength: cleanedText.length,
      summaryMethod: summarizationResult.method,
      preservedSections: summarizationResult.preservedSections
    }
  } else {
    summarization = {
      wasSummarized: false,
      originalLength: cleanedText.length,
      summarizedLength: cleanedText.length,
      summaryMethod: 'none',
      preservedSections: []
    }
  }
  
  // Step 5: Detect structure from final processed text
  const structure = detectDocumentStructure(cleanedText)
  
  // Step 6: Calculate statistics
  const statistics = calculateStatistics(originalText, cleanedText)
  
  // Step 7: Add warnings for potential issues
  addProcessingWarnings(structure, statistics, warnings)
  
  return {
    cleanedText,
    originalText,
    structure,
    statistics,
    warnings,
    summarization
  }
}

/**
 * Summarizes text by extracting and preserving key sections
 */
function summarizeText(
  text: string, 
  maxLength: number, 
  warnings: string[]
): { 
  text: string
  method: 'chunked' | 'extracted' 
  preservedSections: string[]
} {
  const structure = detectDocumentStructure(text)
  
  // Strategy 1: Extract key sections (headings, code blocks, lists)
  if (structure.headings.length > 0 || structure.lists.length > 0 || structure.codeBlocks.length > 0) {
    const extractedSummary = extractKeySections(text, structure, maxLength, warnings)
    if (extractedSummary.text.length <= maxLength) {
      return {
        text: extractedSummary.text,
        method: 'extracted',
        preservedSections: extractedSummary.preservedSections
      }
    }
  }
  
  // Strategy 2: Chunked approach - take first meaningful chunks
  warnings.push(`Document too large (${text.length} chars), using chunked summarization`)
  const chunks = chunkTextForSummary(text, maxLength * 0.8) // Use 80% to leave room for key sections
  const preservedSections: string[] = []
  
  let summarizedText = ''
  let remainingLength = maxLength
  
  // Always preserve the beginning for context
  for (const chunk of chunks.slice(0, Math.min(3, chunks.length))) {
    if (chunk.length < remainingLength) {
      summarizedText += chunk + '\n\n'
      remainingLength -= chunk.length + 2
      preservedSections.push(`Chunk ${chunks.indexOf(chunk) + 1}`)
    } else {
      break
    }
  }
  
  // Try to preserve key structural elements if there's space
  if (remainingLength > 500 && structure.headings.length > 0) {
    const keyHeadings = structure.headings
      .filter(h => h.level <= 2)
      .slice(0, 5)
      .map(h => `# ${h.text}`)
      .join('\n')
    
    if (keyHeadings.length < remainingLength) {
      summarizedText += '\n\n## Key Topics:\n' + keyHeadings
      preservedSections.push('Key headings')
    }
  }
  
  return {
    text: summarizedText.trim(),
    method: 'chunked',
    preservedSections
  }
}

/**
 * Extracts key sections while preserving document structure
 */
function extractKeySections(
  text: string,
  structure: DocumentStructure,
  maxLength: number,
  warnings: string[]
): {
  text: string
  preservedSections: string[]
} {
  const preservedSections: string[] = []
  const sections: string[] = []
  let currentLength = 0
  
  // Priority 1: Headings and their immediate content (first paragraph)
  for (const section of structure.sections.slice(0, 10)) { // Limit to first 10 sections
    if (section.title) {
      const heading = `# ${section.title}\n`
      const contentPreview = section.content
        .split('\n\n')[0] // Take first paragraph
        .substring(0, 300) // Limit to 300 chars
      
      const sectionText = heading + contentPreview + '\n\n'
      
      if (currentLength + sectionText.length <= maxLength * 0.7) { // Use 70% for main content
        sections.push(sectionText)
        currentLength += sectionText.length
        preservedSections.push(section.title)
      }
    }
  }
  
  // Priority 2: Code blocks (often contain important technical details)
  const remainingLength = maxLength - currentLength
  let codeBlockLength = 0
  
  for (const codeBlock of structure.codeBlocks.slice(0, 5)) { // Limit to 5 code blocks
    const blockText = `\`\`\`${codeBlock.language || ''}\n${codeBlock.content}\n\`\`\`\n\n`
    if (codeBlockLength + blockText.length <= remainingLength * 0.2) { // Use 20% for code
      sections.push(blockText)
      codeBlockLength += blockText.length
      preservedSections.push(`Code block (${codeBlock.language || 'unknown'})`)
    }
  }
  
  // Priority 3: Important lists (bullet points, numbered lists)
  const listLength = remainingLength - codeBlockLength
  
  for (const list of structure.lists.slice(0, 3)) { // Limit to 3 lists
    const listText = list.items
      .slice(0, 10) // Max 10 items per list
      .map(item => `${list.type === 'ordered' ? '1.' : '-'} ${item}`)
      .join('\n') + '\n\n'
    
    if (listText.length <= listLength * 0.1) { // Use 10% for lists
      sections.push(listText)
      preservedSections.push(`${list.type} list`)
    }
  }
  
  const finalText = sections.join('')
  
  if (finalText.length > maxLength) {
    warnings.push('Key section extraction exceeded target length, truncating')
    return {
      text: finalText.substring(0, maxLength - 100) + '\n\n[...truncated]',
      preservedSections
    }
  }
  
  return {
    text: finalText,
    preservedSections
  }
}

/**
 * Chunks text for summarization purposes
 */
function chunkTextForSummary(text: string, maxChunkSize: number): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = paragraph + '\n\n'
    } else {
      currentChunk += paragraph + '\n\n'
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

/**
 * Normalizes whitespace throughout the document
 */
function normalizeWhitespace(text: string): string {
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines (4+ consecutive become 2)
    .replace(/\n{4,}/g, '\n\n')
    // Normalize spaces and tabs
    .replace(/[ \t]+/g, ' ')
    // Remove trailing whitespace from lines
    .replace(/[ \t]+$/gm, '')
    // Remove leading whitespace from lines (except indented content)
    .replace(/^[ \t]+/gm, (match) => {
      // Preserve indentation for code blocks or lists
      if (match.length > 4) return '    ' // Convert excessive indentation to 4 spaces
      return match
    })
    .trim()
}

/**
 * Detects document structure including headings, sections, lists, and code blocks
 */
function detectDocumentStructure(text: string): DocumentStructure {
  const headings: DocumentStructure['headings'] = []
  const sections: DocumentStructure['sections'] = []
  const lists: DocumentStructure['lists'] = []
  const codeBlocks: DocumentStructure['codeBlocks'] = []
  
  const lines = text.split('\n')
  let currentSection: { title?: string; content: string; startPosition: number; endPosition: number } = { content: '', startPosition: 0, endPosition: 0 }
  let inCodeBlock = false
  let codeBlockStart = -1
  let codeBlockLanguage = ''
  
  lines.forEach((line, lineIndex) => {
    const position = text.split('\n').slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0)
    
    // Detect headings (markdown style)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch && !inCodeBlock) {
      const level = headingMatch[1].length
      const headerText = headingMatch[2].trim()
      
      headings.push({
        text: headerText,
        level,
        position
      })
      
      // End current section and start new one
      if (currentSection.content.trim()) {
        currentSection.endPosition = position
        sections.push({ ...currentSection })
      }
      
      currentSection = {
        title: headerText,
        content: '',
        startPosition: position,
        endPosition: text.length
      }
      return
    }
    
    // Detect code blocks
    const codeBlockMatch = line.match(/^```(\w+)?/)
    if (codeBlockMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockStart = position
        codeBlockLanguage = codeBlockMatch[1] || ''
      } else {
        inCodeBlock = false
        const endPosition = position + line.length
        const codeContent = text.slice(codeBlockStart, endPosition)
          .replace(/^```\w*\n/, '')
          .replace(/\n```$/, '')
        
        codeBlocks.push({
          language: codeBlockLanguage || undefined,
          content: codeContent,
          position: codeBlockStart
        })
      }
      return
    }
    
    // Detect lists (only when not in code blocks)
    if (!inCodeBlock) {
      const unorderedListMatch = line.match(/^[\s]*[-*+]\s+(.+)$/)
      const orderedListMatch = line.match(/^[\s]*\d+\.\s+(.+)$/)
      
      if (unorderedListMatch || orderedListMatch) {
        const isOrdered = !!orderedListMatch
        const item = (unorderedListMatch || orderedListMatch)?.[1] || ''
        
        // Look for existing list (consecutive lines)
        const recentList = lists[lists.length - 1]
        if (recentList && lineIndex > 0 && 
            recentList.type === (isOrdered ? 'ordered' : 'unordered')) {
          // Check if previous line was also a list item
          const prevLine = lines[lineIndex - 1]
          if (prevLine.match(/^[\s]*[-*+]\s+/) || prevLine.match(/^[\s]*\d+\.\s+/)) {
            recentList.items.push(item)
          } else {
            lists.push({
              type: isOrdered ? 'ordered' : 'unordered',
              items: [item],
              position
            })
          }
        } else {
          lists.push({
            type: isOrdered ? 'ordered' : 'unordered',
            items: [item],
            position
          })
        }
      }
    }
    
    // Add to current section
    currentSection.content += line + '\n'
  })
  
  // Add final section
  if (currentSection.content.trim()) {
    currentSection.endPosition = text.length
    sections.push(currentSection)
  }
  
  // Analyze content for metadata
  const metadata = analyzeContentMetadata(text, headings, sections)
  
  return {
    headings,
    sections,
    lists,
    codeBlocks,
    metadata
  }
}

/**
 * Removes duplicated headings and content
 */
function deduplicateContent(text: string, warnings: string[]): string {
  const lines = text.split('\n')
  const seenHeadings = new Set<string>()
  const seenParagraphs = new Map<string, number>()
  const deduplicatedLines: string[] = []
  
  let duplicatedHeadings = 0
  let duplicatedParagraphs = 0
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip empty lines
    if (!trimmedLine) {
      deduplicatedLines.push(line)
      continue
    }
    
    // Check for duplicated headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const headingText = headingMatch[2].trim().toLowerCase()
      if (seenHeadings.has(headingText)) {
        duplicatedHeadings++
        continue // Skip duplicate heading
      }
      seenHeadings.add(headingText)
      deduplicatedLines.push(line)
      continue
    }
    
    // Check for duplicated paragraphs (only if substantial length)
    if (trimmedLine.length > 50) {
      const paragraphKey = trimmedLine.toLowerCase().slice(0, 100)
      const existingCount = seenParagraphs.get(paragraphKey) || 0
      
      if (existingCount >= 2) {
        duplicatedParagraphs++
        continue // Skip duplicate paragraph
      }
      
      seenParagraphs.set(paragraphKey, existingCount + 1)
    }
    
    deduplicatedLines.push(line)
  }
  
  // Add warnings
  if (duplicatedHeadings > 0) {
    warnings.push(`Removed ${duplicatedHeadings} duplicate headings`)
  }
  if (duplicatedParagraphs > 0) {
    warnings.push(`Removed ${duplicatedParagraphs} duplicate paragraphs`)
  }
  
  return deduplicatedLines.join('\n')
}

/**
 * Additional text cleaning for better LLM processing
 */
function cleanText(text: string): string {
  return text
    // Remove excessive punctuation
    .replace(/[.]{3,}/g, '...')
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    // Clean up common document artifacts
    .replace(/\[TOC\]/gi, '') // Table of contents markers
    .replace(/Page \d+ of \d+/gi, '') // Page numbers
    .replace(/Table of Contents/gi, '') // TOC headers
    // Remove URLs that are likely not content
    .replace(/https?:\/\/[^\s]+/g, (url) => {
      // Keep URLs that might be relevant content
      if (url.includes('example') || url.includes('api') || url.includes('docs')) {
        return url
      }
      return '[URL removed]'
    })
    // Clean up spacing around punctuation
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,.!?;:])\s+/g, '$1 ')
    // Final whitespace normalization
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Calculates various statistics about the text processing
 */
function calculateStatistics(original: string, cleaned: string) {
  const originalLength = original.length
  const cleanedLength = cleaned.length
  const reductionPercentage = originalLength > 0 
    ? Math.round(((originalLength - cleanedLength) / originalLength) * 100)
    : 0
  
  const words = cleaned.trim().split(/\s+/).filter(w => w.length > 0)
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0)
  
  return {
    originalLength,
    cleanedLength,
    reductionPercentage,
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length
  }
}

/**
 * Analyzes content to generate metadata
 */
function analyzeContentMetadata(
  text: string, 
  headings: DocumentStructure['headings'],
  sections: DocumentStructure['sections']
): DocumentStructure['metadata'] {
  const wordCount = text.trim().split(/\s+/).length
  const estimatedReadingTime = Math.ceil(wordCount / 200) // 200 words per minute
  
  // Determine complexity based on structure and content
  let complexity: 'low' | 'medium' | 'high' = 'low'
  if (headings.length > 10 || sections.length > 5 || wordCount > 2000) {
    complexity = 'medium'
  }
  if (headings.length > 20 || sections.length > 10 || wordCount > 5000) {
    complexity = 'high'
  }
  
  // Extract primary topics from headings
  const primaryTopics = headings
    .filter(h => h.level <= 2)
    .map(h => h.text)
    .slice(0, 5)
  
  return {
    estimatedReadingTime,
    complexity,
    primaryTopics
  }
}

/**
 * Adds warnings based on processing results
 */
function addProcessingWarnings(
  structure: DocumentStructure,
  statistics: any,
  warnings: string[]
) {
  // Warn about very long documents
  if (statistics.wordCount > 10000) {
    warnings.push('Document is very long and may need chunking for optimal LLM processing')
  }
  
  // Warn about lack of structure
  if (structure.headings.length === 0 && statistics.wordCount > 500) {
    warnings.push('Document lacks headings - structure detection may be limited')
  }
  
  // Warn about complex nesting
  const maxHeadingLevel = Math.max(...structure.headings.map(h => h.level), 0)
  if (maxHeadingLevel > 4) {
    warnings.push('Document has deep heading nesting - consider flattening structure')
  }
  
  // Warn about significant content reduction
  if (statistics.reductionPercentage > 20) {
    warnings.push(`Removed ${statistics.reductionPercentage}% of original content during cleanup`)
  }
}

/**
 * Utility function to check if text needs chunking
 */
export function needsChunking(text: string, maxChunkSize: number = 60000): boolean {
  return text.length > maxChunkSize
}

/**
 * Utility function to check if text needs summarization
 */
export function needsSummarization(text: string, maxLength: number = 60000): boolean {
  return text.length > maxLength
}

/**
 * Splits text into chunks while preserving structure
 */
export function chunkText(
  preprocessedResult: PreprocessingResult, 
  maxChunkSize: number = 60000
): Array<{
  text: string
  metadata: {
    chunkIndex: number
    totalChunks: number
    startPosition: number
    endPosition: number
    headings: string[]
  }
}> {
  const { cleanedText, structure } = preprocessedResult
  
  if (!needsChunking(cleanedText, maxChunkSize)) {
    return [{
      text: cleanedText,
      metadata: {
        chunkIndex: 0,
        totalChunks: 1,
        startPosition: 0,
        endPosition: cleanedText.length,
        headings: structure.headings.map(h => h.text)
      }
    }]
  }
  
  // Intelligent chunking based on document structure
  const chunks: any[] = []
  let currentChunk = ''
  let currentStart = 0
  let chunkHeadings: string[] = []
  
  for (const section of structure.sections) {
    const sectionText = section.content
    
    // If this single section is too large, split it within the section
    if (sectionText.length > maxChunkSize) {
      // Finalize current chunk if it has content
      if (currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            chunkIndex: chunks.length,
            totalChunks: -1,
            startPosition: currentStart,
            endPosition: currentStart + currentChunk.length,
            headings: [...chunkHeadings]
          }
        })
        currentStart += currentChunk.length
        currentChunk = ''
        chunkHeadings = []
      }
      
      // Split large section into smaller chunks
      const sectionChunks = sectionText.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || []
      for (const chunk of sectionChunks) {
        chunks.push({
          text: chunk.trim(),
          metadata: {
            chunkIndex: chunks.length,
            totalChunks: -1,
            startPosition: currentStart,
            endPosition: currentStart + chunk.length,
            headings: section.title ? [section.title] : []
          }
        })
        currentStart += chunk.length
      }
    } else if (currentChunk.length + sectionText.length > maxChunkSize && currentChunk.length > 0) {
      // Finalize current chunk and start new one
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          chunkIndex: chunks.length,
          totalChunks: -1,
          startPosition: currentStart,
          endPosition: currentStart + currentChunk.length,
          headings: [...chunkHeadings]
        }
      })
      
      currentStart += currentChunk.length
      currentChunk = sectionText + '\n\n'
      chunkHeadings = section.title ? [section.title] : []
    } else {
      // Add to current chunk
      currentChunk += sectionText + '\n\n'
      if (section.title) {
        chunkHeadings.push(section.title)
      }
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: {
        chunkIndex: chunks.length,
        totalChunks: -1,
        startPosition: currentStart,
        endPosition: currentStart + currentChunk.length,
        headings: [...chunkHeadings]
      }
    })
  }
  
  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length
  })
  
  return chunks
}