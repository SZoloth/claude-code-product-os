/**
 * EventsTable component - Full-featured events editor with add/edit/delete functionality
 */

import { useState } from 'react'
import type { DataDictionaryEvent, EventType, EventActionType, LifecycleStatus } from '../lib/schema/dataDictionary'
import ValidatedField from './ValidatedField'
import PropertiesTable from './PropertiesTable'
import ContextKeysSelector from './ContextKeysSelector'
import { ValidationUtils } from '../lib/schema/validationUtils'

interface EventsTableProps {
  events: DataDictionaryEvent[]
  onEventsChange: (events: DataDictionaryEvent[]) => void
  className?: string
}

export default function EventsTable({ events, onEventsChange, className = '' }: EventsTableProps) {
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  
  // Create new empty event template
  const createNewEvent = (): DataDictionaryEvent => ({
    event_name: '',
    event_type: 'intent' as EventType,
    event_action_type: 'action' as EventActionType,
    event_purpose: '',
    when_to_fire: '',
    actor: '',
    object: '',
    context_surface: '',
    properties: [],
    lifecycle_status: 'proposed' as LifecycleStatus,
    datadog_api: 'addAction'
  })

  const [newEvent, setNewEvent] = useState<DataDictionaryEvent>(createNewEvent())

  const handleAddEvent = () => {
    setIsAddingEvent(true)
    setEditingEventId(null)
    setNewEvent(createNewEvent())
  }

  const handleSaveNew = () => {
    // Validate the new event
    const validation = ValidationUtils.validateEventForUI(newEvent)
    const existingNames = events.map(e => e.event_name)
    const nameValidation = ValidationUtils.validateField('event_name', newEvent.event_name, { existingNames })
    
    if (!nameValidation.isValid || !validation.isValid) {
      // Don't save invalid events - validation errors will show in the UI
      return
    }

    const eventWithId = {
      ...newEvent,
      event_name: newEvent.event_name || `event_${Date.now()}`
    }

    onEventsChange([...events, eventWithId])
    setIsAddingEvent(false)
    setNewEvent(createNewEvent())
  }

  const handleCancelNew = () => {
    setIsAddingEvent(false)
    setNewEvent(createNewEvent())
  }

  const handleEditEvent = (eventName: string) => {
    setEditingEventId(eventName)
    setIsAddingEvent(false)
  }

  const handleSaveEdit = (eventName: string, updatedEvent: DataDictionaryEvent) => {
    const updatedEvents = events.map(event => 
      event.event_name === eventName ? updatedEvent : event
    )
    onEventsChange(updatedEvents)
    setEditingEventId(null)
  }

  const handleCancelEdit = () => {
    setEditingEventId(null)
  }

  const handleDeleteEvent = (eventName: string) => {
    if (confirm(`Are you sure you want to delete the event "${eventName}"? This action cannot be undone.`)) {
      const updatedEvents = events.filter(event => event.event_name !== eventName)
      onEventsChange(updatedEvents)
      setEditingEventId(null)
    }
  }

  const updateEventField = (eventName: string, field: keyof DataDictionaryEvent, value: any) => {
    const updatedEvents = events.map(event => 
      event.event_name === eventName ? { ...event, [field]: value } : event
    )
    onEventsChange(updatedEvents)
  }

  const updateNewEventField = (field: keyof DataDictionaryEvent, value: any) => {
    setNewEvent(prev => ({ ...prev, [field]: value }))
  }

  const handleToggleExpanded = (eventName: string) => {
    setExpandedEventId(expandedEventId === eventName ? null : eventName)
  }

  const handlePropertiesChange = (eventName: string, newProperties: any[]) => {
    const updatedEvents = events.map(event => 
      event.event_name === eventName ? { ...event, properties: newProperties } : event
    )
    onEventsChange(updatedEvents)
  }

  // Get existing event names for validation
  const existingEventNames = events.map(e => e.event_name)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Events ({events.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your event definitions and track your product analytics
          </p>
        </div>
        <button
          onClick={handleAddEvent}
          disabled={isAddingEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          + Add Event
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="table-container">
          <table className="data-table" role="table" aria-label="Event definitions">
            <thead>
              <tr>
                <th scope="col" className="w-40">Event Name</th>
                <th scope="col" className="w-24">Type</th>
                <th scope="col" className="w-28">Action Type</th>
                <th scope="col" className="w-32">Status</th>
                <th scope="col" className="w-48">Purpose</th>
                <th scope="col" className="w-32">When to Fire</th>
                <th scope="col" className="w-20">Actor</th>
                <th scope="col" className="w-20">Object</th>
                <th scope="col" className="w-28">Context Surface</th>
                <th scope="col" className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* New Event Row */}
              {isAddingEvent && (
                <tr className="bg-blue-50 dark:bg-blue-900/20">
                  <td>
                    <ValidatedField
                      fieldName="event_name"
                      value={newEvent.event_name}
                      onChange={(value) => updateNewEventField('event_name', value)}
                      label=""
                      placeholder="e.g., product_viewed"
                      context={{ existingNames: existingEventNames }}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      type="select"
                      fieldName="event_type"
                      value={newEvent.event_type}
                      onChange={(value) => updateNewEventField('event_type', value)}
                      label=""
                      options={['intent', 'success', 'failure']}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      type="select"
                      fieldName="event_action_type"
                      value={newEvent.event_action_type}
                      onChange={(value) => updateNewEventField('event_action_type', value)}
                      label=""
                      options={['action', 'error', 'feature_flag']}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      type="select"
                      fieldName="lifecycle_status"
                      value={newEvent.lifecycle_status}
                      onChange={(value) => updateNewEventField('lifecycle_status', value)}
                      label=""
                      options={['proposed', 'approved', 'implemented', 'deprecated']}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      type="textarea"
                      fieldName="event_purpose"
                      value={newEvent.event_purpose}
                      onChange={(value) => updateNewEventField('event_purpose', value)}
                      label=""
                      placeholder="Why is this event important?"
                      rows={2}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      type="textarea"
                      fieldName="when_to_fire"
                      value={newEvent.when_to_fire}
                      onChange={(value) => updateNewEventField('when_to_fire', value)}
                      label=""
                      placeholder="When should this fire?"
                      rows={2}
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      fieldName="actor"
                      value={newEvent.actor}
                      onChange={(value) => updateNewEventField('actor', value)}
                      label=""
                      placeholder="user, system, admin"
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      fieldName="object"
                      value={newEvent.object}
                      onChange={(value) => updateNewEventField('object', value)}
                      label=""
                      placeholder="product, cart, etc"
                      className="m-0"
                    />
                  </td>
                  <td>
                    <ValidatedField
                      fieldName="context_surface"
                      value={newEvent.context_surface}
                      onChange={(value) => updateNewEventField('context_surface', value)}
                      label=""
                      placeholder="homepage, checkout"
                      className="m-0"
                    />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveNew}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                        title="Save event"
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

              {/* Existing Events */}
              {events.map((event) => (
                <>
                  <EventRow
                    key={event.event_name}
                    event={event}
                    isEditing={editingEventId === event.event_name}
                    isExpanded={expandedEventId === event.event_name}
                    onEdit={() => handleEditEvent(event.event_name)}
                    onSave={(updatedEvent) => handleSaveEdit(event.event_name, updatedEvent)}
                    onCancel={handleCancelEdit}
                    onDelete={() => handleDeleteEvent(event.event_name)}
                    onToggleExpanded={() => handleToggleExpanded(event.event_name)}
                    onFieldChange={(field, value) => updateEventField(event.event_name, field, value)}
                    existingEventNames={existingEventNames.filter(name => name !== event.event_name)}
                  />
                  {/* Properties row */}
                  {expandedEventId === event.event_name && (
                    <tr>
                      <td colSpan={10} className="p-0 bg-gray-50 dark:bg-gray-800">
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-6">
                          <PropertiesTable
                            properties={event.properties}
                            onPropertiesChange={(newProperties) => handlePropertiesChange(event.event_name, newProperties)}
                            eventName={event.event_name}
                          />
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <ContextKeysSelector
                              contextKeys={event.context_keys || []}
                              properties={event.properties}
                              onContextKeysChange={(newContextKeys) => updateEventField(event.event_name, 'context_keys', newContextKeys)}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
        {/* New Event Card */}
        {isAddingEvent && (
          <div className="border-2 border-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">New Event</h4>
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
              
              <EventCard
                event={newEvent}
                isEditing={true}
                onFieldChange={(field, value) => updateNewEventField(field, value)}
                existingEventNames={existingEventNames}
              />
            </div>
          </div>
        )}

        {/* Existing Event Cards */}
        {events.map((event) => (
          <div key={event.event_name} className="space-y-3">
            <EventCard
              event={event}
              isEditing={editingEventId === event.event_name}
              isExpanded={expandedEventId === event.event_name}
              onEdit={() => handleEditEvent(event.event_name)}
              onSave={(updatedEvent) => handleSaveEdit(event.event_name, updatedEvent)}
              onCancel={handleCancelEdit}
              onDelete={() => handleDeleteEvent(event.event_name)}
              onToggleExpanded={() => handleToggleExpanded(event.event_name)}
              onFieldChange={(field, value) => updateEventField(event.event_name, field, value)}
              existingEventNames={existingEventNames.filter(name => name !== event.event_name)}
            />
            {/* Properties section for mobile */}
            {expandedEventId === event.event_name && (
              <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
                <PropertiesTable
                  properties={event.properties}
                  onPropertiesChange={(newProperties) => handlePropertiesChange(event.event_name, newProperties)}
                  eventName={event.event_name}
                />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <ContextKeysSelector
                    contextKeys={event.context_keys || []}
                    properties={event.properties}
                    onContextKeysChange={(newContextKeys) => updateEventField(event.event_name, 'context_keys', newContextKeys)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && !isAddingEvent && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-sm mb-4">Start by adding your first event to track</p>
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Add Your First Event
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate component for table rows to manage editing state
interface EventRowProps {
  event: DataDictionaryEvent
  isEditing: boolean
  isExpanded: boolean
  onEdit: () => void
  onSave: (event: DataDictionaryEvent) => void
  onCancel: () => void
  onDelete: () => void
  onToggleExpanded: () => void
  onFieldChange: (field: keyof DataDictionaryEvent, value: any) => void
  existingEventNames: string[]
}

function EventRow({
  event,
  isEditing,
  isExpanded,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleExpanded,
  onFieldChange,
  existingEventNames
}: EventRowProps) {
  if (isEditing) {
    return (
      <tr className="bg-yellow-50 dark:bg-yellow-900/20">
        <td>
          <ValidatedField
            fieldName="event_name"
            value={event.event_name}
            onChange={(value) => onFieldChange('event_name', value)}
            label=""
            context={{ existingNames: existingEventNames }}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            type="select"
            fieldName="event_type"
            value={event.event_type}
            onChange={(value) => onFieldChange('event_type', value)}
            label=""
            options={['intent', 'success', 'failure']}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            type="select"
            fieldName="event_action_type"
            value={event.event_action_type}
            onChange={(value) => onFieldChange('event_action_type', value)}
            label=""
            options={['action', 'error', 'feature_flag']}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            type="select"
            fieldName="lifecycle_status"
            value={event.lifecycle_status}
            onChange={(value) => onFieldChange('lifecycle_status', value)}
            label=""
            options={['proposed', 'approved', 'implemented', 'deprecated']}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            type="textarea"
            fieldName="event_purpose"
            value={event.event_purpose || ''}
            onChange={(value) => onFieldChange('event_purpose', value)}
            label=""
            rows={2}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            type="textarea"
            fieldName="when_to_fire"
            value={event.when_to_fire}
            onChange={(value) => onFieldChange('when_to_fire', value)}
            label=""
            rows={2}
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            fieldName="actor"
            value={event.actor}
            onChange={(value) => onFieldChange('actor', value)}
            label=""
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            fieldName="object"
            value={event.object}
            onChange={(value) => onFieldChange('object', value)}
            label=""
            className="m-0"
          />
        </td>
        <td>
          <ValidatedField
            fieldName="context_surface"
            value={event.context_surface}
            onChange={(value) => onFieldChange('context_surface', value)}
            label=""
            className="m-0"
          />
        </td>
        <td>
          <div className="flex gap-1">
            <button
              onClick={() => onSave(event)}
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
        <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
          {event.event_name}
        </code>
      </td>
      <td>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          event.event_type === 'intent' ? 'bg-blue-100 text-blue-800' :
          event.event_type === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {event.event_type}
        </span>
      </td>
      <td>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {event.event_action_type}
        </span>
      </td>
      <td>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          event.lifecycle_status === 'implemented' ? 'bg-green-100 text-green-800' :
          event.lifecycle_status === 'approved' ? 'bg-blue-100 text-blue-800' :
          event.lifecycle_status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {event.lifecycle_status}
        </span>
      </td>
      <td>
        <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
          {event.event_purpose || <span className="text-gray-400 italic">No purpose defined</span>}
        </div>
      </td>
      <td>
        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {event.when_to_fire}
        </div>
      </td>
      <td>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {event.actor}
        </span>
      </td>
      <td>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {event.object}
        </span>
      </td>
      <td>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {event.context_surface}
        </span>
      </td>
      <td>
        <div className="flex gap-1">
          <button
            onClick={onToggleExpanded}
            className="text-purple-600 hover:text-purple-800 text-sm"
            title={isExpanded ? 'Hide properties' : 'Show properties'}
          >
            {isExpanded ? '▼' : '▶'} Props
          </button>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Edit event"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Delete event"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// Mobile card component
interface EventCardProps {
  event: DataDictionaryEvent
  isEditing: boolean
  isExpanded?: boolean
  onEdit?: () => void
  onSave?: (event: DataDictionaryEvent) => void
  onCancel?: () => void
  onDelete?: () => void
  onToggleExpanded?: () => void
  onFieldChange: (field: keyof DataDictionaryEvent, value: any) => void
  existingEventNames: string[]
}

function EventCard({
  event,
  isEditing,
  isExpanded,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleExpanded,
  onFieldChange,
  existingEventNames
}: EventCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${
      isEditing ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : 
      'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            {isEditing ? (
              <ValidatedField
                fieldName="event_name"
                value={event.event_name}
                onChange={(value) => onFieldChange('event_name', value)}
                label="Event Name"
                context={{ existingNames: existingEventNames }}
              />
            ) : (
              <code className="text-lg font-mono text-blue-600 dark:text-blue-400">
                {event.event_name}
              </code>
            )}
          </div>
          {!isEditing && onEdit && (
            <div className="flex gap-2">
              {onToggleExpanded && (
                <button
                  onClick={onToggleExpanded}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                  title={isExpanded ? 'Hide properties' : 'Show properties'}
                >
                  {isExpanded ? '▼' : '▶'} Props
                </button>
              )}
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
                onClick={() => onSave(event)}
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

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {isEditing ? (
              <ValidatedField
                type="select"
                fieldName="event_type"
                value={event.event_type}
                onChange={(value) => onFieldChange('event_type', value)}
                label="Event Type"
                options={['intent', 'success', 'failure']}
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Event Type
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  event.event_type === 'intent' ? 'bg-blue-100 text-blue-800' :
                  event.event_type === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.event_type}
                </span>
              </div>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <ValidatedField
                type="select"
                fieldName="lifecycle_status"
                value={event.lifecycle_status}
                onChange={(value) => onFieldChange('lifecycle_status', value)}
                label="Status"
                options={['proposed', 'approved', 'implemented', 'deprecated']}
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  event.lifecycle_status === 'implemented' ? 'bg-green-100 text-green-800' :
                  event.lifecycle_status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  event.lifecycle_status === 'proposed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.lifecycle_status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Purpose */}
        <div>
          {isEditing ? (
            <ValidatedField
              type="textarea"
              fieldName="event_purpose"
              value={event.event_purpose || ''}
              onChange={(value) => onFieldChange('event_purpose', value)}
              label="Purpose"
              rows={3}
            />
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Purpose
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {event.event_purpose || <span className="text-gray-400 italic">No purpose defined</span>}
              </p>
            </div>
          )}
        </div>

        {/* Context Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            {isEditing ? (
              <ValidatedField
                fieldName="actor"
                value={event.actor}
                onChange={(value) => onFieldChange('actor', value)}
                label="Actor"
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Actor
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {event.actor}
                </span>
              </div>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <ValidatedField
                fieldName="object"
                value={event.object}
                onChange={(value) => onFieldChange('object', value)}
                label="Object"
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Object
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {event.object}
                </span>
              </div>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <ValidatedField
                fieldName="context_surface"
                value={event.context_surface}
                onChange={(value) => onFieldChange('context_surface', value)}
                label="Surface"
              />
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Surface
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {event.context_surface}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Properties Summary */}
        {!isEditing && onToggleExpanded && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Properties
            </label>
            <button
              onClick={onToggleExpanded}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 flex items-center gap-1"
            >
              {isExpanded ? '▼' : '▶'} {event.properties.length} properties configured
            </button>
          </div>
        )}
      </div>
    </div>
  )
}