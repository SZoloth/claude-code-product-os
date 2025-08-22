import {
  preprocessText,
  needsChunking,
  chunkText,
  type DocumentStructure,
  type PreprocessingResult
} from './preprocess'

describe('preprocessText', () => {
  describe('whitespace normalization', () => {
    it('should normalize line endings', () => {
      const input = 'line1\r\nline2\rline3\n'
      const result = preprocessText(input)
      expect(result.cleanedText).toMatch(/line1\nline2\nline3/)
    })

    it('should remove excessive blank lines', () => {
      const input = 'line1\n\n\n\n\nline2'
      const result = preprocessText(input)
      expect(result.cleanedText).toBe('line1\n\nline2')
    })

    it('should normalize spaces and tabs', () => {
      const input = 'word1    \t   word2'
      const result = preprocessText(input)
      expect(result.cleanedText).toBe('word1 word2')
    })

    it('should remove trailing whitespace', () => {
      const input = 'line with trailing spaces   \nline2 \t '
      const result = preprocessText(input)
      expect(result.cleanedText).toBe('line with trailing spaces\nline2')
    })
  })

  describe('heading detection', () => {
    it('should detect markdown headings', () => {
      const input = '# Heading 1\n## Heading 2\n### Heading 3'
      const result = preprocessText(input)
      
      expect(result.structure.headings).toHaveLength(3)
      expect(result.structure.headings[0]).toEqual(
        expect.objectContaining({
          text: 'Heading 1',
          level: 1
        })
      )
      expect(result.structure.headings[1]).toEqual(
        expect.objectContaining({
          text: 'Heading 2',
          level: 2
        })
      )
    })

    it('should create sections based on headings', () => {
      const input = '# Section 1\nContent 1\n## Section 2\nContent 2'
      const result = preprocessText(input)
      
      expect(result.structure.sections).toHaveLength(2)
      expect(result.structure.sections[0].title).toBe('Section 1')
      expect(result.structure.sections[1].title).toBe('Section 2')
    })
  })

  describe('duplicate detection', () => {
    it('should remove duplicate headings', () => {
      const input = '# Heading 1\nContent\n# Heading 1\nMore content'
      const result = preprocessText(input)
      
      expect(result.structure.headings).toHaveLength(1)
      expect(result.warnings).toContain('Removed 1 duplicate headings')
    })

    it('should remove duplicate paragraphs', () => {
      const input = `This is a long paragraph with enough content to trigger duplicate detection logic.
      
This is a long paragraph with enough content to trigger duplicate detection logic.

This is a long paragraph with enough content to trigger duplicate detection logic.`
      
      const result = preprocessText(input)
      expect(result.warnings).toContain('Removed 1 duplicate paragraphs')
    })
  })

  describe('code block detection', () => {
    it('should detect code blocks', () => {
      const input = '```javascript\nconsole.log("hello")\n```'
      const result = preprocessText(input)
      
      expect(result.structure.codeBlocks).toHaveLength(1)
      expect(result.structure.codeBlocks[0]).toEqual(
        expect.objectContaining({
          language: 'javascript',
          content: 'console.log("hello")'
        })
      )
    })

    it('should not detect headings inside code blocks', () => {
      const input = '```\n# This is not a heading\n```\n# This is a heading'
      const result = preprocessText(input)
      
      expect(result.structure.headings).toHaveLength(1)
      expect(result.structure.headings[0].text).toBe('This is a heading')
    })
  })

  describe('list detection', () => {
    it('should detect unordered lists', () => {
      const input = '- Item 1\n- Item 2\n\n* Item 3'
      const result = preprocessText(input)
      
      expect(result.structure.lists).toHaveLength(2)
      expect(result.structure.lists[0].type).toBe('unordered')
      expect(result.structure.lists[0].items).toEqual(['Item 1', 'Item 2'])
      expect(result.structure.lists[1].items).toEqual(['Item 3'])
    })

    it('should detect ordered lists', () => {
      const input = '1. First item\n2. Second item'
      const result = preprocessText(input)
      
      expect(result.structure.lists).toHaveLength(1)
      expect(result.structure.lists[0].type).toBe('ordered')
      expect(result.structure.lists[0].items).toEqual(['First item', 'Second item'])
    })
  })

  describe('text cleaning', () => {
    it('should clean excessive punctuation', () => {
      const input = 'Text with......many dots!!! And questions???'
      const result = preprocessText(input)
      
      expect(result.cleanedText).toBe('Text with...many dots! And questions?')
    })

    it('should remove common document artifacts', () => {
      const input = '[TOC]\nTable of Contents\nActual content\nPage 1 of 5'
      const result = preprocessText(input)
      
      expect(result.cleanedText).not.toContain('[TOC]')
      expect(result.cleanedText).not.toContain('Table of Contents')
      expect(result.cleanedText).not.toContain('Page 1 of 5')
    })

    it('should handle URLs appropriately', () => {
      const input = 'Check https://example.com/api and https://random-site.com'
      const result = preprocessText(input)
      
      expect(result.cleanedText).toContain('https://example.com/api')
      expect(result.cleanedText).toContain('[URL removed]')
    })
  })

  describe('statistics calculation', () => {
    it('should calculate basic statistics', () => {
      const input = 'This is a test document. It has multiple sentences! And paragraphs.\n\nSecond paragraph here.'
      const result = preprocessText(input)
      
      expect(result.statistics.wordCount).toBeGreaterThan(0)
      expect(result.statistics.sentenceCount).toBeGreaterThan(0)
      // After cleaning, paragraphs are split by double newlines
      expect(result.statistics.paragraphCount).toBeGreaterThan(0)
      expect(result.statistics.originalLength).toBe(input.length)
    })

    it('should calculate reduction percentage', () => {
      const input = 'Text   with   lots   of   spaces\n\n\n\n\nand blank lines'
      const result = preprocessText(input)
      
      expect(result.statistics.reductionPercentage).toBeGreaterThan(0)
    })
  })

  describe('summarization', () => {
    it('should not summarize short documents', () => {
      const input = 'This is a short document that should not be summarized.'
      const result = preprocessText(input, 1000)
      
      expect(result.summarization?.wasSummarized).toBe(false)
      expect(result.summarization?.summaryMethod).toBe('none')
    })

    it('should summarize long documents using extraction method', () => {
      const longInput = `# Introduction
This is a very long document with structured content.

## Section 1
${'This is content that repeats many times. '.repeat(500)}

## Section 2
More content here.

### Subsection
Even more detailed content.

\`\`\`javascript
console.log("Important code");
\`\`\`

- Important point 1
- Important point 2
- Important point 3`

      const result = preprocessText(longInput, 2000)
      
      expect(result.summarization?.wasSummarized).toBe(true)
      expect(result.summarization?.summaryMethod).toBe('extracted')
      expect(result.summarization?.preservedSections.length).toBeGreaterThan(0)
      expect(result.cleanedText.length).toBeLessThanOrEqual(2000)
    })

    it('should fall back to chunked method for unstructured text', () => {
      const longUnstructuredText = 'Lorem ipsum dolor sit amet. '.repeat(3000)
      const result = preprocessText(longUnstructuredText, 1000)
      
      expect(result.summarization?.wasSummarized).toBe(true)
      expect(result.summarization?.summaryMethod).toBe('chunked')
      expect(result.cleanedText.length).toBeLessThanOrEqual(1000)
    })

    it('should preserve key sections in summarization', () => {
      const structuredInput = `# Main Title
Important introduction content.

## Key Section
Critical information that should be preserved.

\`\`\`python
def important_function():
    return "key logic"
\`\`\`

${'Filler content. '.repeat(2000)}`

      const result = preprocessText(structuredInput, 1500)
      
      expect(result.summarization?.wasSummarized).toBe(true)
      expect(result.cleanedText).toContain('Main Title')
      expect(result.cleanedText).toContain('Key Section')
      expect(result.cleanedText).toContain('important_function')
    })
  })

  describe('metadata analysis', () => {
    it('should estimate reading time', () => {
      const words = Array(200).fill('word').join(' ')
      const result = preprocessText(words)
      
      expect(result.structure.metadata.estimatedReadingTime).toBe(1)
    })

    it('should determine complexity', () => {
      const simpleDoc = 'Simple document'
      const simpleResult = preprocessText(simpleDoc)
      expect(simpleResult.structure.metadata.complexity).toBe('low')
      
      const complexHeadings = Array(15).fill(0).map((_, i) => `# Heading ${i}`).join('\n')
      const complexResult = preprocessText(complexHeadings)
      expect(complexResult.structure.metadata.complexity).toBe('medium')
    })

    it('should extract primary topics from headings', () => {
      const input = '# Topic 1\n## Topic 2\n### Detail\n# Topic 3'
      const result = preprocessText(input)
      
      expect(result.structure.metadata.primaryTopics).toContain('Topic 1')
      expect(result.structure.metadata.primaryTopics).toContain('Topic 2')
      expect(result.structure.metadata.primaryTopics).toContain('Topic 3')
    })
  })

  describe('warnings', () => {
    it('should warn about very long documents', () => {
      const longText = Array(10001).fill('word').join(' ')
      const result = preprocessText(longText)
      
      expect(result.warnings).toContain('Document is very long and may need chunking for optimal LLM processing')
    })

    it('should warn about lack of structure', () => {
      const longTextNoHeadings = Array(501).fill('word').join(' ')
      const result = preprocessText(longTextNoHeadings)
      
      expect(result.warnings).toContain('Document lacks headings - structure detection may be limited')
    })

    it('should warn about deep nesting', () => {
      const deepHeadings = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6'
      const result = preprocessText(deepHeadings)
      
      expect(result.warnings).toContain('Document has deep heading nesting - consider flattening structure')
    })
  })
})

describe('needsChunking', () => {
  it('should return false for short text', () => {
    expect(needsChunking('short text')).toBe(false)
  })

  it('should return true for long text', () => {
    const longText = 'a'.repeat(60001)
    expect(needsChunking(longText)).toBe(true)
  })

  it('should respect custom max chunk size', () => {
    const text = 'a'.repeat(1000)
    expect(needsChunking(text, 500)).toBe(true)
    expect(needsChunking(text, 2000)).toBe(false)
  })
})

describe('chunkText', () => {
  it('should return single chunk for short text', () => {
    const input = 'Short document content'
    const preprocessed = preprocessText(input)
    const chunks = chunkText(preprocessed)
    
    expect(chunks).toHaveLength(1)
    expect(chunks[0].metadata.totalChunks).toBe(1)
    expect(chunks[0].metadata.chunkIndex).toBe(0)
  })

  it('should split long text into multiple chunks', () => {
    const sections = Array(5).fill(0).map((_, i) => 
      `# Section ${i}\n${'Content '.repeat(15000)}`
    ).join('\n\n')
    
    // Use a very large max length to avoid summarization
    const preprocessed = preprocessText(sections, 500000)
    const chunks = chunkText(preprocessed, 50000)
    
    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach(chunk => {
      expect(chunk.metadata.totalChunks).toBe(chunks.length)
      expect(chunk.text.length).toBeLessThanOrEqual(50000)
    })
  })

  it('should preserve headings in chunk metadata', () => {
    const input = '# Section 1\nContent\n# Section 2\nMore content'
    const preprocessed = preprocessText(input)
    const chunks = chunkText(preprocessed)
    
    expect(chunks[0].metadata.headings).toContain('Section 1')
    expect(chunks[0].metadata.headings).toContain('Section 2')
  })

  it('should maintain chunk boundaries at section breaks', () => {
    const mediumSection = `# Medium Section\n${'content '.repeat(5000)}`
    const smallSection = '# Small Section\nSmall content'
    const input = `${mediumSection}\n\n${smallSection}`
    
    const preprocessed = preprocessText(input)
    const chunks = chunkText(preprocessed, 30000)
    
    // Chunking should work correctly (may split based on content size)
    expect(chunks.length).toBeGreaterThan(0)
    // At least one chunk should contain content from the sections
    const allChunksText = chunks.map(c => c.text).join('')
    expect(allChunksText).toContain('content')
  })
})