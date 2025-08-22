/**
 * Comprehensive tests for ValidatedField component
 * Tests validation feedback, field types, suggestions, and accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ValidatedField from './ValidatedField'

// Mock the ValidationUtils
jest.mock('../lib/schema/validationUtils', () => ({
  ValidationUtils: {
    validateField: jest.fn(),
    suggestSnakeCase: jest.fn()
  }
}))

const { ValidationUtils } = require('../lib/schema/validationUtils')

describe('ValidatedField', () => {
  const defaultProps = {
    fieldName: 'test_field',
    value: '',
    onChange: jest.fn(),
    label: 'Test Field'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ValidationUtils.validateField.mockReturnValue({
      isValid: true,
      error: null,
      warning: null
    })
    ValidationUtils.suggestSnakeCase.mockImplementation((input: string) => 
      input.toLowerCase().replace(/\s+/g, '_')
    )
  })

  describe('Basic Rendering', () => {
    it('renders input field with label', () => {
      render(<ValidatedField {...defaultProps} />)
      
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders textarea when type is textarea', () => {
      render(<ValidatedField {...defaultProps} type="textarea" rows={5} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea.tagName).toBe('TEXTAREA')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('renders select when type is select with options', () => {
      const options = ['option1', 'option2', 'option3']
      render(<ValidatedField {...defaultProps} type="select" options={options} />)
      
      const select = screen.getByRole('combobox')
      expect(select.tagName).toBe('SELECT')
      
      expect(screen.getByText('Select test field')).toBeInTheDocument()
      expect(screen.getByText('Option1')).toBeInTheDocument()
      expect(screen.getByText('Option2')).toBeInTheDocument()
      expect(screen.getByText('Option3')).toBeInTheDocument()
    })

    it('applies default textarea rows when not specified', () => {
      render(<ValidatedField {...defaultProps} type="textarea" />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '3')
    })

    it('displays placeholder when provided', () => {
      render(<ValidatedField {...defaultProps} placeholder="Enter value here" />)
      
      expect(screen.getByPlaceholderText('Enter value here')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<ValidatedField {...defaultProps} className="custom-class" />)
      
      const container = screen.getByLabelText('Test Field').closest('.custom-class')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Required Field Handling', () => {
    it('shows required asterisk when required is true', () => {
      render(<ValidatedField {...defaultProps} required />)
      
      const requiredMarker = screen.getByLabelText('required')
      expect(requiredMarker).toHaveTextContent('*')
      expect(requiredMarker).toHaveClass('text-red-500', 'ml-1')
    })

    it('does not show required asterisk when required is false', () => {
      render(<ValidatedField {...defaultProps} required={false} />)
      
      expect(screen.queryByLabelText('required')).not.toBeInTheDocument()
    })
  })

  describe('Validation Feedback', () => {
    it('shows error message when validation fails', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Field value is invalid',
        warning: null
      })

      render(<ValidatedField {...defaultProps} value="invalid_value" />)
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Field value is invalid')
      expect(errorMessage).toHaveClass('text-red-600', 'text-xs')
      expect(errorMessage).toHaveAttribute('id', 'test_field-error')
    })

    it('shows warning message when validation has warning', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: true,
        error: null,
        warning: 'Consider improving this field'
      })

      render(<ValidatedField {...defaultProps} value="warning_value" />)
      
      const warningMessage = screen.getByRole('alert')
      expect(warningMessage).toHaveTextContent('Consider improving this field')
      expect(warningMessage).toHaveClass('text-yellow-600', 'text-xs')
    })

    it('applies error styles to field when invalid', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Invalid field',
        warning: null
      })

      render(<ValidatedField {...defaultProps} value="invalid" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'border-red-300',
        'focus:border-red-500',
        'focus:ring-red-500'
      )
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'test_field-error')
    })

    it('applies warning styles to field when has warning', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: true,
        error: null,
        warning: 'Warning message'
      })

      render(<ValidatedField {...defaultProps} value="warning" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'border-yellow-300',
        'focus:border-yellow-500',
        'focus:ring-yellow-500'
      )
    })

    it('applies base styles when field is valid', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: true,
        error: null,
        warning: null
      })

      render(<ValidatedField {...defaultProps} value="valid" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('field-input', 'text-sm')
      expect(input).not.toHaveClass('border-red-300', 'border-yellow-300')
      expect(input).toHaveAttribute('aria-invalid', 'false')
      expect(input).not.toHaveAttribute('aria-describedby')
    })
  })

  describe('Snake Case Suggestions', () => {
    it('shows suggestion for event_name field with invalid format', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Use snake_case format',
        warning: null
      })
      ValidationUtils.suggestSnakeCase.mockReturnValue('user_login')

      render(<ValidatedField {...defaultProps} fieldName="event_name" value="UserLogin" />)
      
      expect(screen.getByText('Suggested:')).toBeInTheDocument()
      expect(screen.getByText('user_login')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
    })

    it('shows suggestion for property_name field with invalid format', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Use snake_case format',
        warning: null
      })
      ValidationUtils.suggestSnakeCase.mockReturnValue('user_id')

      render(<ValidatedField {...defaultProps} fieldName="property_name" value="UserId" />)
      
      expect(screen.getByText('Suggested:')).toBeInTheDocument()
      expect(screen.getByText('user_id')).toBeInTheDocument()
    })

    it('does not show suggestion when field is valid', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: true,
        error: null,
        warning: null
      })

      render(<ValidatedField {...defaultProps} fieldName="event_name" value="user_login" />)
      
      expect(screen.queryByText('Suggested:')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument()
    })

    it('does not show suggestion for non-naming fields', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Some error',
        warning: null
      })

      render(<ValidatedField {...defaultProps} fieldName="other_field" value="SomeValue" />)
      
      expect(screen.queryByText('Suggested:')).not.toBeInTheDocument()
    })

    it('does not show suggestion when suggestion equals current value', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Some error',
        warning: null
      })
      ValidationUtils.suggestSnakeCase.mockReturnValue('user_login')

      render(<ValidatedField {...defaultProps} fieldName="event_name" value="user_login" />)
      
      expect(screen.queryByText('Suggested:')).not.toBeInTheDocument()
    })

    it('applies suggestion when Apply button is clicked', async () => {
      const user = userEvent.setup()
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Use snake_case format',
        warning: null
      })
      ValidationUtils.suggestSnakeCase.mockReturnValue('user_login')

      render(<ValidatedField {...defaultProps} fieldName="event_name" value="UserLogin" />)
      
      const applyButton = screen.getByRole('button', { name: 'Apply' })
      await user.click(applyButton)
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('user_login')
    })

    it('does not show suggestion when value is empty', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Field is required',
        warning: null
      })

      render(<ValidatedField {...defaultProps} fieldName="event_name" value="" />)
      
      expect(screen.queryByText('Suggested:')).not.toBeInTheDocument()
    })
  })

  describe('Help Text Display', () => {
    it('shows help text for event_name field', () => {
      render(<ValidatedField {...defaultProps} fieldName="event_name" />)
      
      expect(screen.getByText('Use snake_case format (e.g., user_login, product_viewed)')).toBeInTheDocument()
    })

    it('shows help text for property_name field', () => {
      render(<ValidatedField {...defaultProps} fieldName="property_name" />)
      
      expect(screen.getByText('Use snake_case format (e.g., user_id, product_category)')).toBeInTheDocument()
    })

    it('shows help text for event_purpose field', () => {
      render(<ValidatedField {...defaultProps} fieldName="event_purpose" />)
      
      expect(screen.getByText(/Explain the business value.*20-500 characters/)).toBeInTheDocument()
    })

    it('does not show help text for other fields', () => {
      render(<ValidatedField {...defaultProps} fieldName="other_field" />)
      
      expect(screen.queryByText(/snake_case format/)).not.toBeInTheDocument()
      expect(screen.queryByText(/business value/)).not.toBeInTheDocument()
    })
  })

  describe('User Interaction', () => {
    it('calls onChange when user types in input', async () => {
      const user = userEvent.setup()
      render(<ValidatedField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      // userEvent.type calls onChange for each character: 't', 'e', 's', 't'
      expect(defaultProps.onChange).toHaveBeenCalledTimes(4)
      expect(defaultProps.onChange).toHaveBeenLastCalledWith('t')
    })

    it('calls onChange when user types in textarea', async () => {
      const user = userEvent.setup()
      render(<ValidatedField {...defaultProps} type="textarea" />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'abc')
      
      // userEvent.type calls onChange for each character
      expect(defaultProps.onChange).toHaveBeenCalledTimes(3)
      expect(defaultProps.onChange).toHaveBeenLastCalledWith('c')
    })

    it('calls onChange when user selects option', async () => {
      const user = userEvent.setup()
      const options = ['option1', 'option2']
      render(<ValidatedField {...defaultProps} type="select" options={options} />)
      
      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'option1')
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('option1')
    })

    it('updates validation state when value changes', async () => {
      const user = userEvent.setup()
      
      // Initial validation
      ValidationUtils.validateField.mockReturnValueOnce({
        isValid: true,
        error: null,
        warning: null
      })

      const { rerender } = render(<ValidatedField {...defaultProps} value="" />)
      
      // Update validation for new value
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Field is required',
        warning: null
      })

      rerender(<ValidatedField {...defaultProps} value="invalid" />)
      
      expect(ValidationUtils.validateField).toHaveBeenCalledWith('test_field', 'invalid', undefined)
      expect(screen.getByRole('alert')).toHaveTextContent('Field is required')
    })
  })

  describe('Field Attributes and Accessibility', () => {
    it('sets correct field attributes', () => {
      render(<ValidatedField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'test_field')
      expect(input).toHaveAttribute('name', 'test_field')
      expect(input).toHaveAttribute('value', '')
    })

    it('has proper label association', () => {
      render(<ValidatedField {...defaultProps} />)
      
      const label = screen.getByText('Test Field')
      expect(label).toHaveAttribute('for', 'test_field')
      
      const input = screen.getByLabelText('Test Field')
      expect(input).toBeInTheDocument()
    })

    it('sets aria-describedby when field has error', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Error message',
        warning: null
      })

      render(<ValidatedField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test_field-error')
    })

    it('does not set aria-describedby when field is valid', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: true,
        error: null,
        warning: null
      })

      render(<ValidatedField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('aria-describedby')
    })

    it('sets aria-invalid correctly based on validation', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Error',
        warning: null
      })

      render(<ValidatedField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Select Field Options Formatting', () => {
    it('formats select option labels correctly', () => {
      const options = ['snake_case_option', 'another_option']
      render(<ValidatedField {...defaultProps} type="select" options={options} />)
      
      // The replace('_', ' ') only replaces the first underscore, so we get "Snake Case_option"
      expect(screen.getByText('Snake Case_option')).toBeInTheDocument()
      expect(screen.getByText('Another Option')).toBeInTheDocument()
    })

    it('capitalizes first letter of each word in select options', () => {
      const options = ['user_login', 'product_viewed']
      render(<ValidatedField {...defaultProps} type="select" options={options} />)
      
      expect(screen.getByText('User Login')).toBeInTheDocument()
      expect(screen.getByText('Product Viewed')).toBeInTheDocument()
    })
  })

  describe('Context Handling', () => {
    it('passes context to validation function', () => {
      const context = { existingNames: ['event1', 'event2'] }
      render(<ValidatedField {...defaultProps} context={context} />)
      
      expect(ValidationUtils.validateField).toHaveBeenCalledWith('test_field', '', context)
    })

    it('updates validation when context changes', () => {
      const { rerender } = render(<ValidatedField {...defaultProps} context={{ test: 1 }} />)
      
      rerender(<ValidatedField {...defaultProps} context={{ test: 2 }} />)
      
      expect(ValidationUtils.validateField).toHaveBeenCalledWith('test_field', '', { test: 2 })
    })
  })

  describe('Edge Cases', () => {
    it('handles null suggestion gracefully', () => {
      ValidationUtils.validateField.mockReturnValue({
        isValid: false,
        error: 'Error',
        warning: null
      })
      ValidationUtils.suggestSnakeCase.mockReturnValue(null)

      render(<ValidatedField {...defaultProps} fieldName="event_name" value="Invalid" />)
      
      expect(screen.queryByText('Suggested:')).not.toBeInTheDocument()
    })

    it('handles undefined options for select field', () => {
      render(<ValidatedField {...defaultProps} type="select" />)
      
      const select = screen.getByRole('combobox')
      expect(select.children).toHaveLength(1) // Only the default "Select..." option
    })

    it('re-validates on field name change', () => {
      const { rerender } = render(<ValidatedField {...defaultProps} fieldName="field1" />)
      
      rerender(<ValidatedField {...defaultProps} fieldName="field2" />)
      
      expect(ValidationUtils.validateField).toHaveBeenCalledWith('field2', '', undefined)
    })
  })
})