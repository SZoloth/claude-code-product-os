/**
 * Markdown file text extraction utilities
 */

export interface MarkdownExtractionResult {
  text: string
  metadata: {
    wordCount: number
    characterCount: number
    lineCount: number
  }
}

/**
 * Extracts plain text from markdown content
 * Removes markdown formatting but preserves structure
 */
export function extractTextFromMarkdown(markdownContent: string): MarkdownExtractionResult {
  // Basic markdown to text conversion
  let text = markdownContent
    // Remove code blocks (```code```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](src)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Remove headers (# ## ###) but keep text
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic (**text** *text*) but keep text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove strikethrough ~~text~~
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove blockquotes > but keep text
    .replace(/^>\s+/gm, '')
    // Clean up list markers (- * +) but keep text
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Clean up numbered lists
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()

  const lines = text.split('\n').filter(line => line.trim().length > 0)
  const words = text.trim() ? text.trim().split(/\s+/) : []

  return {
    text,
    metadata: {
      wordCount: words.length,
      characterCount: text.length,
      lineCount: lines.length
    }
  }
}

/**
 * Reads a markdown file and extracts text
 */
export async function parseMarkdownFile(file: File): Promise<MarkdownExtractionResult> {
  try {
    const content = await file.text()
    return extractTextFromMarkdown(content)
  } catch (error) {
    throw new Error(`Failed to read markdown file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validates that the content appears to be valid markdown
 */
export function isValidMarkdown(content: string): boolean {
  // Basic validation - check for common markdown patterns
  const markdownPatterns = [
    /^#+\s+/m, // Headers
    /\*\*.*?\*\*/, // Bold
    /\*.*?\*/, // Italic
    /\[.*?\]\(.*?\)/, // Links
    /^[-*+]\s+/m, // Lists
    /```[\s\S]*?```/, // Code blocks
    /`.*?`/ // Inline code
  ]

  // If content has any markdown patterns, consider it valid
  // Also accept plain text as valid markdown
  return markdownPatterns.some(pattern => pattern.test(content)) || content.trim().length > 0
}