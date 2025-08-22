/**
 * Comprehensive tests for ValidationBanner component
 * Tests validation status display, error handling, and UI feedback
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ValidationBanner from './ValidationBanner'
import type { DataDictionary } from '../lib/schema/dataDictionary'

// Mock the ValidationUtils
jest.mock('../lib/schema/validationUtils', () => ({
  ValidationUtils: {
    getValidationStatus: jest.fn(),
    validateDictionaryForUI: jest.fn(),
    extractEventName: jest.fn(),
    formatErrorMessage: jest.fn()
  }
}))

const { ValidationUtils } = require('../lib/schema/validationUtils')

describe('ValidationBanner', () => {
  const mockDictionary: DataDictionary = {
    events: [],
    version: '1.0.0',
    generatedAtIso: '2025-01-01T00:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ValidationUtils.extractEventName.mockImplementation((field: string) => 
      field.includes('.') ? field.split('.')[0] : field
    )
    ValidationUtils.formatErrorMessage.mockImplementation((message: string) => message)
  })

  describe('Valid Status', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'valid',
        message: 'All validations passed successfully',
        canExport: true
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: true,
        summary: {
          totalErrors: 0,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [],
        warnings: []
      })
    })

    it('renders valid status with correct styling and icon', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      const banner = screen.getByText('Validation Status').closest('.rounded-md')
      expect(banner).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800')
      
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('All validations passed successfully')).toBeInTheDocument()
    })

    it('does not show error or warning sections when valid', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.queryByText(/Critical Issues/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Error/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Recommendation/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Events with Issues/)).not.toBeInTheDocument()
    })
  })

  describe('Warning Status', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'warning',
        message: 'Some recommendations available',
        canExport: true
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: true,
        summary: {
          totalErrors: 0,
          totalWarnings: 2,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [],
        warnings: [
          { field: 'user_login.user_id', message: 'Consider adding example value' },
          { field: 'product_viewed.category', message: 'Property could be more descriptive' }
        ]
      })
    })

    it('renders warning status with correct styling and icon', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      const banner = screen.getByText('Validation Status').closest('.rounded-md')
      expect(banner).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800')
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      expect(screen.getByText('Some recommendations available')).toBeInTheDocument()
    })

    it('displays warning messages correctly', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('2 Recommendations:')).toBeInTheDocument()
      expect(screen.getByText(/Consider adding example value/)).toBeInTheDocument()
      expect(screen.getByText(/Property could be more descriptive/)).toBeInTheDocument()
      
      // Check that field names are extracted and displayed in monospace
      const fieldNames = screen.getAllByText((content, element) => {
        return element?.classList.contains('font-mono') && content.includes('user_login')
      })
      expect(fieldNames.length).toBeGreaterThan(0)
    })

    it('handles single warning correctly', () => {
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: true,
        summary: {
          totalErrors: 0,
          totalWarnings: 1,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [],
        warnings: [
          { field: 'user_login.user_id', message: 'Consider adding example value' }
        ]
      })

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('1 Recommendation:')).toBeInTheDocument()
    })

    it('truncates warnings list when more than 3 warnings exist', () => {
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: true,
        summary: {
          totalErrors: 0,
          totalWarnings: 5,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [],
        warnings: [
          { field: 'event1.prop1', message: 'Warning 1' },
          { field: 'event2.prop2', message: 'Warning 2' },
          { field: 'event3.prop3', message: 'Warning 3' },
          { field: 'event4.prop4', message: 'Warning 4' },
          { field: 'event5.prop5', message: 'Warning 5' }
        ]
      })

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText(/Warning 1/)).toBeInTheDocument()
      expect(screen.getByText(/Warning 2/)).toBeInTheDocument()
      expect(screen.getByText(/Warning 3/)).toBeInTheDocument()
      expect(screen.getByText(/and 2 more recommendations/)).toBeInTheDocument()
      expect(screen.queryByText(/Warning 4/)).not.toBeInTheDocument()
    })
  })

  describe('Error Status', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'error',
        message: 'Critical validation errors found',
        canExport: false
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 3,
          totalWarnings: 1,
          eventErrorCount: {
            'user_login': 2,
            'product_viewed': 1
          },
          criticalIssues: ['Missing required event names', 'Invalid property types']
        },
        errors: [
          { field: 'user_login.event_name', message: 'Event name cannot be empty' },
          { field: 'user_login.user_id', message: 'Property type is required' },
          { field: 'product_viewed.product_id', message: 'Invalid property format' }
        ],
        warnings: [
          { field: 'user_login.timestamp', message: 'Consider using ISO format' }
        ]
      })
    })

    it('renders error status with correct styling and icon', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      const banner = screen.getByText('Validation Status').closest('.rounded-md')
      expect(banner).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800')
      
      expect(screen.getByText('❌')).toBeInTheDocument()
      expect(screen.getByText('Critical validation errors found')).toBeInTheDocument()
    })

    it('displays critical issues section', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('Critical Issues:')).toBeInTheDocument()
      expect(screen.getByText('Missing required event names')).toBeInTheDocument()
      expect(screen.getByText('Invalid property types')).toBeInTheDocument()
    })

    it('displays error messages with correct count', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('3 Errors:')).toBeInTheDocument()
      expect(screen.getByText(/Event name cannot be empty/)).toBeInTheDocument()
      expect(screen.getByText(/Property type is required/)).toBeInTheDocument()
      expect(screen.getByText(/Invalid property format/)).toBeInTheDocument()
    })

    it('displays warning messages alongside errors', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('1 Recommendation:')).toBeInTheDocument()
      expect(screen.getByText(/Consider using ISO format/)).toBeInTheDocument()
    })

    it('displays events with issues summary', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('Events with Issues:')).toBeInTheDocument()
      
      // Find the events summary section specifically (the one with border-t class)
      const eventSummarySection = document.querySelector('.border-t.border-current')
      expect(eventSummarySection).toBeInTheDocument()
      
      // Check that the event badges container exists
      const badgesContainer = eventSummarySection?.querySelector('.flex.flex-wrap')
      expect(badgesContainer).toBeInTheDocument()
      
      // Check for event count badges - there should be spans with rounded-full class
      const eventBadges = badgesContainer?.querySelectorAll('.rounded-full')
      expect(eventBadges?.length).toBe(2) // user_login and product_viewed
      
      // Check for the error counts in the badges (without relying on event names)
      expect(screen.getByText('(2)')).toBeInTheDocument()
      expect(screen.getByText('(1)')).toBeInTheDocument()
      
      // Verify that the badges contain event names by checking text content
      const badge1 = eventBadges?.[0]
      const badge2 = eventBadges?.[1]
      expect(badge1?.textContent).toMatch(/user_login.*\(2\)/)
      expect(badge2?.textContent).toMatch(/product_viewed.*\(1\)/)
    })

    it('handles single error correctly', () => {
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          eventErrorCount: { 'test_event': 1 },
          criticalIssues: []
        },
        errors: [
          { field: 'test_event.name', message: 'Name is required' }
        ],
        warnings: []
      })

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('1 Error:')).toBeInTheDocument()
    })

    it('truncates error list when more than 5 errors exist', () => {
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 7,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [
          { field: 'event1.prop1', message: 'Error 1' },
          { field: 'event2.prop2', message: 'Error 2' },
          { field: 'event3.prop3', message: 'Error 3' },
          { field: 'event4.prop4', message: 'Error 4' },
          { field: 'event5.prop5', message: 'Error 5' },
          { field: 'event6.prop6', message: 'Error 6' },
          { field: 'event7.prop7', message: 'Error 7' }
        ],
        warnings: []
      })

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText(/Error 1/)).toBeInTheDocument()
      expect(screen.getByText(/Error 5/)).toBeInTheDocument()
      expect(screen.getByText(/and 2 more errors/)).toBeInTheDocument()
      expect(screen.queryByText(/Error 6/)).not.toBeInTheDocument()
    })

    it('makes error container scrollable when many errors', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      const errorContainer = document.querySelector('.max-h-32.overflow-y-auto')
      expect(errorContainer).toHaveClass('max-h-32', 'overflow-y-auto')
    })
  })

  describe('Default Status', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'unknown',
        message: 'Validation status unknown',
        canExport: false
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: true,
        summary: {
          totalErrors: 0,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [],
        warnings: []
      })
    })

    it('renders default status with correct styling and icon', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      const banner = screen.getByText('Validation Status').closest('.rounded-md')
      expect(banner).toHaveClass('bg-gray-50', 'border-gray-200', 'text-gray-800')
      
      expect(screen.getByText('ℹ️')).toBeInTheDocument()
      expect(screen.getByText('Validation status unknown')).toBeInTheDocument()
    })
  })

  describe('Component Structure and Accessibility', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'valid',
        message: 'All good',
        canExport: true
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: true,
        summary: {
          totalErrors: 0,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [],
        warnings: []
      })
    })

    it('has proper component structure', () => {
      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(screen.getByText('Validation Status')).toBeInTheDocument()
      
      // Check for flex layout structure
      const banner = screen.getByText('Validation Status').closest('.rounded-md')
      expect(banner).toHaveClass('rounded-md', 'border', 'p-4')
      
      const flexContainer = banner?.querySelector('.flex.items-start.gap-3')
      expect(flexContainer).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      render(<ValidationBanner dictionary={mockDictionary} className="custom-class" />)
      
      const banner = screen.getByText('Validation Status').closest('.rounded-md')
      expect(banner).toHaveClass('custom-class')
    })

    it('has accessible structure for screen readers', () => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'error',
        message: 'Has errors',
        canExport: false
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [
          { field: 'test.field', message: 'Test error' }
        ],
        warnings: []
      })

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      // The component doesn't explicitly use ARIA roles, but has good semantic structure
      expect(screen.getByText('Validation Status')).toBeInTheDocument()
      expect(screen.getByText('1 Error:')).toBeInTheDocument()
    })
  })

  describe('Field Name Extraction', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'error',
        message: 'Has errors',
        canExport: false
      })
    })

    it('extracts event names from field paths', () => {
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [
          { field: 'user_signup.email_address', message: 'Invalid format' }
        ],
        warnings: []
      })

      ValidationUtils.extractEventName.mockReturnValue('user_signup')

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(ValidationUtils.extractEventName).toHaveBeenCalledWith('user_signup.email_address')
      expect(screen.getByText('user_signup')).toBeInTheDocument()
    })

    it('handles field names without extractable event names', () => {
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [
          { field: 'simple_field', message: 'Error message' }
        ],
        warnings: []
      })

      ValidationUtils.extractEventName.mockReturnValue(null)

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      // Should fall back to showing the full field name
      expect(screen.getByText('simple_field')).toBeInTheDocument()
    })
  })

  describe('Message Formatting', () => {
    beforeEach(() => {
      ValidationUtils.getValidationStatus.mockReturnValue({
        status: 'error',
        message: 'Has errors',
        canExport: false
      })
      ValidationUtils.validateDictionaryForUI.mockReturnValue({
        isValid: false,
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          eventErrorCount: {},
          criticalIssues: []
        },
        errors: [
          { field: 'test.field', message: 'Raw error message' }
        ],
        warnings: []
      })
    })

    it('formats error messages using ValidationUtils', () => {
      ValidationUtils.formatErrorMessage.mockReturnValue('Formatted error message')

      render(<ValidationBanner dictionary={mockDictionary} />)
      
      expect(ValidationUtils.formatErrorMessage).toHaveBeenCalledWith('Raw error message')
      expect(screen.getByText(/Formatted error message/)).toBeInTheDocument()
    })
  })
})