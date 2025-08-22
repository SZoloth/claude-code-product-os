/**
 * Comprehensive tests for FileDropzone component
 * Tests file upload, drag-and-drop functionality, validation, and accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FileDropzone from './FileDropzone'

// Mock the file validation utility
jest.mock('../lib/utils/fileValidation', () => ({
  validateFile: jest.fn(),
  getAllSupportedExtensions: jest.fn(() => ['.md', '.docx', '.pdf']),
  getSupportedTypesDescription: jest.fn(() => 'Markdown, Word, or PDF files'),
  formatFileSize: jest.fn((bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  })
}))

const { validateFile } = require('../lib/utils/fileValidation')

describe('FileDropzone', () => {
  const mockOnFileSelect = jest.fn()
  const mockOnError = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    validateFile.mockReturnValue({ isValid: true })
  })

  const defaultProps = {
    onFileSelect: mockOnFileSelect,
    onError: mockOnError
  }

  describe('Component Rendering', () => {
    it('renders file dropzone with default state', () => {
      render(<FileDropzone {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: 'File upload area' })).toBeInTheDocument()
      expect(screen.getByText('Drop your file here or click to browse')).toBeInTheDocument()
      expect(screen.getByText('Markdown, Word, or PDF files')).toBeInTheDocument()
      expect(screen.getByText('📁')).toBeInTheDocument()
    })

    it('displays file size limit information', () => {
      render(<FileDropzone {...defaultProps} />)
      
      expect(screen.getByText('Maximum file size: 10 MB')).toBeInTheDocument()
    })

    it('renders custom max size limit', () => {
      render(<FileDropzone {...defaultProps} maxSizeBytes={5 * 1024 * 1024} />)
      
      expect(screen.getByText('Maximum file size: 5 MB')).toBeInTheDocument()
    })

    it('displays supported file formats guidance', () => {
      render(<FileDropzone {...defaultProps} />)
      
      expect(screen.getByText('Supported formats:')).toBeInTheDocument()
      expect(screen.getByText(/Markdown \(\.md\)/)).toBeInTheDocument()
      expect(screen.getByText(/Word \(\.docx\)/)).toBeInTheDocument()
      expect(screen.getByText(/PDF \(\.pdf\)/)).toBeInTheDocument()
    })

    it('renders hidden file input with correct attributes', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const fileInput = screen.getByLabelText('File upload input')
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', '.md,.docx,.pdf')
      expect(fileInput).toHaveClass('hidden')
    })
  })

  describe('Disabled State', () => {
    it('renders disabled state correctly', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      expect(screen.getByText('File upload disabled')).toBeInTheDocument()
      expect(screen.getByText('🚫')).toBeInTheDocument()
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      expect(dropzone).toHaveClass('opacity-50', 'cursor-not-allowed')
      expect(dropzone).toHaveAttribute('tabIndex', '-1')
    })

    it('disables file input when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const fileInput = screen.getByLabelText('File upload input')
      expect(fileInput).toBeDisabled()
    })

    it('does not respond to clicks when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      fireEvent.click(dropzone)
      
      // Should not trigger file selection dialog
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })
  })

  describe('Click to Browse Functionality', () => {
    it('opens file dialog when clicking dropzone', () => {
      render(<FileDropzone {...defaultProps} />)
      
      // Mock the file input click method
      const fileInput = screen.getByLabelText('File upload input')
      const clickSpy = jest.spyOn(fileInput, 'click')
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      fireEvent.click(dropzone)
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('handles file selection through input change', async () => {
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      })
    })

    it('clears input value after file selection', async () => {
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input') as HTMLInputElement
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(fileInput.value).toBe('')
      })
    })
  })

  describe('Keyboard Accessibility', () => {
    it('opens file dialog on Enter key', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const fileInput = screen.getByLabelText('File upload input')
      const clickSpy = jest.spyOn(fileInput, 'click')
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      fireEvent.keyDown(dropzone, { key: 'Enter' })
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('opens file dialog on Space key', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const fileInput = screen.getByLabelText('File upload input')
      const clickSpy = jest.spyOn(fileInput, 'click')
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      fireEvent.keyDown(dropzone, { key: ' ' })
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('ignores other keys', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const fileInput = screen.getByLabelText('File upload input')
      const clickSpy = jest.spyOn(fileInput, 'click')
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      fireEvent.keyDown(dropzone, { key: 'Tab' })
      fireEvent.keyDown(dropzone, { key: 'Escape' })
      
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('does not respond to keys when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const fileInput = screen.getByLabelText('File upload input')
      const clickSpy = jest.spyOn(fileInput, 'click')
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      fireEvent.keyDown(dropzone, { key: 'Enter' })
      fireEvent.keyDown(dropzone, { key: ' ' })
      
      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('Drag and Drop Functionality', () => {
    const createDataTransfer = (files: File[]) => ({
      files,
      items: files.map(file => ({
        kind: 'file' as const,
        type: file.type,
        getAsFile: () => file
      })),
      types: ['Files']
    })

    it('handles dragover event and shows drag state', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      fireEvent.dragOver(dropzone, {
        dataTransfer: createDataTransfer([])
      })
      
      expect(screen.getByText('📎')).toBeInTheDocument()
      expect(dropzone).toHaveClass('border-blue-400', 'bg-blue-50')
    })

    it('handles dragleave event and removes drag state', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      // First enter drag state
      fireEvent.dragOver(dropzone, {
        dataTransfer: createDataTransfer([])
      })
      expect(screen.getByText('📎')).toBeInTheDocument()
      
      // Then leave
      fireEvent.dragLeave(dropzone)
      expect(screen.getByText('📁')).toBeInTheDocument()
      expect(dropzone).not.toHaveClass('border-blue-400', 'bg-blue-50')
    })

    it('handles drop event with valid file', async () => {
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      fireEvent.drop(dropzone, {
        dataTransfer: createDataTransfer([file])
      })
      
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      })
      
      // Should remove drag state after drop
      expect(screen.getByText('📁')).toBeInTheDocument()
    })

    it('rejects multiple files in drop', async () => {
      render(<FileDropzone {...defaultProps} />)
      
      const file1 = new File(['content1'], 'test1.md', { type: 'text/markdown' })
      const file2 = new File(['content2'], 'test2.md', { type: 'text/markdown' })
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      fireEvent.drop(dropzone, {
        dataTransfer: createDataTransfer([file1, file2])
      })
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Please upload only one file at a time')
      })
      
      expect(mockOnFileSelect).not.toHaveBeenCalled()
    })

    it('ignores drop when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      fireEvent.drop(dropzone, {
        dataTransfer: createDataTransfer([file])
      })
      
      expect(mockOnFileSelect).not.toHaveBeenCalled()
      expect(mockOnError).not.toHaveBeenCalled()
    })

    it('ignores dragover when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      fireEvent.dragOver(dropzone, {
        dataTransfer: createDataTransfer([])
      })
      
      // Should not show drag state
      expect(screen.getByText('🚫')).toBeInTheDocument()
      expect(dropzone).not.toHaveClass('border-blue-400')
    })
  })

  describe('File Validation', () => {
    it('calls validation and handles valid file', async () => {
      validateFile.mockReturnValue({ isValid: true })
      
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(validateFile).toHaveBeenCalledWith(file)
        expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      })
    })

    it('handles validation error', async () => {
      validateFile.mockReturnValue({ 
        isValid: false, 
        error: 'File too large' 
      })
      
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(validateFile).toHaveBeenCalledWith(file)
        expect(mockOnError).toHaveBeenCalledWith('File too large')
        expect(mockOnFileSelect).not.toHaveBeenCalled()
      })
    })

    it('handles validation error without specific message', async () => {
      validateFile.mockReturnValue({ 
        isValid: false 
      })
      
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Invalid file')
      })
    })
  })

  describe('Processing State', () => {
    it('processes files and shows completed state', async () => {
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      // File should be processed successfully
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      })
      
      // Should be back to normal state
      expect(screen.getByText('Drop your file here or click to browse')).toBeInTheDocument()
      expect(screen.getByText('📁')).toBeInTheDocument()
    })

    it('handles processing workflow correctly', async () => {
      render(<FileDropzone {...defaultProps} />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      // Initially should be in normal state
      expect(dropzone).not.toHaveClass('opacity-50', 'cursor-not-allowed')
      expect(dropzone).toHaveAttribute('tabIndex', '0')
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      // File should be processed
      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file)
      })
    })
  })

  describe('Error Handling', () => {
    it('handles processing errors', async () => {
      validateFile.mockImplementation(() => {
        throw new Error('Validation failed')
      })
      
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Validation failed')
      })
    })

    it('handles non-Error exceptions', async () => {
      validateFile.mockImplementation(() => {
        throw 'String error'
      })
      
      render(<FileDropzone {...defaultProps} />)
      
      const file = new File(['test content'], 'test.md', { type: 'text/markdown' })
      const fileInput = screen.getByLabelText('File upload input')
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })
      
      fireEvent.change(fileInput)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to process file')
      })
    })
  })

  describe('Accessibility Features', () => {
    it('has proper ARIA attributes', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      expect(dropzone).toHaveAttribute('role', 'button')
      expect(dropzone).toHaveAttribute('tabIndex', '0')
      
      const fileInput = screen.getByLabelText('File upload input')
      expect(fileInput).toHaveAttribute('aria-label', 'File upload input')
    })

    it('has proper tabIndex when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      expect(dropzone).toHaveAttribute('tabIndex', '-1')
    })

    it('marks status icon as decorative', () => {
      render(<FileDropzone {...defaultProps} />)
      
      // The emoji is inside a div with aria-hidden="true"
      const iconContainer = screen.getByText('📁').closest('[aria-hidden="true"]')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Visual States and Styling', () => {
    it('applies correct CSS classes in default state', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      expect(dropzone).toHaveClass(
        'border-2',
        'border-dashed',
        'rounded-lg',
        'p-8',
        'text-center',
        'transition-all',
        'border-gray-300',
        'bg-gray-50',
        'cursor-pointer'
      )
    })

    it('applies drag-over styling during drag', () => {
      render(<FileDropzone {...defaultProps} />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      
      fireEvent.dragOver(dropzone, {
        dataTransfer: { files: [] }
      })
      
      expect(dropzone).toHaveClass('border-blue-400', 'bg-blue-50')
    })

    it('applies disabled styling when disabled', () => {
      render(<FileDropzone {...defaultProps} disabled />)
      
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      expect(dropzone).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('has correct component structure', () => {
      render(<FileDropzone {...defaultProps} />)
      
      // Check that the main component structure exists
      expect(screen.getByRole('button', { name: 'File upload area' })).toBeInTheDocument()
      expect(screen.getByLabelText('File upload input')).toBeInTheDocument()
      
      // Check that the dropzone has the correct classes for styling
      const dropzone = screen.getByRole('button', { name: 'File upload area' })
      expect(dropzone).toHaveClass('relative', 'border-2', 'border-dashed', 'rounded-lg')
    })
  })
})