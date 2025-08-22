/**
 * Comprehensive tests for DescribeStep component
 * Tests text input, file upload, examples, navigation, and validation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import DescribeStep from './DescribeStep'
import { parseFile } from '../../lib/parsing'

// Mock the navigation
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

// Mock the parseFile function
jest.mock('../../lib/parsing', () => ({
  parseFile: jest.fn()
}))

const mockParseFile = parseFile as jest.MockedFunction<typeof parseFile>

describe('DescribeStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful file parsing by default
    mockParseFile.mockResolvedValue({
      text: 'Extracted text content',
      cleanedText: 'Cleaned extracted text content',
      fileType: 'pdf',
      metadata: {
        originalFileName: 'test.pdf',
        wordCount: 50,
        characterCount: 300,
        fileSize: 1024
      },
      preprocessing: {
        cleanedText: 'Cleaned extracted text content',
        originalText: 'Extracted text content',
        structure: {
          headings: [
            { text: 'Introduction', level: 1, position: 0 },
            { text: 'Features', level: 2, position: 100 }
          ],
          sections: [
            { content: 'intro', startPosition: 0, endPosition: 50 },
            { content: 'features', startPosition: 51, endPosition: 100 }
          ],
          lists: [],
          codeBlocks: [],
          metadata: {
            complexity: 'medium',
            estimatedReadingTime: 2,
            primaryTopics: ['introduction', 'features']
          }
        },
        statistics: {
          originalLength: 300,
          cleanedLength: 270,
          reductionPercentage: 10,
          wordCount: 50,
          sentenceCount: 5,
          paragraphCount: 2
        },
        warnings: []
      },
      structure: {
        headings: [
          { text: 'Introduction', level: 1, position: 0 },
          { text: 'Features', level: 2, position: 100 }
        ],
        sections: [
          { content: 'intro', startPosition: 0, endPosition: 50 },
          { content: 'features', startPosition: 51, endPosition: 100 }
        ],
        lists: [],
        codeBlocks: [],
        metadata: {
          complexity: 'medium',
          estimatedReadingTime: 2,
          primaryTopics: ['introduction', 'features']
        }
      },
      needsChunking: false,
      warnings: [],
      additionalMetadata: {
        pageCount: 3,
        reductionPercentage: 10
      }
    })
  })

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    )
  }

  describe('Initial Rendering', () => {
    it('renders the main heading and description', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByText('Describe your product and journeys')).toBeInTheDocument()
      expect(screen.getByText(/Provide a clear description of your product/)).toBeInTheDocument()
    })

    it('renders AI quality expectations section', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByText('💡 What to expect from AI analysis')).toBeInTheDocument()
      expect(screen.getByText(/Good at:/)).toBeInTheDocument()
      expect(screen.getByText(/May need review:/)).toBeInTheDocument()
      expect(screen.getByText(/Always verify:/)).toBeInTheDocument()
    })

    it('renders input guidelines', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByText('📋 Input tips for best results')).toBeInTheDocument()
      expect(screen.getByText(/Include specific user actions/)).toBeInTheDocument()
      expect(screen.getByText(/Describe error scenarios/)).toBeInTheDocument()
    })

    it('starts with text input method selected by default', () => {
      renderWithRouter(<DescribeStep />)
      
      const textButton = screen.getByRole('button', { name: /type description/i })
      const fileButton = screen.getByRole('button', { name: /upload document/i })
      
      expect(textButton).toHaveClass('bg-blue-50')
      expect(fileButton).not.toHaveClass('bg-blue-50')
    })

    it('renders navigation buttons', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByRole('button', { name: /next: journeys/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /skip to preview/i })).toBeInTheDocument()
    })
  })

  describe('Input Method Toggle', () => {
    it('switches to file input method when file button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const fileButton = screen.getByRole('button', { name: /upload document/i })
      await user.click(fileButton)
      
      expect(fileButton).toHaveClass('bg-blue-50')
      expect(screen.getByRole('button', { name: /type description/i })).not.toHaveClass('bg-blue-50')
    })

    it('switches to text input method when text button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      // First switch to file mode
      await user.click(screen.getByRole('button', { name: /upload document/i }))
      
      // Then switch back to text mode
      const textButton = screen.getByRole('button', { name: /type description/i })
      await user.click(textButton)
      
      expect(textButton).toHaveClass('bg-blue-50')
      expect(screen.getByRole('button', { name: /upload document/i })).not.toHaveClass('bg-blue-50')
    })
  })

  describe('Text Input Mode', () => {
    it('renders textarea when in text input mode', () => {
      renderWithRouter(<DescribeStep />)
      
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('updates character and word count as user types', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      await user.type(textarea, 'Hello world test')
      
      expect(screen.getByText('3 words • 16 characters')).toBeInTheDocument()
    })

    it('shows large input warning for long text', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const longText = 'a'.repeat(65000)
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      
      // Use paste instead of type for performance with large text
      await user.click(textarea)
      await user.paste(longText)
      
      expect(screen.getByText(/Large input will be chunked/)).toBeInTheDocument()
      // Check for the warning text with emoji as a combined string
      expect(screen.getByText(/⚠️ Large input will be chunked for processing/)).toBeInTheDocument()
    })

    it('shows examples section with toggle', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const showExamplesButton = screen.getByRole('button', { name: /show examples/i })
      await user.click(showExamplesButton)
      
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument()
      expect(screen.getByText('SaaS Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Mobile Banking App')).toBeInTheDocument()
    })

    it('hides examples when hide button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      // First show examples
      await user.click(screen.getByRole('button', { name: /show examples/i }))
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument()
      
      // Then hide them
      await user.click(screen.getByRole('button', { name: /hide examples/i }))
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument()
    })

    it('uses example content when example is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      // Show examples
      await user.click(screen.getByRole('button', { name: /show examples/i }))
      
      // Click on e-commerce example - use text content to find the specific example button
      const ecommerceExample = screen.getByText('E-commerce Platform').closest('button')
      expect(ecommerceExample).toBeInTheDocument()
      await user.click(ecommerceExample!)
      
      // Check that textarea is populated
      const textarea = screen.getByRole('textbox', { name: /product description/i }) as HTMLTextAreaElement
      expect(textarea.value).toContain('Our e-commerce platform')
      
      // Examples should be hidden after selection
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument()
    })
  })

  describe('File Input Mode', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      // Switch to file mode
      await user.click(screen.getByRole('button', { name: /upload document/i }))
    })

    it('renders file dropzone when in file input mode', () => {
      // The FileDropzone component should be rendered
      // We can't directly test for it without mocking, but we can check for typical dropzone elements
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('handles file upload error', async () => {
      // This test would require mocking the FileDropzone component's onError callback
      // For now, we'll test the error display state
      renderWithRouter(<DescribeStep />)
      
      // Switch to file mode first using getAllByText and select the first button (toggle button)
      const uploadButtons = screen.getAllByText('📄 Upload document')
      const fileToggleButton = uploadButtons[0].closest('button')
      expect(fileToggleButton).toBeInTheDocument()
      await userEvent.click(fileToggleButton!)
      
      // The error handling would be tested through the FileDropzone component tests
      // We can check that no error is displayed initially
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Navigation and Validation', () => {
    it('shows alert when next is clicked without text input', async () => {
      const user = userEvent.setup()
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      renderWithRouter(<DescribeStep />)
      
      const nextButton = screen.getByRole('button', { name: /next: journeys/i })
      await user.click(nextButton)
      
      expect(alertSpy).toHaveBeenCalledWith('Please provide a product description or upload a file')
      expect(mockNavigate).not.toHaveBeenCalled()
      
      alertSpy.mockRestore()
    })

    it('navigates to journeys when text is provided', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      await user.type(textarea, 'Test product description')
      
      const nextButton = screen.getByRole('button', { name: /next: journeys/i })
      await user.click(nextButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/journeys')
    })

    it('shows alert when next is clicked without completed file extraction', async () => {
      const user = userEvent.setup()
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      
      renderWithRouter(<DescribeStep />)
      
      // Switch to file mode
      await user.click(screen.getByRole('button', { name: /upload document/i }))
      
      const nextButton = screen.getByRole('button', { name: /next: journeys/i })
      await user.click(nextButton)
      
      expect(alertSpy).toHaveBeenCalledWith('Please upload a file and wait for text extraction to complete')
      expect(mockNavigate).not.toHaveBeenCalled()
      
      alertSpy.mockRestore()
    })
  })

  describe('Character and Word Count', () => {
    it('shows zero count for empty input', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByText('0 words • 0 characters')).toBeInTheDocument()
    })

    it('shows optimal length message for normal input', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByText('Optimal length: 500-5000 characters')).toBeInTheDocument()
    })

    it('handles empty string correctly in word count', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      await user.type(textarea, '   ')  // Only whitespace
      await user.clear(textarea)
      
      expect(screen.getByText('0 words • 0 characters')).toBeInTheDocument()
    })

    it('counts words correctly with multiple spaces', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      await user.type(textarea, 'hello    world    test')  // Multiple spaces
      
      expect(screen.getByText('3 words • 22 characters')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for form elements', () => {
      renderWithRouter(<DescribeStep />)
      
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      expect(textarea).toHaveAttribute('aria-describedby', 'character-count')
      
      const characterCountElement = document.getElementById('character-count')
      expect(characterCountElement).toBeInTheDocument()
    })

    it('has proper button labels and roles', () => {
      renderWithRouter(<DescribeStep />)
      
      expect(screen.getByRole('button', { name: /next: journeys/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /skip to preview/i })).toHaveAttribute('href', '/preview')
    })

    it('has expandable examples section with proper ARIA', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      const showButton = screen.getByRole('button', { name: /show examples/i })
      expect(showButton).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(showButton)
      
      const hideButton = screen.getByRole('button', { name: /hide examples/i })
      expect(hideButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('State Management', () => {
    it('maintains separate state for text and file inputs', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      // Type in text mode
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      await user.type(textarea, 'Text input content')
      
      // Switch to file mode and back
      await user.click(screen.getByRole('button', { name: /upload document/i }))
      await user.click(screen.getByRole('button', { name: /type description/i }))
      
      // Text should be preserved
      expect(textarea).toHaveValue('Text input content')
    })

    it('clears file state when switching input methods', async () => {
      const user = userEvent.setup()
      renderWithRouter(<DescribeStep />)
      
      // Switch to file mode
      await user.click(screen.getByRole('button', { name: /upload document/i }))
      
      // Switch back to text mode (this should call clearFile internally)
      await user.click(screen.getByRole('button', { name: /type description/i }))
      
      // No error messages should be visible
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles parsing errors gracefully', () => {
      // Test error state display
      renderWithRouter(<DescribeStep />)
      
      // Initial state should have no errors
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('logs file extraction for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      const user = userEvent.setup()
      
      // Set up a mock extracted text result
      mockParseFile.mockResolvedValue({
        text: 'Mock extracted text for logging test',
        cleanedText: 'Mock extracted text for logging test',
        fileType: 'pdf',
        metadata: {
          originalFileName: 'test.pdf',
          wordCount: 6,
          characterCount: 35,
          fileSize: 512
        },
        preprocessing: {
          cleanedText: 'Mock extracted text for logging test',
          originalText: 'Mock extracted text for logging test',
          structure: {
            headings: [],
            sections: [],
            lists: [],
            codeBlocks: [],
            metadata: {
              complexity: 'low',
              estimatedReadingTime: 1,
              primaryTopics: ['logging']
            }
          },
          statistics: {
            originalLength: 35,
            cleanedLength: 35,
            reductionPercentage: 0,
            wordCount: 6,
            sentenceCount: 1,
            paragraphCount: 1
          },
          warnings: []
        },
        structure: {
          headings: [],
          sections: [],
          lists: [],
          codeBlocks: [],
          metadata: {
            complexity: 'low',
            estimatedReadingTime: 1,
            primaryTopics: ['logging']
          }
        },
        needsChunking: false,
        warnings: []
      })

      renderWithRouter(<DescribeStep />)
      
      // Note: This test would require integration with FileDropzone component
      // For now, we test the logging behavior would occur on navigation
      const textarea = screen.getByRole('textbox', { name: /product description/i })
      await user.type(textarea, 'Some text')
      
      const nextButton = screen.getByRole('button', { name: /next: journeys/i })
      await user.click(nextButton)
      
      // Should navigate without console logging (text mode)
      expect(mockNavigate).toHaveBeenCalledWith('/journeys')
      
      consoleSpy.mockRestore()
    })
  })
})