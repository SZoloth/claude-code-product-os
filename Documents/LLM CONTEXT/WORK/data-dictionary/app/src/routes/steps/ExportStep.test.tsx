/**
 * Comprehensive tests for ExportStep component
 * Tests event loading, validation display, export functionality, and navigation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import ExportStep from './ExportStep'
import { ProjectManager as PM } from '../../lib/storage/projectManager'

// Mock the ProjectManager
jest.mock('../../lib/storage/projectManager', () => ({
  ProjectManager: {
    loadProject: jest.fn(),
    saveProject: jest.fn()
  }
}))

// Mock the child components
jest.mock('../../components/ExportManager', () => {
  return function MockExportManager({ onClose, dictionary }: any) {
    return (
      <div data-testid="export-manager">
        <div>Export Manager Modal</div>
        <div>Exporting {dictionary.events.length} events</div>
        <button onClick={onClose}>Close Export Manager</button>
      </div>
    )
  }
})

jest.mock('../../components/ValidationBanner', () => {
  return function MockValidationBanner({ dictionary }: any) {
    return (
      <div data-testid="validation-banner">
        Validation Banner - {dictionary.events.length} events - v{dictionary.version}
      </div>
    )
  }
})

const mockPM = PM as jest.Mocked<typeof PM>

// Helper to create valid mock events
const createMockEvent = (name: string, type: 'intent' | 'success' | 'failure' = 'intent') => ({
  event_name: name,
  event_type: type,
  event_action_type: 'action' as const,
  event_purpose: `Test ${name} event`,
  when_to_fire: 'When user performs action',
  actor: 'User',
  object: 'System',
  context_surface: 'Web App',
  properties: [],
  lifecycle_status: 'proposed' as const,
  datadog_api: 'addAction' as const
})

describe('ExportStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
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
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('Export & Integrate')).toBeInTheDocument()
      expect(screen.getByText(/Download your finalized data dictionary/)).toBeInTheDocument()
    })

    it('renders validation banner', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByTestId('validation-banner')).toBeInTheDocument()
      expect(screen.getByText(/Validation Banner.*v1\.0\.0/)).toBeInTheDocument()
    })

    it('renders export summary section', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('Ready for Export')).toBeInTheDocument()
      expect(screen.getByText(/events ready for download in multiple formats/)).toBeInTheDocument()
    })

    it('renders download button', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByRole('button', { name: /export now/i })).toBeInTheDocument()
    })
  })

  describe('Event Loading from Project', () => {
    it('loads events from project when available', () => {
      const mockProject = {
        metadata: {
          id: 'test-project',
          name: 'Test Project',
          description: 'Test description',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          eventCount: 2
        },
        data: {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: [
            createMockEvent('project_event'),
            createMockEvent('second_event', 'success')
          ]
        }
      }
      mockPM.loadProject.mockReturnValue(mockProject)
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('Validation Banner - 2 events - v1.0.0')).toBeInTheDocument()
      expect(screen.getByText(/2 events ready/)).toBeInTheDocument()
    })

    it('falls back to localStorage when no project exists', () => {
      mockPM.loadProject.mockReturnValue(null)
      
      const mockEvents = JSON.stringify([
        createMockEvent('storage_event')
      ])
      ;(localStorage.getItem as jest.Mock).mockReturnValue(mockEvents)
      
      renderWithRouter(<ExportStep />)
      
      expect(localStorage.getItem).toHaveBeenCalledWith('dataDictionary_events')
      expect(screen.getByText('Validation Banner - 1 events - v1.0.0')).toBeInTheDocument()
      expect(screen.getByText((content, element) => {
        return element?.textContent === '1 events ready for download in multiple formats'
      })).toBeInTheDocument()
    })

    it('handles empty events array when no data exists', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('Validation Banner - 0 events - v1.0.0')).toBeInTheDocument()
      expect(screen.getByText(/0 events ready/)).toBeInTheDocument()
    })

    it('handles corrupted localStorage data gracefully', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid json')
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      renderWithRouter(<ExportStep />)
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse saved events:', expect.any(SyntaxError))
      expect(screen.getByText('Validation Banner - 0 events - v1.0.0')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Data Dictionary Structure', () => {
    it('creates proper data dictionary with version and timestamp', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      const dateNowSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T12:00:00.000Z')
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('Validation Banner - 0 events - v1.0.0')).toBeInTheDocument()
      
      dateNowSpy.mockRestore()
    })

    it('includes events in the data dictionary structure', () => {
      const mockEvents = [
        createMockEvent('test_event')
      ]
      
      mockPM.loadProject.mockReturnValue({
        metadata: {
          id: 'test-project',
          name: 'Test Project',
          description: 'Test description', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          eventCount: 1
        },
        data: {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: mockEvents
        }
      })
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('Validation Banner - 1 events - v1.0.0')).toBeInTheDocument()
    })
  })

  describe('Export Manager Integration', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('opens export manager when download button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<ExportStep />)
      
      const downloadButton = screen.getByRole('button', { name: /export now/i })
      await user.click(downloadButton)
      
      expect(screen.getByTestId('export-manager')).toBeInTheDocument()
      expect(screen.getByText('Export Manager Modal')).toBeInTheDocument()
    })

    it('passes correct data dictionary to export manager', async () => {
      const user = userEvent.setup()
      
      const mockEvents = [
        createMockEvent('test1'),
        createMockEvent('test2', 'success')
      ]
      
      mockPM.loadProject.mockReturnValue({
        metadata: {
          id: 'test-project',
          name: 'Test Project',
          description: 'Test description', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          eventCount: 2
        },
        data: {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: mockEvents
        }
      })
      
      renderWithRouter(<ExportStep />)
      
      const downloadButton = screen.getByRole('button', { name: /export now/i })
      await user.click(downloadButton)
      
      expect(screen.getByText('Exporting 2 events')).toBeInTheDocument()
    })

    it('closes export manager when close is triggered', async () => {
      const user = userEvent.setup()
      renderWithRouter(<ExportStep />)
      
      // Open export manager
      await user.click(screen.getByRole('button', { name: /export now/i }))
      expect(screen.getByTestId('export-manager')).toBeInTheDocument()
      
      // Close export manager
      await user.click(screen.getByText('Close Export Manager'))
      expect(screen.queryByTestId('export-manager')).not.toBeInTheDocument()
    })
  })

  describe('Export Summary Display', () => {
    it('shows correct event count in summary', () => {
      const mockEvents = new Array(5).fill(null).map((_, i) => 
        createMockEvent(`event_${i}`)
      )
      
      mockPM.loadProject.mockReturnValue({
        metadata: {
          id: 'test-project',
          name: 'Test Project',
          description: 'Test description', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          eventCount: 2
        },
        data: {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: mockEvents
        }
      })
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText(/5 events ready/)).toBeInTheDocument()
    })

    it('handles singular vs plural event count correctly', () => {
      const mockEvents = [
        createMockEvent('single_event')
      ]
      
      mockPM.loadProject.mockReturnValue({
        metadata: {
          id: 'test-project',
          name: 'Test Project',
          description: 'Test description', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          eventCount: 2
        },
        data: {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: mockEvents
        }
      })
      
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === '1 events ready for download in multiple formats'
      })).toBeInTheDocument()
    })

    it('displays export formats available', () => {
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByText('CSV Export')).toBeInTheDocument()
      expect(screen.getByText('Markdown Documentation')).toBeInTheDocument()
      expect(screen.getByText('Datadog TypeScript')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('renders back link to edit', () => {
      renderWithRouter(<ExportStep />)
      
      const backLinks = screen.getAllByRole('link', { name: /back/i })
      const mainBackLink = backLinks.find(link => link.getAttribute('href') === '/edit')
      expect(mainBackLink).toBeInTheDocument()
      expect(mainBackLink).toHaveAttribute('href', '/edit')
    })

    it('has proper link styling', () => {
      renderWithRouter(<ExportStep />)
      
      const backLinks = screen.getAllByRole('link', { name: /back/i })
      const styledBackLink = backLinks.find(link => link.classList.contains('underline'))
      expect(styledBackLink).toHaveClass('underline')
    })
  })

  describe('Component Structure and Styling', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('has proper spacing between sections', () => {
      renderWithRouter(<ExportStep />)
      
      // Find the root container with space-y-6 class
      const containers = document.querySelectorAll('.space-y-6')
      const mainContainer = containers[0] as HTMLElement
      expect(mainContainer).toHaveClass('space-y-6')
    })

    it('applies gradient background to export summary', () => {
      renderWithRouter(<ExportStep />)
      
      const exportSummary = screen.getByText('Ready for Export').closest('.bg-gradient-to-r')
      expect(exportSummary).toHaveClass('bg-gradient-to-r', 'from-blue-50', 'to-green-50')
    })

    it('has proper button styling', () => {
      renderWithRouter(<ExportStep />)
      
      const downloadButton = screen.getByRole('button', { name: /export now/i })
      expect(downloadButton).toHaveClass('bg-blue-600', 'text-white')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('has proper heading hierarchy', () => {
      renderWithRouter(<ExportStep />)
      
      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveTextContent('Export & Integrate')
      
      const summaryHeading = screen.getByText('Ready for Export')
      expect(summaryHeading.tagName).toBe('H3')
    })

    it('has accessible button labels', () => {
      renderWithRouter(<ExportStep />)
      
      expect(screen.getByRole('button', { name: /export now/i })).toBeInTheDocument()
    })

    it('has proper link accessibility', () => {
      renderWithRouter(<ExportStep />)
      
      const backLink = screen.getByRole('link', { name: /back to edit/i })
      expect(backLink).toHaveAttribute('href', '/edit')
    })

    it('supports dark mode with proper classes', () => {
      renderWithRouter(<ExportStep />)
      
      const description = screen.getByText(/Download your finalized data dictionary/)
      expect(description).toHaveClass('dark:text-gray-400')
      
      const summarySection = screen.getByText('Ready for Export').closest('.bg-gradient-to-r')
      expect(summarySection).toHaveClass('dark:from-blue-900/20', 'dark:to-green-900/20')
    })
  })

  describe('State Management', () => {
    it('maintains modal state correctly', async () => {
      const user = userEvent.setup()
      
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<ExportStep />)
      
      // Initially closed
      expect(screen.queryByTestId('export-manager')).not.toBeInTheDocument()
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /export now/i }))
      expect(screen.getByTestId('export-manager')).toBeInTheDocument()
      
      // Close modal
      await user.click(screen.getByText('Close Export Manager'))
      expect(screen.queryByTestId('export-manager')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing project data gracefully', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      expect(() => renderWithRouter(<ExportStep />)).not.toThrow()
      expect(screen.getByTestId('validation-banner')).toBeInTheDocument()
    })

    it('handles localStorage errors gracefully', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Component should handle localStorage errors and default to empty events
      renderWithRouter(<ExportStep />)
      expect(screen.getByText('Validation Banner - 0 events - v1.0.0')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to access localStorage:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })
})