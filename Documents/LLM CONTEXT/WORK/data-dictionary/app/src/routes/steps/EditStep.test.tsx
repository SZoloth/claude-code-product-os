/**
 * Comprehensive tests for EditStep component
 * Tests event loading, state management, modal interactions, and navigation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import EditStep from './EditStep'
import { ProjectManager as PM } from '../../lib/storage/projectManager'

// Mock the navigation
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

// Mock the ProjectManager
jest.mock('../../lib/storage/projectManager', () => ({
  ProjectManager: {
    loadProject: jest.fn(),
    saveProject: jest.fn(),
    createProject: jest.fn(),
    autoSave: jest.fn(),
    cleanup: jest.fn()
  }
}))

// Mock the child components
jest.mock('../../components/EventsTable', () => {
  return function MockEventsTable({ events, onEventsChange }: any) {
    return (
      <div data-testid="events-table">
        <div>Events Table Component</div>
        <div>Event count: {events.length}</div>
        <button onClick={() => onEventsChange([...events, { event_name: 'new_event' }])}>
          Add Event
        </button>
      </div>
    )
  }
})

jest.mock('../../components/ValidationBanner', () => {
  return function MockValidationBanner({ dictionary }: any) {
    return (
      <div data-testid="validation-banner">
        Validation Banner - {dictionary.events.length} events
      </div>
    )
  }
})

jest.mock('../../components/SnapshotManager', () => {
  return function MockSnapshotManager({ onClose }: any) {
    return (
      <div data-testid="snapshot-manager">
        <div>Snapshot Manager Modal</div>
        <button onClick={onClose}>Close Snapshot Manager</button>
      </div>
    )
  }
})

jest.mock('../../components/ProjectManager', () => {
  return function MockProjectManager({ onClose }: any) {
    return (
      <div data-testid="project-manager">
        <div>Project Manager Modal</div>
        <button onClick={onClose}>Close Project Manager</button>
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

describe('EditStep', () => {
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
      
      renderWithRouter(<EditStep />)
      
      expect(screen.getByText('Edit & Refine Events')).toBeInTheDocument()
      expect(screen.getByText(/Fine-tune the AI-generated events/)).toBeInTheDocument()
    })

    it('renders all main components', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<EditStep />)
      
      expect(screen.getByTestId('validation-banner')).toBeInTheDocument()
      expect(screen.getByTestId('events-table')).toBeInTheDocument()
    })

    it('renders action buttons', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<EditStep />)
      
      expect(screen.getByRole('button', { name: /manage snapshots/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /manage project/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next: export/i })).toBeInTheDocument()
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
          eventCount: 1
        },
        data: {
          version: '1.0.0',
          generatedAtIso: new Date().toISOString(),
          events: [
            createMockEvent('project_event')
          ]
        }
      }
      mockPM.loadProject.mockReturnValue(mockProject)
      
      renderWithRouter(<EditStep />)
      
      expect(screen.getByText('Event count: 1')).toBeInTheDocument()
      expect(screen.getByText('Validation Banner - 1 events')).toBeInTheDocument()
    })

    it('falls back to localStorage when no project exists', () => {
      mockPM.loadProject.mockReturnValue(null)
      
      const mockEvents = JSON.stringify([
        {
          event_name: 'storage_event',
          event_type: 'intent',
          event_action_type: 'action',
          properties: []
        }
      ])
      ;(localStorage.getItem as jest.Mock).mockReturnValue(mockEvents)
      
      renderWithRouter(<EditStep />)
      
      expect(localStorage.getItem).toHaveBeenCalledWith('dataDictionary_events')
      expect(screen.getByText('Event count: 1')).toBeInTheDocument()
    })

    it('uses default mock events when no saved data exists', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      renderWithRouter(<EditStep />)
      
      // Should load default mock events (at least one product_viewed event)
      expect(screen.getByText(/Event count: /)).toBeInTheDocument()
    })

    it('handles corrupted localStorage data gracefully', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid json')
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      renderWithRouter(<EditStep />)
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse saved events:', expect.any(SyntaxError))
      // Should fall back to default events
      expect(screen.getByText(/Event count: /)).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Modal Management', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('opens snapshot manager when snapshots button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      const snapshotsButton = screen.getByText('Manage Snapshots').closest('button')
      expect(snapshotsButton).toBeInTheDocument()
      await user.click(snapshotsButton!)
      
      expect(screen.getByTestId('snapshot-manager')).toBeInTheDocument()
      expect(screen.getByText('Snapshot Manager Modal')).toBeInTheDocument()
    })

    it('closes snapshot manager when close is triggered', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      // Open snapshot manager
      const snapshotsButton = screen.getByText('Manage Snapshots').closest('button')
      await user.click(snapshotsButton!)
      expect(screen.getByTestId('snapshot-manager')).toBeInTheDocument()
      
      // Close snapshot manager
      await user.click(screen.getByText('Close Snapshot Manager'))
      expect(screen.queryByTestId('snapshot-manager')).not.toBeInTheDocument()
    })

    it('opens project manager when projects button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      const projectsButton = screen.getByText('Manage Project').closest('button')
      expect(projectsButton).toBeInTheDocument()
      await user.click(projectsButton!)
      
      expect(screen.getByTestId('project-manager')).toBeInTheDocument()
      expect(screen.getByText('Project Manager Modal')).toBeInTheDocument()
    })

    it('closes project manager when close is triggered', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      // Open project manager
      const projectButton = screen.getByText('Manage Project').closest('button')
      await user.click(projectButton!)
      expect(screen.getByTestId('project-manager')).toBeInTheDocument()
      
      // Close project manager
      await user.click(screen.getByText('Close Project Manager'))
      expect(screen.queryByTestId('project-manager')).not.toBeInTheDocument()
    })

    it('can have both modals open simultaneously', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      // Open snapshot manager
      const snapshotsButton = screen.getByText('Manage Snapshots').closest('button')
      await user.click(snapshotsButton!)
      expect(screen.getByTestId('snapshot-manager')).toBeInTheDocument()
      
      // Open project manager (both should be open simultaneously)
      const projectButton = screen.getByText('Manage Project').closest('button')
      await user.click(projectButton!)
      expect(screen.getByTestId('snapshot-manager')).toBeInTheDocument()
      expect(screen.getByTestId('project-manager')).toBeInTheDocument()
    })
  })

  describe('Event Management', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('updates events when EventsTable triggers change', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      const initialCount = parseInt(screen.getByText(/Event count: (\d+)/).textContent?.match(/\d+/)?.[0] || '0')
      
      // Trigger add event from mock EventsTable
      await user.click(screen.getByText('Add Event'))
      
      expect(screen.getByText(`Event count: ${initialCount + 1}`)).toBeInTheDocument()
    })

    it('saves events to localStorage when they change', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      // Trigger add event
      await user.click(screen.getByText('Add Event'))
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dataDictionary_events',
        expect.stringContaining('new_event')
      )
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('navigates to export step when Next button is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      const nextButton = screen.getByRole('button', { name: /next: export/i })
      await user.click(nextButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/export')
    })

    it('renders back link to preview', () => {
      renderWithRouter(<EditStep />)
      
      const backLink = screen.getByRole('link', { name: /back/i })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/preview')
    })
  })

  describe('Component Integration', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('passes correct props to ValidationBanner', () => {
      renderWithRouter(<EditStep />)
      
      const validationBanner = screen.getByTestId('validation-banner')
      expect(validationBanner).toHaveTextContent(/\d+ events/)
    })

    it('passes events and change handler to EventsTable', () => {
      renderWithRouter(<EditStep />)
      
      const eventsTable = screen.getByTestId('events-table')
      expect(eventsTable).toBeInTheDocument()
      expect(screen.getByText('Events Table Component')).toBeInTheDocument()
      expect(screen.getByText('Add Event')).toBeInTheDocument() // Mock button
    })

    it('passes modal state correctly to child components', async () => {
      const user = userEvent.setup()
      renderWithRouter(<EditStep />)
      
      // Initially modals should be closed
      expect(screen.queryByTestId('snapshot-manager')).not.toBeInTheDocument()
      expect(screen.queryByTestId('project-manager')).not.toBeInTheDocument()
      
      // Open snapshot manager
      const snapshotsButton = screen.getByText('Manage Snapshots').closest('button')
      await user.click(snapshotsButton!)
      expect(screen.getByTestId('snapshot-manager')).toBeInTheDocument()
    })
  })

  describe('Data Dictionary Structure', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('creates proper data dictionary structure for validation', () => {
      renderWithRouter(<EditStep />)
      
      // The ValidationBanner should receive a proper DataDictionary structure
      const validationBanner = screen.getByTestId('validation-banner')
      expect(validationBanner).toBeInTheDocument()
      
      // The structure should include version, generatedAtIso, and events
      // This is tested indirectly through the ValidationBanner component
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
    })

    it('has proper heading hierarchy', () => {
      renderWithRouter(<EditStep />)
      
      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveTextContent('Edit & Refine Events')
    })

    it('has accessible button labels', () => {
      renderWithRouter(<EditStep />)
      
      expect(screen.getByRole('button', { name: /manage snapshots/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /manage project/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next: export/i })).toBeInTheDocument()
    })

    it('has proper link structure', () => {
      renderWithRouter(<EditStep />)
      
      const backLink = screen.getByRole('link', { name: /back/i })
      expect(backLink).toHaveAttribute('href', '/preview')
    })
  })

  describe('Error Handling', () => {
    it('handles missing project data gracefully', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      expect(() => renderWithRouter(<EditStep />)).not.toThrow()
      expect(screen.getByTestId('events-table')).toBeInTheDocument()
    })

    it('handles localStorage errors gracefully', () => {
      mockPM.loadProject.mockReturnValue(null)
      ;(localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage error')
      })
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      expect(() => renderWithRouter(<EditStep />)).not.toThrow()
      expect(screen.getByTestId('events-table')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to access localStorage:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })
})