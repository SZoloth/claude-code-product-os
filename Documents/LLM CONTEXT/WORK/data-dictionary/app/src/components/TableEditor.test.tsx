/**
 * Comprehensive tests for TableEditor component
 * Tests desktop table view, mobile cards, accessibility, and responsiveness
 */

import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import TableEditor from './TableEditor'

describe('TableEditor', () => {
  describe('Component Rendering', () => {
    it('renders the main component with proper heading', () => {
      render(<TableEditor />)
      
      expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument()
      expect(screen.getByText('Manage your event definitions and properties')).toBeInTheDocument()
    })

    it('renders placeholder note explaining current functionality', () => {
      render(<TableEditor />)
      
      const note = screen.getByText(/This is a preview of the table editor component/)
      expect(note).toBeInTheDocument()
      expect(screen.getByText(/Full editing functionality will be implemented in Task 5.x/)).toBeInTheDocument()
    })
  })

  describe('Events Table (Desktop View)', () => {
    it('renders events table with proper structure and accessibility', () => {
      render(<TableEditor />)
      
      // Check table exists with proper accessibility
      const eventsTable = screen.getByRole('table', { name: 'Event definitions' })
      expect(eventsTable).toBeInTheDocument()
      
      // Check table headers specifically within the events table
      expect(screen.getByRole('columnheader', { name: 'Event Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
      
      // Check that Type column exists (there will be multiple due to properties table)
      const typeHeaders = screen.getAllByRole('columnheader', { name: 'Type' })
      expect(typeHeaders.length).toBeGreaterThan(0)
      
      // Check other headers that might be duplicated
      const statusHeaders = screen.getAllByRole('columnheader', { name: 'Status' })
      const descriptionHeaders = screen.getAllByRole('columnheader', { name: 'Description' })
      expect(statusHeaders.length).toBeGreaterThan(0)
      expect(descriptionHeaders.length).toBeGreaterThan(0)
    })

    it('displays mock events with correct data', () => {
      render(<TableEditor />)
      
      // Check first event (product_viewed) - should appear in both desktop and mobile views
      const productViewedInputs = screen.getAllByDisplayValue('product_viewed')
      expect(productViewedInputs.length).toBeGreaterThan(0)
      
      const productViewedDescriptions = screen.getAllByDisplayValue('User views a product detail page')
      expect(productViewedDescriptions.length).toBeGreaterThan(0)
      
      // Check second event (checkout_completed) - should appear in both desktop and mobile views
      const checkoutCompletedInputs = screen.getAllByDisplayValue('checkout_completed')
      expect(checkoutCompletedInputs.length).toBeGreaterThan(0)
      
      const checkoutDescriptions = screen.getAllByDisplayValue('User successfully completes checkout process')
      expect(checkoutDescriptions.length).toBeGreaterThan(0)
    })

    it('renders form controls with proper attributes', () => {
      render(<TableEditor />)
      
      // Check event name inputs are readonly
      const eventNameInputs = screen.getAllByLabelText(/Event name for/)
      eventNameInputs.forEach(input => {
        expect(input).toHaveAttribute('readonly')
      })
      
      // Check event type selects are disabled
      const eventTypeSelects = screen.getAllByLabelText(/Event type for/)
      eventTypeSelects.forEach(select => {
        expect(select).toBeDisabled()
      })
      
      // Check description textareas are readonly
      const descriptionTextareas = screen.getAllByLabelText(/Description for/)
      descriptionTextareas.forEach(textarea => {
        expect(textarea).toHaveAttribute('readonly')
      })
    })

    it('displays event types with correct options', () => {
      render(<TableEditor />)
      
      const eventTypeSelects = screen.getAllByLabelText(/Event type for/)
      
      // Check that selects have the right options
      eventTypeSelects.forEach(select => {
        expect(select).toContainHTML('<option value="intent">Intent</option>')
        expect(select).toContainHTML('<option value="success">Success</option>')
        expect(select).toContainHTML('<option value="failure">Failure</option>')
      })
    })

    it('displays lifecycle status with proper styling', () => {
      render(<TableEditor />)
      
      const statusElements = screen.getAllByText('active')
      statusElements.forEach(element => {
        expect(element).toHaveClass('status-required')
      })
    })

    it('renders edit buttons with proper accessibility labels', () => {
      render(<TableEditor />)
      
      expect(screen.getByRole('button', { name: 'Edit product_viewed' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit checkout_completed' })).toBeInTheDocument()
    })
  })

  describe('Mobile Cards View', () => {
    it('renders mobile cards with proper structure', () => {
      render(<TableEditor />)
      
      // Mobile cards should contain the same event data
      expect(screen.getAllByDisplayValue('product_viewed')).toHaveLength(2) // Desktop + mobile
      expect(screen.getAllByDisplayValue('checkout_completed')).toHaveLength(2) // Desktop + mobile
    })

    it('displays mobile card labels correctly', () => {
      render(<TableEditor />)
      
      // Check for mobile-specific labels
      const eventNameLabels = screen.getAllByText('Event Name')
      const typeLabels = screen.getAllByText('Type')
      const statusLabels = screen.getAllByText('Status')
      const descriptionLabels = screen.getAllByText('Description')
      
      // Should have labels for mobile cards
      expect(eventNameLabels.length).toBeGreaterThan(0)
      expect(typeLabels.length).toBeGreaterThan(0)
      expect(statusLabels.length).toBeGreaterThan(0)
      expect(descriptionLabels.length).toBeGreaterThan(0)
    })

    it('renders mobile edit buttons', () => {
      render(<TableEditor />)
      
      const mobileEditButtons = screen.getAllByText('Edit Event')
      expect(mobileEditButtons).toHaveLength(2) // One for each mock event
    })
  })

  describe('Properties Table', () => {
    it('renders properties section with proper heading', () => {
      render(<TableEditor />)
      
      expect(screen.getByRole('heading', { name: 'Properties for: product_viewed' })).toBeInTheDocument()
    })

    it('renders properties table with proper structure', () => {
      render(<TableEditor />)
      
      const propertiesTable = screen.getByRole('table', { name: 'Event properties' })
      expect(propertiesTable).toBeInTheDocument()
      
      // Check properties table headers (some are unique to this table)
      expect(screen.getByRole('columnheader', { name: 'Property Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Required' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Example' })).toBeInTheDocument()
      
      // Check that Type and Description headers exist (but may be duplicated across tables)
      const typeHeaders = screen.getAllByRole('columnheader', { name: 'Type' })
      const descriptionHeaders = screen.getAllByRole('columnheader', { name: 'Description' })
      expect(typeHeaders.length).toBeGreaterThan(0)
      expect(descriptionHeaders.length).toBeGreaterThan(0)
    })

    it('displays mock properties with correct data', () => {
      render(<TableEditor />)
      
      // Check first property (product_id)
      expect(screen.getByDisplayValue('product_id')).toBeInTheDocument()
      expect(screen.getByDisplayValue('prod_123')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Unique product identifier')).toBeInTheDocument()
      
      // Check second property (category)
      expect(screen.getByDisplayValue('category')).toBeInTheDocument()
      expect(screen.getByDisplayValue('electronics')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Product category')).toBeInTheDocument()
    })

    it('displays property types with correct options', () => {
      render(<TableEditor />)
      
      // Properties table should have type selects with proper options
      const propertyTypeSelects = screen.getAllByRole('combobox')
      const propertiesTypeSelects = propertyTypeSelects.filter(select => 
        select.closest('table')?.getAttribute('aria-label') === 'Event properties'
      )
      
      propertiesTypeSelects.forEach(select => {
        expect(select).toContainHTML('<option value="string">String</option>')
        expect(select).toContainHTML('<option value="number">Number</option>')
        expect(select).toContainHTML('<option value="boolean">Boolean</option>')
        expect(select).toContainHTML('<option value="array">Array</option>')
        expect(select).toContainHTML('<option value="object">Object</option>')
      })
    })

    it('displays required/optional status with proper styling', () => {
      const { container } = render(<TableEditor />)
      
      // Find the properties table and search within it
      const propertiesTable = container.querySelector('table[aria-label="Event properties"]') as HTMLElement
      
      // Find status elements within the properties table
      const requiredStatus = propertiesTable?.querySelector('.status-required')
      const optionalStatus = propertiesTable?.querySelector('.status-optional')
      
      // Verify they exist and have the correct text and classes
      expect(requiredStatus).toBeInTheDocument()
      expect(requiredStatus).toHaveTextContent('Required')
      expect(requiredStatus).toHaveClass('status-required')
      
      expect(optionalStatus).toBeInTheDocument()
      expect(optionalStatus).toHaveTextContent('Optional')
      expect(optionalStatus).toHaveClass('status-optional')
    })

    it('renders all property inputs as readonly and selects as disabled', () => {
      render(<TableEditor />)
      
      // Check that property name inputs are readonly
      expect(screen.getByDisplayValue('product_id')).toHaveAttribute('readonly')
      expect(screen.getByDisplayValue('category')).toHaveAttribute('readonly')
      
      // Check that example inputs are readonly
      expect(screen.getByDisplayValue('prod_123')).toHaveAttribute('readonly')
      expect(screen.getByDisplayValue('electronics')).toHaveAttribute('readonly')
      
      // Check that description inputs are readonly
      expect(screen.getByDisplayValue('Unique product identifier')).toHaveAttribute('readonly')
      expect(screen.getByDisplayValue('Product category')).toHaveAttribute('readonly')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for tables', () => {
      render(<TableEditor />)
      
      expect(screen.getByRole('table', { name: 'Event definitions' })).toBeInTheDocument()
      expect(screen.getByRole('table', { name: 'Event properties' })).toBeInTheDocument()
    })

    it('has proper column headers with scope attributes', () => {
      render(<TableEditor />)
      
      // All column headers should be accessible
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders.length).toBeGreaterThan(0)
      
      columnHeaders.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col')
      })
    })

    it('has descriptive ARIA labels for form controls', () => {
      render(<TableEditor />)
      
      // Check event-specific labels
      expect(screen.getByLabelText('Event name for product_viewed')).toBeInTheDocument()
      expect(screen.getByLabelText('Event type for product_viewed')).toBeInTheDocument()
      expect(screen.getByLabelText('Description for product_viewed')).toBeInTheDocument()
      
      expect(screen.getByLabelText('Event name for checkout_completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Event type for checkout_completed')).toBeInTheDocument()
      expect(screen.getByLabelText('Description for checkout_completed')).toBeInTheDocument()
    })

    it('has proper button labels for actions', () => {
      render(<TableEditor />)
      
      expect(screen.getByRole('button', { name: 'Edit product_viewed' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit checkout_completed' })).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('shows desktop table by default (hidden class on mobile)', () => {
      render(<TableEditor />)
      
      const desktopTable = screen.getByRole('table', { name: 'Event definitions' })
      const tableContainer = desktopTable.closest('.table-container')
      
      expect(tableContainer).toHaveClass('hidden', 'sm:block')
    })

    it('shows mobile cards with responsive classes', () => {
      render(<TableEditor />)
      
      // Mobile cards container should have responsive hiding class
      const editEventButton = screen.getAllByText('Edit Event')[0] // Get first one
      const mobileContainer = editEventButton.closest('.sm\\:hidden')
      expect(mobileContainer).toHaveClass('sm:hidden')
    })

    it('mobile cards have proper grid layout', () => {
      render(<TableEditor />)
      
      // Check that mobile cards use grid layout for type and status
      // Look for Type label in mobile view and find its grid container
      const typeLabels = screen.getAllByText('Type')
      let gridContainer = null
      
      // Find the Type label that's in a mobile card (not in table header)
      for (const label of typeLabels) {
        const container = label.closest('.grid')
        if (container) {
          gridContainer = container
          break
        }
      }
      
      expect(gridContainer).toBeTruthy()
      if (gridContainer) {
        expect(gridContainer).toHaveClass('grid', 'grid-cols-2', 'gap-3')
      }
    })
  })

  describe('Component State', () => {
    it('renders with static mock data consistently', () => {
      render(<TableEditor />)
      
      // Check that both events are always rendered (may appear multiple times due to desktop/mobile views)
      expect(screen.getAllByDisplayValue('product_viewed').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('checkout_completed').length).toBeGreaterThan(0)
      
      // Check that both properties are always rendered
      expect(screen.getByDisplayValue('product_id')).toBeInTheDocument()
      expect(screen.getByDisplayValue('category')).toBeInTheDocument()
    })

    it('maintains readonly/disabled state for all form controls', () => {
      render(<TableEditor />)
      
      // All text inputs should be readonly
      const textInputs = screen.getAllByRole('textbox')
      textInputs.forEach(input => {
        expect(input).toHaveAttribute('readonly')
      })
      
      // All selects should be disabled  
      const selects = screen.getAllByRole('combobox')
      selects.forEach(select => {
        expect(select).toBeDisabled()
      })
    })
  })

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to main sections', () => {
      render(<TableEditor />)
      
      // Check main container class
      const mainContainer = screen.getByText('Events').closest('.content-section-lg')
      expect(mainContainer).toHaveClass('content-section-lg')
    })

    it('applies correct field classes to form controls', () => {
      render(<TableEditor />)
      
      // Check input field classes (get first occurrence)
      const eventNameInputs = screen.getAllByDisplayValue('product_viewed')
      expect(eventNameInputs[0]).toHaveClass('field-input', 'text-sm')
      
      // Check select field classes
      const eventTypeSelect = screen.getByLabelText('Event type for product_viewed')
      expect(eventTypeSelect).toHaveClass('field-select', 'text-sm')
      
      // Check textarea classes (get first occurrence)
      const descriptionTextareas = screen.getAllByDisplayValue('User views a product detail page')
      expect(descriptionTextareas[0]).toHaveClass('field-textarea', 'text-sm')
    })

    it('applies correct status indicator classes', () => {
      const { container } = render(<TableEditor />)
      
      // Check all status classes exist in the document
      const statusRequiredElements = container.querySelectorAll('.status-required')
      const statusOptionalElements = container.querySelectorAll('.status-optional')
      
      // Should find at least one of each
      expect(statusRequiredElements.length).toBeGreaterThan(0)
      expect(statusOptionalElements.length).toBeGreaterThan(0)
      
      // Check that status-required elements have the right content
      const requiredFound = Array.from(statusRequiredElements).some(el => 
        el.textContent === 'Required' || el.textContent === 'active'
      )
      expect(requiredFound).toBe(true)
      
      // Check that status-optional elements have the right content  
      const optionalFound = Array.from(statusOptionalElements).some(el => 
        el.textContent === 'Optional'
      )
      expect(optionalFound).toBe(true)
    })
  })
})