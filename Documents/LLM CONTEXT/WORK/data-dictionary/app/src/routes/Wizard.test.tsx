/**
 * Comprehensive tests for Wizard component
 * Tests step navigation, accessibility, keyboard shortcuts, and progress tracking
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom'
import Wizard from './Wizard'

// Mock the dependencies
jest.mock('../lib/analytics/usageTracker', () => ({
  trackWizardStep: jest.fn()
}))

jest.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
  createWizardShortcuts: jest.fn(() => [
    {
      id: 'go-to-describe',
      key: '1',
      modifiers: { alt: true },
      description: 'Go to Describe step',
      category: 'Navigation',
      handler: jest.fn()
    }
  ])
}))

jest.mock('../hooks/useFocusManagement', () => ({
  useScreenReaderAnnouncement: jest.fn(() => jest.fn())
}))

const { trackWizardStep } = require('../lib/analytics/usageTracker')
const { useKeyboardShortcuts, createWizardShortcuts } = require('../hooks/useKeyboardShortcuts')
const { useScreenReaderAnnouncement } = require('../hooks/useFocusManagement')

// Mock step content components for testing
const MockStepContent = ({ stepName }: { stepName: string }) => (
  <div data-testid={`${stepName}-content`}>
    <h2>{stepName} Step Content</h2>
  </div>
)

describe('Wizard', () => {
  const mockAnnounce = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    useScreenReaderAnnouncement.mockReturnValue(mockAnnounce)
    useKeyboardShortcuts.mockImplementation(() => {})
    createWizardShortcuts.mockReturnValue([])
  })

  const renderWizardWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<Wizard />}>
            <Route index element={<MockStepContent stepName="Describe" />} />
            <Route path="journeys" element={<MockStepContent stepName="Journeys" />} />
            <Route path="preview" element={<MockStepContent stepName="Preview" />} />
            <Route path="edit" element={<MockStepContent stepName="Edit" />} />
            <Route path="export" element={<MockStepContent stepName="Export" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  describe('Component Rendering', () => {
    it('renders wizard with all navigation steps', () => {
      renderWizardWithRouter()
      
      expect(screen.getByRole('navigation', { name: 'Wizard progress' })).toBeInTheDocument()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      
      // Check all step labels are present
      expect(screen.getByRole('tab', { name: /Describe step.*current/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Journeys step/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Preview step/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Edit step/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Export step/ })).toBeInTheDocument()
    })

    it('renders step content container with proper attributes', () => {
      renderWizardWithRouter()
      
      const tabPanel = screen.getByRole('tabpanel')
      expect(tabPanel).toBeInTheDocument()
      expect(tabPanel).toHaveAttribute('id', 'panel-')
      expect(tabPanel).toHaveAttribute('aria-labelledby', 'tab-')
      
      // Check that outlet content is rendered
      expect(screen.getByTestId('Describe-content')).toBeInTheDocument()
    })

    it('displays step numbers and arrows correctly', () => {
      renderWizardWithRouter()
      
      // Check step numbers (should be 1-5)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      
      // Check arrows between steps (should be 4 arrows)
      const arrows = screen.getAllByText('→')
      expect(arrows).toHaveLength(4)
    })

    it('renders screen reader progress indicator', () => {
      renderWizardWithRouter()
      
      // Check for the screen reader announcement container
      const announcements = document.querySelector('[aria-live="polite"].sr-only')
      expect(announcements).toBeInTheDocument()
      
      // Check that it contains step information (text may be broken across elements)
      expect(announcements).toHaveTextContent('Step')
      expect(announcements).toHaveTextContent('1')
      expect(announcements).toHaveTextContent('of')
      expect(announcements).toHaveTextContent('5')
      expect(announcements).toHaveTextContent('Describe')
    })
  })

  describe('Step Navigation', () => {
    it('highlights active step correctly for root route', () => {
      renderWizardWithRouter('/')
      
      const describeStep = screen.getByRole('tab', { name: /Describe step.*current/ })
      expect(describeStep).toHaveAttribute('aria-selected', 'true')
      expect(describeStep).toHaveAttribute('aria-current', 'step')
      expect(describeStep).toHaveClass('font-semibold', 'text-blue-600')
    })

    it('highlights active step correctly for other routes', () => {
      renderWizardWithRouter('/preview')
      
      const previewStep = screen.getByRole('tab', { name: /Preview step.*current/ })
      expect(previewStep).toHaveAttribute('aria-selected', 'true')
      expect(previewStep).toHaveAttribute('aria-current', 'step')
      
      // Other steps should not be active
      const describeStep = screen.getByRole('tab', { name: /Describe step/ })
      expect(describeStep).toHaveAttribute('aria-selected', 'false')
      expect(describeStep).not.toHaveAttribute('aria-current')
    })

    it('updates active step number styling', () => {
      renderWizardWithRouter('/journeys')
      
      // Find the step number elements by their container
      const stepNumbers = document.querySelectorAll('.wizard-step-number')
      
      // Step 2 should be active (journeys is second step)
      expect(stepNumbers[1]).toHaveClass('wizard-step-active')
      
      // Other steps should be incomplete
      expect(stepNumbers[0]).toHaveClass('wizard-step-incomplete')
      expect(stepNumbers[2]).toHaveClass('wizard-step-incomplete')
    })

    it('renders correct step content for each route', () => {
      // Test journeys route
      renderWizardWithRouter('/journeys')
      expect(screen.getByTestId('Journeys-content')).toBeInTheDocument()
      
      // Test edit route in a new render
      const { unmount } = render(
        <MemoryRouter initialEntries={['/edit']}>
          <Routes>
            <Route path="/" element={<Wizard />}>
              <Route index element={<MockStepContent stepName="Describe" />} />
              <Route path="edit" element={<MockStepContent stepName="Edit" />} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      
      expect(screen.getByTestId('Edit-content')).toBeInTheDocument()
      unmount()
    })

    it('allows navigation through step links', () => {
      renderWizardWithRouter('/')
      
      // Click on Preview step
      const previewLink = screen.getByRole('tab', { name: /Preview step/ })
      fireEvent.click(previewLink)
      
      // Should navigate to preview (in real app, this would be handled by React Router)
      expect(previewLink).toHaveAttribute('href', '/preview')
    })
  })

  describe('Analytics Tracking', () => {
    it('tracks wizard step navigation on mount', () => {
      renderWizardWithRouter('/')
      
      expect(trackWizardStep).toHaveBeenCalledWith('describe')
    })

    it('tracks different steps for different routes', () => {
      renderWizardWithRouter('/export')
      
      expect(trackWizardStep).toHaveBeenCalledWith('export')
    })

    it('announces step changes to screen readers', () => {
      renderWizardWithRouter('/preview')
      
      expect(mockAnnounce).toHaveBeenCalledWith('Navigated to Preview step')
    })
  })

  describe('Keyboard Shortcuts Integration', () => {
    it('creates wizard shortcuts with navigation callbacks', () => {
      renderWizardWithRouter()
      
      expect(createWizardShortcuts).toHaveBeenCalledWith(
        expect.objectContaining({
          goToDescribe: expect.any(Function),
          goToJourneys: expect.any(Function),
          goToPreview: expect.any(Function),
          goToEdit: expect.any(Function),
          goToExport: expect.any(Function)
        })
      )
    })

    it('enables keyboard shortcuts hook', () => {
      renderWizardWithRouter()
      
      expect(useKeyboardShortcuts).toHaveBeenCalledWith({
        shortcuts: expect.any(Array),
        enabled: true
      })
    })

    it('includes keyboard hints in step labels', () => {
      renderWizardWithRouter()
      
      // Check that aria-label includes keyboard shortcut information
      expect(screen.getByRole('tab', { name: /Alt\+1 to navigate/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Alt\+2 to navigate/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Alt\+3 to navigate/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Alt\+4 to navigate/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Alt\+5 to navigate/ })).toBeInTheDocument()
    })
  })

  describe('Accessibility Features', () => {
    it('has proper ARIA roles and attributes', () => {
      renderWizardWithRouter()
      
      const navigation = screen.getByRole('navigation', { name: 'Wizard progress' })
      expect(navigation).toBeInTheDocument()
      
      const tablist = screen.getByRole('tablist')
      expect(tablist).toBeInTheDocument()
      
      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toBeInTheDocument()
    })

    it('has correct tab/tabpanel relationships', () => {
      renderWizardWithRouter('/edit')
      
      const editTab = screen.getByRole('tab', { name: /Edit step.*current/ })
      const tabpanel = screen.getByRole('tabpanel')
      
      expect(editTab).toHaveAttribute('aria-controls', 'panel-edit')
      expect(tabpanel).toHaveAttribute('id', 'panel-edit')
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-edit')
    })

    it('marks decorative elements appropriately', () => {
      renderWizardWithRouter()
      
      // Step numbers should be decorative
      const stepNumbers = document.querySelectorAll('.wizard-step-number')
      stepNumbers.forEach(num => {
        expect(num).toHaveAttribute('aria-hidden', 'true')
      })
      
      // Arrows should be decorative
      const arrows = screen.getAllByText('→')
      arrows.forEach(arrow => {
        expect(arrow).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('has focus management for keyboard navigation', () => {
      renderWizardWithRouter()
      
      const tabs = screen.getAllByRole('tab')
      tabs.forEach(tab => {
        expect(tab).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500')
      })
    })

    it('updates screen reader announcements for step changes', () => {
      renderWizardWithRouter('/journeys')
      
      expect(mockAnnounce).toHaveBeenCalledWith('Navigated to Journeys step')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive spacing to step list', () => {
      renderWizardWithRouter()
      
      const stepList = screen.getByRole('tablist')
      expect(stepList).toHaveClass('flex', 'flex-wrap', 'gap-4', 'sm:gap-6')
    })

    it('applies responsive padding to content panel', () => {
      renderWizardWithRouter()
      
      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toHaveClass('p-6', 'sm:p-8')
    })
  })

  describe('Visual States', () => {
    it('applies correct CSS classes for active step', () => {
      renderWizardWithRouter('/preview')
      
      const activeTab = screen.getByRole('tab', { name: /Preview step.*current/ })
      expect(activeTab).toHaveClass('font-semibold', 'text-blue-600')
    })

    it('applies correct CSS classes for inactive steps', () => {
      renderWizardWithRouter('/preview')
      
      const inactiveTab = screen.getByRole('tab', { name: /Describe step/ })
      expect(inactiveTab).toHaveClass('text-gray-600', 'hover:text-gray-900', 'hover:underline')
    })

    it('applies correct step number styling', () => {
      renderWizardWithRouter('/edit')
      
      const stepNumbers = document.querySelectorAll('.wizard-step-number')
      
      // Edit is step 4, so index 3 should be active
      expect(stepNumbers[3]).toHaveClass('wizard-step-active')
      
      // Others should be incomplete
      expect(stepNumbers[0]).toHaveClass('wizard-step-incomplete')
      expect(stepNumbers[1]).toHaveClass('wizard-step-incomplete')
      expect(stepNumbers[2]).toHaveClass('wizard-step-incomplete')
      expect(stepNumbers[4]).toHaveClass('wizard-step-incomplete')
    })
  })

  describe('Content Panel Structure', () => {
    it('renders content panel with correct styling', () => {
      renderWizardWithRouter()
      
      const contentPanel = screen.getByRole('tabpanel')
      expect(contentPanel).toHaveClass(
        'bg-white',
        'border',
        'border-gray-200',
        'rounded-lg',
        'shadow-sm'
      )
    })

    it('updates content panel id based on current route', () => {
      // Test journeys route
      renderWizardWithRouter('/journeys')
      let contentPanel = screen.getByRole('tabpanel')
      expect(contentPanel).toHaveAttribute('id', 'panel-journeys')
      
      // Test export route separately
      const { unmount } = render(
        <MemoryRouter initialEntries={['/export']}>
          <Routes>
            <Route path="/" element={<Wizard />}>
              <Route index element={<MockStepContent stepName="Describe" />} />
              <Route path="export" element={<MockStepContent stepName="Export" />} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      
      const exportPanel = screen.getAllByRole('tabpanel').find(panel => 
        panel.getAttribute('id') === 'panel-export'
      )
      expect(exportPanel).toBeInTheDocument()
      unmount()
    })
  })

  describe('Step Progress Logic', () => {
    it('shows correct step position in progress indicator', () => {
      renderWizardWithRouter('/edit')
      
      // Check that the screen reader indicator shows step 4
      const announcements = document.querySelector('[aria-live="polite"].sr-only')
      expect(announcements).toHaveTextContent('Step')
      expect(announcements).toHaveTextContent('4')
      expect(announcements).toHaveTextContent('of')
      expect(announcements).toHaveTextContent('5')
      expect(announcements).toHaveTextContent('Edit')
    })

    it('handles root route as step 1', () => {
      renderWizardWithRouter('/')
      
      // Check that the screen reader indicator shows step 1
      const announcements = document.querySelector('[aria-live="polite"].sr-only')
      expect(announcements).toHaveTextContent('Step')
      expect(announcements).toHaveTextContent('1')
      expect(announcements).toHaveTextContent('of')
      expect(announcements).toHaveTextContent('5')
      expect(announcements).toHaveTextContent('Describe')
    })

    it('maintains step completion state structure', () => {
      renderWizardWithRouter()
      
      // Check that completion logic is set up (currently always false)
      const stepNumbers = document.querySelectorAll('.wizard-step-number')
      stepNumbers.forEach((num, index) => {
        if (index === 0) {
          // First step is active
          expect(num).toHaveClass('wizard-step-active')
        } else {
          // Others are incomplete (completion tracking is TODO)
          expect(num).toHaveClass('wizard-step-incomplete')
        }
      })
    })
  })
})