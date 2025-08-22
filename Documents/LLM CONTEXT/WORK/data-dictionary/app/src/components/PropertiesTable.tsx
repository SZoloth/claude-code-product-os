/**
 * PropertiesTable component - Manages properties within an event
 */

import { useState } from 'react'
import type { EventProperty } from '../lib/schema/dataDictionary'
import ValidatedField from './ValidatedField'
import { ValidationUtils } from '../lib/schema/validationUtils'

interface PropertiesTableProps {
  properties: EventProperty[]
  onPropertiesChange: (properties: EventProperty[]) => void
  eventName: string
  className?: string
}

export default function PropertiesTable({ 
  properties, 
  onPropertiesChange, 
  eventName,
  className = '' 
}: PropertiesTableProps) {
  const [editingPropertyIndex, setEditingPropertyIndex] = useState<number | null>(null)
  const [isAddingProperty, setIsAddingProperty] = useState(false)
  
  // Create new empty property template
  const createNewProperty = (): EventProperty => ({
    name: '',
    type: 'string',
    required: false,
    example: '',
    description: ''
  })

  const [newProperty, setNewProperty] = useState<EventProperty>(createNewProperty())

  const handleAddProperty = () => {
    setIsAddingProperty(true)
    setEditingPropertyIndex(null)
    setNewProperty(createNewProperty())
  }

  const handleSaveNew = () => {
    // Validate the new property
    const existingNames = properties.map(p => p.name)
    const nameValidation = ValidationUtils.validateField('property_name', newProperty.name, { existingNames })
    
    if (!nameValidation.isValid || !newProperty.name.trim()) {
      // Don't save invalid properties - validation errors will show in the UI
      return
    }

    onPropertiesChange([...properties, newProperty])
    setIsAddingProperty(false)
    setNewProperty(createNewProperty())
  }

  const handleCancelNew = () => {
    setIsAddingProperty(false)
    setNewProperty(createNewProperty())
  }

  const handleEditProperty = (index: number) => {
    setEditingPropertyIndex(index)
    setIsAddingProperty(false)
  }

  const handleSaveEdit = (index: number, updatedProperty: EventProperty) => {
    const updatedProperties = properties.map((prop, i) => 
      i === index ? updatedProperty : prop
    )
    onPropertiesChange(updatedProperties)
    setEditingPropertyIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingPropertyIndex(null)
  }

  const handleDeleteProperty = (index: number) => {
    const propertyToDelete = properties[index]
    if (confirm(`Are you sure you want to delete the property "${propertyToDelete.name}"? This action cannot be undone.`)) {
      const updatedProperties = properties.filter((_, i) => i !== index)
      onPropertiesChange(updatedProperties)
      setEditingPropertyIndex(null)
    }
  }

  const updatePropertyField = (index: number, field: keyof EventProperty, value: any) => {
    const updatedProperties = properties.map((prop, i) => 
      i === index ? { ...prop, [field]: value } : prop
    )
    onPropertiesChange(updatedProperties)
  }

  const updateNewPropertyField = (field: keyof EventProperty, value: any) => {
    setNewProperty(prev => ({ ...prev, [field]: value }))
  }

  // Get existing property names for validation
  const existingPropertyNames = properties.map(p => p.name)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Properties for: <code className="text-blue-600 dark:text-blue-400">{eventName}</code>
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {properties.length} properties configured
          </p>
        </div>
        <button
          onClick={handleAddProperty}
          disabled={isAddingProperty}
          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          + Add Property
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="table-container">
          <table className="data-table" role="table" aria-label={`Properties for ${eventName}`}>
            <thead>
              <tr>
                <th scope="col" className="w-32">Property Name</th>
                <th scope="col" className="w-24">Type</th>
                <th scope="col" className="w-20">Required</th>
                <th scope="col" className="w-32">Example</th>
                <th scope="col" className="w-48">Description</th>
                <th scope="col" className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* New Property Row */}
              {isAddingProperty && (
                <tr className="bg-green-50 dark:bg-green-900/20">
                  <td>
                    <ValidatedField
                      fieldName="property_name"
                      value={newProperty.name}
                      onChange={(value) => updateNewPropertyField('name', value)}
                      label=""
                      placeholder="e.g., user_id"
                      context={{ existingNames: existingPropertyNames }}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      type="select"
                      fieldName="property_type"
                      value={newProperty.type}
                      onChange={(value) => updateNewPropertyField('type', value)}
                      label=""
                      options={['string', 'number', 'boolean', 'enum', 'object', 'array', 'datetime']}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProperty.required}
                        onChange={(e) => updateNewPropertyField('required', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {newProperty.required ? 'Required' : 'Optional'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={typeof newProperty.example === 'string' ? newProperty.example : (newProperty.example || '').toString()}
                      onChange={(e) => updateNewPropertyField('example', e.target.value)}
                      placeholder="Sample value"
                      className="field-input text-sm w-full"
                    />
                  </td>
                  <td>
                    <textarea
                      value={newProperty.description || ''}
                      onChange={(e) => updateNewPropertyField('description', e.target.value)}
                      placeholder="What does this property represent?"
                      rows={2}
                      className="field-textarea text-sm w-full"
                    />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveNew}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                        title="Save property"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelNew}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing Properties */}
              {properties.map((property, index) => (
                <PropertyRow
                  key={`${property.name}-${index}`}
                  property={property}
                  isEditing={editingPropertyIndex === index}
                  onEdit={() => handleEditProperty(index)}
                  onSave={(updatedProperty) => handleSaveEdit(index, updatedProperty)}
                  onCancel={handleCancelEdit}
                  onDelete={() => handleDeleteProperty(index)}
                  onFieldChange={(field, value) => updatePropertyField(index, field, value)}
                  existingPropertyNames={existingPropertyNames.filter((_, i) => i !== index)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="md:hidden space-y-3">
        {/* New Property Card */}
        {isAddingProperty && (
          <div className="border-2 border-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="font-medium text-green-900 dark:text-green-100">New Property</h5>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNew}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelNew}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <PropertyCard
                property={newProperty}
                isEditing={true}
                onFieldChange={(field, value) => updateNewPropertyField(field, value)}
                existingPropertyNames={existingPropertyNames}
              />
            </div>
          </div>
        )}

        {/* Existing Property Cards */}
        {properties.map((property, index) => (
          <PropertyCard
            key={`${property.name}-${index}`}
            property={property}
            isEditing={editingPropertyIndex === index}
            onEdit={() => handleEditProperty(index)}
            onSave={(updatedProperty) => handleSaveEdit(index, updatedProperty)}
            onCancel={handleCancelEdit}
            onDelete={() => handleDeleteProperty(index)}
            onFieldChange={(field, value) => updatePropertyField(index, field, value)}
            existingPropertyNames={existingPropertyNames.filter((_, i) => i !== index)}
          />
        ))}
      </div>

      {/* Empty State */}
      {properties.length === 0 && !isAddingProperty && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-3">🏷️</div>
            <h4 className="text-md font-medium mb-2">No properties yet</h4>
            <p className="text-sm mb-4">Add properties to capture context for this event</p>
            <button
              onClick={handleAddProperty}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Add Your First Property
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate component for table rows to manage editing state
interface PropertyRowProps {
  property: EventProperty
  isEditing: boolean
  onEdit: () => void
  onSave: (property: EventProperty) => void
  onCancel: () => void
  onDelete: () => void
  onFieldChange: (field: keyof EventProperty, value: any) => void
  existingPropertyNames: string[]
}

function PropertyRow({
  property,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onFieldChange,
  existingPropertyNames
}: PropertyRowProps) {
  if (isEditing) {
    return (
      <tr className="bg-yellow-50 dark:bg-yellow-900/20">
        <td>
          <ValidatedField
            fieldName="property_name"
            value={property.name}
            onChange={(value) => onFieldChange('name', value)}
            label=""
            context={{ existingNames: existingPropertyNames }}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            type="select"
            fieldName="property_type"
            value={property.type}
            onChange={(value) => onFieldChange('type', value)}
            label=""
            options={['string', 'number', 'boolean', 'enum', 'object', 'array', 'datetime']}
            className="m-0"
          />
        </td>
        <td>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={property.required}
              onChange={(e) => onFieldChange('required', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {property.required ? 'Required' : 'Optional'}
            </span>
          </label>
        </td>
        <td>
          <input
            type="text"
            value={typeof property.example === 'string' ? property.example : (property.example || '').toString()}
            onChange={(e) => onFieldChange('example', e.target.value)}
            className="field-input text-sm w-full"
          />
        </td>
        <td>
          <textarea
            value={property.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            rows={2}
            className="field-textarea text-sm w-full"
          />
        </td>
        <td>
          <div className="flex gap-1">
            <button
              onClick={() => onSave(property)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
              title="Save changes"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 text-sm"
              title="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td>
        <code className="text-sm font-mono text-purple-600 dark:text-purple-400">
          {property.name}
        </code>
      </td>
      <td>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          property.type === 'string' ? 'bg-blue-100 text-blue-800' :
          property.type === 'number' ? 'bg-green-100 text-green-800' :
          property.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
          property.type === 'datetime' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {property.type}
        </span>
      </td>
      <td>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          property.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {property.required ? 'Required' : 'Optional'}
        </span>
      </td>
      <td>
        <code className="text-sm text-gray-600 dark:text-gray-400">
          {property.example ? (typeof property.example === 'string' ? property.example : property.example.toString()) : <span className="text-gray-400 italic">No example</span>}
        </code>
      </td>
      <td>
        <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
          {property.description || <span className="text-gray-400 italic">No description</span>}
        </div>
      </td>
      <td>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Edit property"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Delete property"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// Mobile card component
interface PropertyCardProps {
  property: EventProperty
  isEditing: boolean
  onEdit?: () => void
  onSave?: (property: EventProperty) => void
  onCancel?: () => void
  onDelete?: () => void
  onFieldChange: (field: keyof EventProperty, value: any) => void
  existingPropertyNames: string[]
}

function PropertyCard({
  property,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onFieldChange,
  existingPropertyNames
}: PropertyCardProps) {
  return (
    <div className={`border rounded-lg p-3 ${
      isEditing ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : 
      'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
    }`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            {isEditing ? (
              <ValidatedField
                fieldName="property_name"
                value={property.name}
                onChange={(value) => onFieldChange('name', value)}
                label="Property Name"
                context={{ existingNames: existingPropertyNames }}
              />
            ) : (
              <code className="text-md font-mono text-purple-600 dark:text-purple-400">
                {property.name}
              </code>
            )}
          </div>
          {!isEditing && onEdit && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          )}
          {isEditing && onSave && onCancel && (
            <div className="flex gap-2">
              <button
                onClick={() => onSave(property)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Type and Required */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            {isEditing ? (
              <ValidatedField
                type="select"
                fieldName="property_type"
                value={property.type}
                onChange={(value) => onFieldChange('type', value)}
                label="Type"
                options={['string', 'number', 'boolean', 'enum', 'object', 'array', 'datetime']}
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Type
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  property.type === 'string' ? 'bg-blue-100 text-blue-800' :
                  property.type === 'number' ? 'bg-green-100 text-green-800' :
                  property.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                  property.type === 'datetime' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.type}
                </span>
              </div>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Required
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={property.required}
                    onChange={(e) => onFieldChange('required', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {property.required ? 'Required' : 'Optional'}
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Required
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  property.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.required ? 'Required' : 'Optional'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Example */}
        <div>
          {isEditing ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Example
              </label>
              <input
                type="text"
                value={typeof property.example === 'string' ? property.example : (property.example || '').toString()}
                onChange={(e) => onFieldChange('example', e.target.value)}
                placeholder="Sample value"
                className="field-input text-sm w-full"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Example
              </label>
              <code className="text-sm text-gray-600 dark:text-gray-400">
                {property.example ? (typeof property.example === 'string' ? property.example : property.example.toString()) : <span className="text-gray-400 italic">No example</span>}
              </code>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          {isEditing ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={property.description || ''}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="What does this property represent?"
                rows={2}
                className="field-textarea text-sm w-full"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {property.description || <span className="text-gray-400 italic">No description</span>}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}