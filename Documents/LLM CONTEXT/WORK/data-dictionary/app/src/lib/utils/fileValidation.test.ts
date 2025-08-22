import {
  validateFile,
  FileValidationErrorCode,
  MAX_FILE_SIZE,
  formatFileSize,
  getSupportedTypesDescription,
  getAllSupportedExtensions,
  type FileValidationResult
} from './fileValidation'

// Mock File class for testing
class MockFile implements File {
  name: string
  size: number
  type: string
  lastModified: number
  webkitRelativePath: string = ''

  constructor(name: string, size: number, type: string = '') {
    this.name = name
    this.size = size
    this.type = type
    this.lastModified = Date.now()
  }

  slice(): Blob {
    return new Blob()
  }

  stream(): ReadableStream {
    return new ReadableStream()
  }

  text(): Promise<string> {
    return Promise.resolve('')
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(0))
  }

  bytes(): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array(0))
  }
}

describe('fileValidation', () => {
  describe('validateFile', () => {
    it('should accept valid markdown files', () => {
      const file = new MockFile('test.md', 1000, 'text/markdown')
      const result = validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.fileType).toBe('markdown')
      expect(result.error).toBeUndefined()
    })

    it('should accept valid DOCX files', () => {
      const file = new MockFile('document.docx', 2000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      const result = validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.fileType).toBe('docx')
      expect(result.error).toBeUndefined()
    })

    it('should accept valid PDF files', () => {
      const file = new MockFile('document.pdf', 3000, 'application/pdf')
      const result = validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.fileType).toBe('pdf')
      expect(result.error).toBeUndefined()
    })

    it('should reject files that are too large', () => {
      const file = new MockFile('huge.pdf', MAX_FILE_SIZE + 1)
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.FILE_TOO_LARGE)
      expect(result.error).toContain('exceeds maximum allowed size')
    })

    it('should reject empty files', () => {
      const file = new MockFile('empty.md', 0)
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.FILE_EMPTY)
    })

    it('should reject null files', () => {
      const result = validateFile(null as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.FILE_EMPTY)
    })

    it('should reject unsupported file types', () => {
      const file = new MockFile('document.txt', 1000, 'text/plain')
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.UNSUPPORTED_FILE_TYPE)
      expect(result.error).toContain('File type not supported')
    })

    it('should reject files with unsafe names', () => {
      const file = new MockFile('..\\system32\\evil.md', 1000)
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.SECURITY_RISK)
    })

    it('should reject files with excessively long names', () => {
      const longName = 'a'.repeat(256) + '.md'
      const file = new MockFile(longName, 1000)
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.INVALID_FILE_NAME)
    })

    it('should warn about MIME type mismatches', () => {
      const file = new MockFile('test.md', 1000, 'application/octet-stream')
      const result = validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings?.[0]).toContain('MIME type')
    })

    it('should warn about large files', () => {
      const file = new MockFile('large.pdf', 6 * 1024 * 1024) // 6MB
      const result = validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings?.[0]).toContain('Large file')
    })

    it('should detect file types by extension when MIME type is missing', () => {
      const file = new MockFile('test.markdown', 1000, '')
      const result = validateFile(file)
      
      expect(result.isValid).toBe(true)
      expect(result.fileType).toBe('markdown')
    })

    it('should handle Windows reserved file names', () => {
      const file = new MockFile('CON.md', 1000)
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.SECURITY_RISK)
    })

    it('should reject files with control characters', () => {
      const file = new MockFile('test\x00file.md', 1000)
      const result = validateFile(file)
      
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe(FileValidationErrorCode.SECURITY_RISK)
    })

    it('should reject files starting or ending with whitespace', () => {
      const file1 = new MockFile(' test.md', 1000)
      const result1 = validateFile(file1)
      
      expect(result1.isValid).toBe(false)
      expect(result1.errorCode).toBe(FileValidationErrorCode.SECURITY_RISK)

      const file2 = new MockFile('test.md ', 1000)
      const result2 = validateFile(file2)
      
      expect(result2.isValid).toBe(false)
      expect(result2.errorCode).toBe(FileValidationErrorCode.SECURITY_RISK)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2621440)).toBe('2.5 MB')
    })
  })

  describe('getSupportedTypesDescription', () => {
    it('should return a readable description of supported types', () => {
      const description = getSupportedTypesDescription()
      expect(description).toContain('Markdown')
      expect(description).toContain('.md')
      expect(description).toContain('Word Document')
      expect(description).toContain('PDF Document')
    })
  })

  describe('getAllSupportedExtensions', () => {
    it('should return all supported file extensions', () => {
      const extensions = getAllSupportedExtensions()
      expect(extensions).toContain('.md')
      expect(extensions).toContain('.markdown')
      expect(extensions).toContain('.docx')
      expect(extensions).toContain('.pdf')
      expect(extensions.length).toBeGreaterThan(0)
    })
  })
})