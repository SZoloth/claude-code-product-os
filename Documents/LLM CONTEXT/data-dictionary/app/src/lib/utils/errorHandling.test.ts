import {
  FileParsingError,
  ParsingErrorCode,
  createUserFriendlyError,
  safeAsyncOperation,
  getRecoveryAction,
  validateParsedContent,
  handleParsingError
} from './errorHandling'

describe('errorHandling', () => {
  describe('FileParsingError', () => {
    it('should create error with required properties', () => {
      const error = new FileParsingError(
        ParsingErrorCode.PDF_PARSE_ERROR,
        'Technical error message',
        'User-friendly error message',
        {
          fileName: 'test.pdf',
          fileSize: 1000,
          recoverable: false
        }
      )

      expect(error.code).toBe(ParsingErrorCode.PDF_PARSE_ERROR)
      expect(error.message).toBe('Technical error message')
      expect(error.userMessage).toBe('User-friendly error message')
      expect(error.fileName).toBe('test.pdf')
      expect(error.fileSize).toBe(1000)
      expect(error.recoverable).toBe(false)
      expect(error.name).toBe('FileParsingError')
    })

    it('should set default recoverable to false', () => {
      const error = new FileParsingError(
        ParsingErrorCode.UNKNOWN_ERROR,
        'Message',
        'User message'
      )

      expect(error.recoverable).toBe(false)
    })
  })

  describe('createUserFriendlyError', () => {
    it('should return FileParsingError unchanged', () => {
      const originalError = new FileParsingError(
        ParsingErrorCode.PDF_PARSE_ERROR,
        'Original message',
        'Original user message'
      )

      const result = createUserFriendlyError(originalError)
      expect(result).toBe(originalError)
    })

    it('should detect memory errors', () => {
      const error = new Error('Out of memory while processing')
      const result = createUserFriendlyError(error, 'test.pdf', 1000)

      expect(result.code).toBe(ParsingErrorCode.MEMORY_ERROR)
      expect(result.recoverable).toBe(true)
      expect(result.userMessage).toContain('too large')
    })

    it('should detect timeout errors', () => {
      const error = new Error('Operation timed out after 30s')
      const result = createUserFriendlyError(error, 'test.pdf', 1000)

      expect(result.code).toBe(ParsingErrorCode.TIMEOUT_ERROR)
      expect(result.recoverable).toBe(true)
      expect(result.userMessage).toContain('timed out')
    })

    it('should detect network errors', () => {
      const error = new Error('Network request failed')
      const result = createUserFriendlyError(error, 'test.pdf', 1000)

      expect(result.code).toBe(ParsingErrorCode.NETWORK_ERROR)
      expect(result.recoverable).toBe(true)
      expect(result.userMessage).toContain('Network error')
    })

    it('should detect PDF parsing errors', () => {
      const error = new Error('PDF.js parsing failed')
      const result = createUserFriendlyError(error, 'test.pdf', 1000)

      expect(result.code).toBe(ParsingErrorCode.PDF_PARSE_ERROR)
      expect(result.recoverable).toBe(false)
      expect(result.userMessage).toContain('PDF file')
    })

    it('should detect DOCX parsing errors', () => {
      const error = new Error('Mammoth parsing error')
      const result = createUserFriendlyError(error, 'test.docx', 1000)

      expect(result.code).toBe(ParsingErrorCode.DOCX_PARSE_ERROR)
      expect(result.recoverable).toBe(false)
      expect(result.userMessage).toContain('Word document')
    })

    it('should detect Markdown parsing errors', () => {
      const error = new Error('Markdown syntax error')
      const result = createUserFriendlyError(error, 'test.md', 1000)

      expect(result.code).toBe(ParsingErrorCode.MARKDOWN_PARSE_ERROR)
      expect(result.recoverable).toBe(false)
      expect(result.userMessage).toContain('Markdown file')
    })

    it('should default to unknown error', () => {
      const error = new Error('Some random error')
      const result = createUserFriendlyError(error, 'test.txt', 1000)

      expect(result.code).toBe(ParsingErrorCode.UNKNOWN_ERROR)
      expect(result.recoverable).toBe(true)
      expect(result.userMessage).toContain('unexpected error')
    })
  })

  describe('safeAsyncOperation', () => {
    it('should execute successful operations', async () => {
      const operation = async () => 'success'
      const result = await safeAsyncOperation(operation)
      
      expect(result).toBe('success')
    })

    it('should timeout long operations', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'success'
      }

      await expect(
        safeAsyncOperation(operation, { timeoutMs: 50 })
      ).rejects.toThrow(FileParsingError)
    })

    it('should handle operation errors', async () => {
      const operation = async () => {
        throw new Error('Operation failed')
      }

      await expect(
        safeAsyncOperation(operation, { fileName: 'test.pdf' })
      ).rejects.toThrow(FileParsingError)
    })

    it('should include file context in errors', async () => {
      const operation = async () => {
        throw new Error('Operation failed')
      }

      try {
        await safeAsyncOperation(operation, {
          fileName: 'test.pdf',
          fileSize: 1000,
          operationType: 'PDF parsing'
        })
      } catch (error) {
        const parsingError = error as FileParsingError
        expect(parsingError.fileName).toBe('test.pdf')
        expect(parsingError.fileSize).toBe(1000)
      }
    })
  })

  describe('getRecoveryAction', () => {
    it('should suggest retry for recoverable errors', () => {
      const error = new FileParsingError(
        ParsingErrorCode.NETWORK_ERROR,
        'Network failed',
        'Network error',
        { recoverable: true }
      )

      const action = getRecoveryAction(error)
      expect(action.canRetry).toBe(true)
      expect(action.suggestedAction).toContain('try again')
    })

    it('should not suggest retry for non-recoverable errors', () => {
      const error = new FileParsingError(
        ParsingErrorCode.PDF_PARSE_ERROR,
        'PDF corrupted',
        'PDF error',
        { recoverable: false }
      )

      const action = getRecoveryAction(error)
      expect(action.canRetry).toBe(false)
      expect(action.suggestedAction).toContain('different file')
    })

    it('should suggest smaller file for memory errors', () => {
      const error = new FileParsingError(
        ParsingErrorCode.MEMORY_ERROR,
        'Out of memory',
        'Memory error',
        { recoverable: true }
      )

      const action = getRecoveryAction(error)
      expect(action.canRetry).toBe(false)
      expect(action.suggestedAction).toContain('smaller file')
    })

    it('should suggest network check for network errors', () => {
      const error = new FileParsingError(
        ParsingErrorCode.NETWORK_ERROR,
        'Network failed',
        'Network error',
        { recoverable: true }
      )

      const action = getRecoveryAction(error)
      expect(action.canRetry).toBe(true)
      expect(action.suggestedAction).toContain('internet connection')
    })
  })

  describe('validateParsedContent', () => {
    it('should accept valid content', () => {
      const content = 'This is a valid document with sufficient content.'
      const result = validateParsedContent(content)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toEqual([])
    })

    it('should reject empty content', () => {
      const result1 = validateParsedContent('')
      expect(result1.isValid).toBe(false)
      expect(result1.warnings[0]).toContain('empty')

      const result2 = validateParsedContent('   \n\n  ')
      expect(result2.isValid).toBe(false)
    })

    it('should warn about very short content', () => {
      const content = 'Short'
      const result = validateParsedContent(content)

      expect(result.isValid).toBe(true)
      expect(result.warnings[0]).toContain('very little text')
    })

    it('should detect corrupted characters', () => {
      const content = 'Text with ����� corrupted characters'
      const result = validateParsedContent(content)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('File may contain corrupted characters (encoding issues)')
    })

    it('should detect excessive repeated characters', () => {
      const content = 'Text with ' + 'a'.repeat(101) + ' repeated chars'
      const result = validateParsedContent(content)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('File contains excessive repeated characters')
    })

    it('should warn about very large content', () => {
      const content = 'a'.repeat(500001)
      const result = validateParsedContent(content)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('File is very large and may require chunking for optimal processing')
    })
  })

  describe('handleParsingError', () => {
    it('should log error details', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      const error = new FileParsingError(
        ParsingErrorCode.PDF_PARSE_ERROR,
        'PDF failed',
        'User message'
      )

      handleParsingError(error, 'test context')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Parsing error in test context:',
        expect.objectContaining({
          code: ParsingErrorCode.PDF_PARSE_ERROR,
          message: 'PDF failed'
        })
      )

      expect(warnSpy).toHaveBeenCalledWith('User message: User message')

      consoleSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })
})