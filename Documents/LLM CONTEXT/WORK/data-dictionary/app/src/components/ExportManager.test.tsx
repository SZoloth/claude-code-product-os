/**
 * Unit tests for ExportManager component
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExportManager from './ExportManager'
import type { DataDictionary } from '../lib/schema/dataDictionary'

// Mock the ExportUtils and ExportValidator
jest.mock('../lib/export/exportUtils', () => ({
  ExportUtils: {
    exportToCsv: jest.fn(() => ({
      data: 'event_name,event_type\ntest_event,intent',
      filename: 'test.csv',
      headers: ['event_name', 'event_type'],
      rowCount: 1,
      warnings: []
    })),
    exportToMarkdown: jest.fn(() => ({
      data: '# Data Dictionary\n\n### test_event',
      filename: 'test.md',
      sections: ['metadata', 'toc'],
      eventCount: 1
    })),
    exportToDatadog: jest.fn(() => ({
      data: 'export function trackTestEvent() {}',
      filename: 'test.ts',
      functionCount: 1,
      apiMethods: ['addAction']
    })),
    exportToJira: jest.fn(() => ({
      data: 'h1. Test Event Implementation',
      filename: 'test.txt',
      ticketCount: 1,
      estimatedStoryPoints: 3
    }))
  }
}))

jest.mock('../lib/export/exportValidator', () => ({
  ExportValidator: {
    validateExport: jest.fn(() => ({
      isValid: true,
      errors: [],
      warnings: [],
      format: 'csv',
      eventCount: 1,
      validEventCount: 1,
      schemaCompliance: {
        hasRequiredFields: true,
        hasValidNaming: true,
        hasValidEnums: true,
        csvCompatible: true
      }
    })),
    importFromCsv: jest.fn(() => ({
      success: true,
      dictionary: mockDictionary,
      events: mockDictionary.events,
      errors: [],
      warnings: [],
      format: 'csv',
      originalEventCount: 1,
      importedEventCount: 1
    })),
    importFromJson: jest.fn(() => ({
      success: true,
      dictionary: mockDictionary,
      events: mockDictionary.events,
      errors: [],
      warnings: [],
      format: 'json',
      originalEventCount: 1,
      importedEventCount: 1
    }))
  }
}))

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock HTMLAnchorElement click
const mockClick = jest.fn()
const originalCreateElement = document.createElement.bind(document)

jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  const element = originalCreateElement(tagName)
  if (tagName === 'a') {
    // Override the click method on anchor elements
    Object.defineProperty(element, 'click', {
      value: mockClick,
      writable: true,
      configurable: true
    })
  }
  return element
})

const mockDictionary: DataDictionary = {
  version: '1.0.0',
  generatedAtIso: '2024-01-01T00:00:00Z',
  events: [
    {
      event_name: 'test_event',
      event_type: 'intent',
      event_action_type: 'action',
      event_purpose: 'Test event for component testing',
      when_to_fire: 'When testing the component',
      actor: 'user',
      object: 'test',
      context_surface: 'test_page',
      properties: [
        {
          name: 'test_prop',
          type: 'string',
          required: true,
          example: 'test_value',
          description: 'Test property'
        }
      ],
      context_keys: ['test_key'],
      lifecycle_status: 'approved',
      datadog_api: 'addAction'
    }
  ]
}

describe('ExportManager', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockClick.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders export manager with dictionary info', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Export Manager')).toBeInTheDocument()
    expect(screen.getByText(/1 events/)).toBeInTheDocument()
    expect(screen.getByText('Export Formats')).toBeInTheDocument()
  })

  it('shows all export format options', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('csv')).toBeInTheDocument()
    expect(screen.getByText('markdown')).toBeInTheDocument()
    expect(screen.getByText('datadog')).toBeInTheDocument()
    expect(screen.getByText('jira')).toBeInTheDocument()
  })

  it('allows format selection', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    // Find checkboxes by their format cards
    const csvHeading = screen.getByText('csv')
    const csvCard = csvHeading.closest('.border.rounded-lg') as HTMLElement
    const csvCheckbox = within(csvCard).getByRole('checkbox')
    
    const markdownHeading = screen.getByText('markdown')  
    const markdownCard = markdownHeading.closest('.border.rounded-lg') as HTMLElement
    const markdownCheckbox = within(markdownCard).getByRole('checkbox')
    
    // CSV should be selected by default
    expect(csvCheckbox).toBeChecked()
    expect(markdownCheckbox).not.toBeChecked()

    // Click markdown card to select it (avoiding double-click issue)
    fireEvent.click(markdownCard)
    expect(markdownCheckbox).toBeChecked()
  })

  it('handles single export correctly', async () => {
    const { ExportUtils } = require('../lib/export/exportUtils')
    
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    // Find the CSV card and its export button specifically
    const csvHeading = screen.getByText('csv')
    const csvCard = csvHeading.closest('.border.rounded-lg') as HTMLElement
    const exportButton = within(csvCard).getByText('Export')
    
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(ExportUtils.exportToCsv).toHaveBeenCalledWith(mockDictionary, expect.any(Object))
    })
  })

  it('shows CSV options when CSV is selected', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('CSV Options')).toBeInTheDocument()
    expect(screen.getByText('Include Headers')).toBeInTheDocument()
    expect(screen.getByText('Include Empty Columns')).toBeInTheDocument()
  })

  it('shows import and validation actions', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Import & Validation')).toBeInTheDocument()
    expect(screen.getByText('📥 Import CSV/JSON')).toBeInTheDocument()
    expect(screen.getByText('🔍 Show Validation')).toBeInTheDocument()
  })

  it('handles validation toggle', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    const validationButton = screen.getByText('🔍 Show Validation')
    fireEvent.click(validationButton)

    expect(screen.getByText('🔍 Hide Validation')).toBeInTheDocument()
  })

  it('closes when close button is clicked', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows export previews', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Export Previews')).toBeInTheDocument()
    expect(screen.getByText(/Section 7 schema with 1 rows/)).toBeInTheDocument()
    expect(screen.getByText(/1 TypeScript functions/)).toBeInTheDocument()
  })

  it('handles batch export with multiple formats selected', async () => {
    const { ExportUtils } = require('../lib/export/exportUtils')
    
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    // Select markdown in addition to default CSV
    const markdownHeading = screen.getByText('markdown')
    const markdownCard = markdownHeading.closest('.border.rounded-lg') as HTMLElement
    fireEvent.click(markdownCard)

    // Wait for the batch export button to appear with the correct count
    await waitFor(() => {
      expect(screen.getByText(/Export Selected \(2\)/)).toBeInTheDocument()
    })

    const batchExportButton = screen.getByText(/Export Selected \(2\)/)
    fireEvent.click(batchExportButton)

    await waitFor(() => {
      expect(ExportUtils.exportToCsv).toHaveBeenCalledWith(mockDictionary, expect.any(Object))
      expect(ExportUtils.exportToMarkdown).toHaveBeenCalledWith(mockDictionary)
    })
  })

  it('updates CSV options correctly', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    // First select CSV format to make options visible
    // Find the CSV format card and its checkbox
    const csvHeading = screen.getByText('csv')
    const csvCard = csvHeading.closest('.border.rounded-lg') as HTMLElement
    const csvCheckbox = within(csvCard).getByRole('checkbox')
    fireEvent.click(csvCheckbox)

    // Now the CSV options should be visible
    // Find checkboxes by their parent containers that contain the text
    const includeHeadersContainer = screen.getByText('Include Headers').closest('div') as HTMLElement
    const includeEmptyContainer = screen.getByText('Include Empty Columns').closest('div') as HTMLElement
    
    const includeHeadersCheckbox = within(includeHeadersContainer).getByRole('checkbox')
    const includeEmptyCheckbox = within(includeEmptyContainer).getByRole('checkbox')

    // Should be checked by default
    expect(includeHeadersCheckbox).toBeChecked()
    expect(includeEmptyCheckbox).toBeChecked()

    // Toggle them
    fireEvent.click(includeHeadersCheckbox)
    fireEvent.click(includeEmptyCheckbox)

    expect(includeHeadersCheckbox).not.toBeChecked()
    expect(includeEmptyCheckbox).not.toBeChecked()
  })

  it('shows format descriptions', () => {
    render(
      <ExportManager 
        dictionary={mockDictionary} 
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText(/Structured data for Excel/)).toBeInTheDocument()
    expect(screen.getByText(/Human-readable documentation/)).toBeInTheDocument()
    expect(screen.getByText(/TypeScript implementation stubs/)).toBeInTheDocument()
    expect(screen.getByText(/JIRA-ready ticket descriptions/)).toBeInTheDocument()
  })
})