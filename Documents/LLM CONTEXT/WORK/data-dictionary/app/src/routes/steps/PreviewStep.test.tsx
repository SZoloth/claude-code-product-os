/**
 * Comprehensive tests for PreviewStep component
 * Tests rendering, navigation, and UI elements
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import PreviewStep from './PreviewStep'

// Mock the navigation
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('PreviewStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      renderWithRouter(<PreviewStep />)
      
      expect(screen.getByText('Preview AI-Generated Events')).toBeInTheDocument()
      expect(screen.getByText(/The AI will analyze your input/)).toBeInTheDocument()
    })

    it('renders review guidelines section', () => {
      renderWithRouter(<PreviewStep />)
      
      expect(screen.getByText('🔍 Review Guidelines')).toBeInTheDocument()
      expect(screen.getByText(/Check event names:/)).toBeInTheDocument()
      expect(screen.getByText(/Verify properties:/)).toBeInTheDocument()
      expect(screen.getByText(/Validate business logic:/)).toBeInTheDocument()
      expect(screen.getByText(/Time estimate:/)).toBeInTheDocument()
    })

    it('shows proper background colors for guidelines section', () => {
      renderWithRouter(<PreviewStep />)
      
      const guidelinesSection = screen.getByText('🔍 Review Guidelines').closest('div')
      expect(guidelinesSection).toHaveClass('bg-amber-50', 'border-amber-200')
    })
  })

  describe('AI Processing Placeholder', () => {
    it('renders AI processing placeholder section', () => {
      renderWithRouter(<PreviewStep />)
      
      expect(screen.getByText('🤖 AI Processing')).toBeInTheDocument()
      expect(screen.getByText('LLM analysis will appear here when implemented')).toBeInTheDocument()
      expect(screen.getByText('Coming in Task 3.x - LLM transformation')).toBeInTheDocument()
    })

    it('shows dashed border styling for placeholder', () => {
      renderWithRouter(<PreviewStep />)
      
      // Find the container div with the dashed border styling
      const containers = document.querySelectorAll('.border-dashed')
      const placeholder = containers[0] as HTMLElement
      expect(placeholder).toHaveClass('border-2', 'border-dashed', 'border-gray-300')
    })

    it('centers the placeholder content', () => {
      renderWithRouter(<PreviewStep />)
      
      // Find the container div with text-center class
      const containers = document.querySelectorAll('.text-center')
      const placeholder = containers[0] as HTMLElement
      expect(placeholder).toHaveClass('text-center')
    })
  })

  describe('Navigation', () => {
    it('renders Next: Edit button', () => {
      renderWithRouter(<PreviewStep />)
      
      const nextButton = screen.getByRole('button', { name: /next: edit/i })
      expect(nextButton).toBeInTheDocument()
      expect(nextButton).toHaveClass('bg-gray-900', 'text-white')
    })

    it('renders Back link to journeys', () => {
      renderWithRouter(<PreviewStep />)
      
      const backLink = screen.getByRole('link', { name: /back/i })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/journeys')
      expect(backLink).toHaveClass('underline')
    })

    it('navigates to edit step when Next button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<PreviewStep />)
      
      const nextButton = screen.getByRole('button', { name: /next: edit/i })
      await user.click(nextButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/edit')
    })
  })

  describe('Component Structure', () => {
    it('has proper spacing between sections', () => {
      renderWithRouter(<PreviewStep />)
      
      // Find the root container with space-y-6 class  
      const containers = document.querySelectorAll('.space-y-6')
      const mainContainer = containers[0] as HTMLElement
      expect(mainContainer).toHaveClass('space-y-6')
    })

    it('has proper gap between navigation buttons', () => {
      renderWithRouter(<PreviewStep />)
      
      const buttonContainer = screen.getByRole('button', { name: /next: edit/i }).closest('div')
      expect(buttonContainer).toHaveClass('flex', 'items-center', 'gap-3')
    })
  })

  describe('Content Structure', () => {
    it('displays review guidelines with proper structure', () => {
      renderWithRouter(<PreviewStep />)
      
      // Check for structured content in guidelines
      expect(screen.getByText(/Should be clear, snake_case/)).toBeInTheDocument()
      expect(screen.getByText(/Ensure all important context is captured/)).toBeInTheDocument()
      expect(screen.getByText(/AI may miss domain-specific rules/)).toBeInTheDocument()
      expect(screen.getByText(/First-time review typically takes 10-15 minutes/)).toBeInTheDocument()
    })

    it('uses proper text styling for different content types', () => {
      renderWithRouter(<PreviewStep />)
      
      const heading = screen.getByText('Preview AI-Generated Events')
      expect(heading).toHaveClass('text-xl', 'font-semibold')
      
      const description = screen.getByText(/The AI will analyze your input/)
      expect(description).toHaveClass('text-sm', 'text-gray-600')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<PreviewStep />)
      
      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveTextContent('Preview AI-Generated Events')
      
      const guidelinesHeading = screen.getByRole('heading', { level: 3 })
      expect(guidelinesHeading).toHaveTextContent('🔍 Review Guidelines')
    })

    it('has accessible button and link text', () => {
      renderWithRouter(<PreviewStep />)
      
      expect(screen.getByRole('button')).toHaveAccessibleName('Next: Edit')
      expect(screen.getByRole('link')).toHaveAccessibleName('Back')
    })

    it('has proper text colors for dark mode support', () => {
      renderWithRouter(<PreviewStep />)
      
      const description = screen.getByText(/The AI will analyze your input/)
      expect(description).toHaveClass('dark:text-gray-400')
    })
  })

  describe('Visual Design', () => {
    it('applies proper padding and border radius', () => {
      renderWithRouter(<PreviewStep />)
      
      const guidelinesSection = screen.getByText('🔍 Review Guidelines').closest('div')
      expect(guidelinesSection).toHaveClass('rounded-md', 'p-4')
      
      // Find container with rounded-lg class
      const roundedContainers = document.querySelectorAll('.rounded-lg')
      const placeholder = roundedContainers[0] as HTMLElement
      expect(placeholder).toHaveClass('rounded-lg', 'p-8')
    })

    it('uses consistent spacing for text elements', () => {
      renderWithRouter(<PreviewStep />)
      
      const guidelinesContent = screen.getByText(/Check event names:/).closest('div')
      expect(guidelinesContent).toHaveClass('space-y-1')
    })
  })

  describe('Future Integration Points', () => {
    it('includes placeholder text indicating future LLM integration', () => {
      renderWithRouter(<PreviewStep />)
      
      expect(screen.getByText('Coming in Task 3.x - LLM transformation')).toBeInTheDocument()
    })

    it('provides appropriate container for future AI results', () => {
      renderWithRouter(<PreviewStep />)
      
      // Find the container with dashed border styling
      const containers = document.querySelectorAll('.border-dashed')
      const placeholder = containers[0] as HTMLElement
      expect(placeholder).toHaveClass('border-2', 'border-dashed')
      
      // This container will be replaced with actual AI results in future iterations
      expect(placeholder).toBeInTheDocument()
    })
  })
})