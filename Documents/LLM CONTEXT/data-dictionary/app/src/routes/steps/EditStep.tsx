import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { DataDictionaryEvent } from '../../lib/schema/dataDictionary'
import EventsTable from '../../components/EventsTable'
import ValidationBanner from '../../components/ValidationBanner'
import SnapshotManager from '../../components/SnapshotManager'

export default function EditStep() {
  const navigate = useNavigate()
  const [isSnapshotManagerOpen, setIsSnapshotManagerOpen] = useState(false)
  
  // Mock initial events - in real app this would come from state management/API
  const [events, setEvents] = useState<DataDictionaryEvent[]>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('dataDictionary_events')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.warn('Failed to parse saved events:', e)
      }
    }
    
    // Default mock events
    return [
      {
        event_name: 'product_viewed',
        event_type: 'intent',
        event_action_type: 'action',
        event_purpose: 'Track when users view product detail pages to understand product interest and optimize conversion funnel',
        when_to_fire: 'When a user navigates to or loads a product detail page',
        actor: 'user',
        object: 'product',
        context_surface: 'product_detail_page',
        properties: [
          {
            name: 'product_id',
            type: 'string',
            required: true,
            example: 'prod_123',
            description: 'Unique identifier for the viewed product'
          },
          {
            name: 'category',
            type: 'string',
            required: false,
            example: 'electronics',
            description: 'Product category for segmentation'
          }
        ],
        context_keys: ['product_id'],
        lifecycle_status: 'approved',
        datadog_api: 'addAction'
      },
      {
        event_name: 'checkout_completed',
        event_type: 'success',
        event_action_type: 'action',
        event_purpose: 'Track successful checkout completion to measure conversion and revenue',
        when_to_fire: 'When a user successfully completes the checkout process and payment is confirmed',
        actor: 'user',
        object: 'order',
        context_surface: 'checkout_page',
        properties: [
          {
            name: 'order_id',
            type: 'string',
            required: true,
            example: 'ord_456',
            description: 'Unique identifier for the completed order'
          },
          {
            name: 'total_amount',
            type: 'number',
            required: true,
            example: 99.99,
            description: 'Total order amount in dollars'
          },
          {
            name: 'payment_method',
            type: 'string',
            required: false,
            example: 'credit_card',
            description: 'Method used for payment'
          },
          {
            name: 'currency',
            type: 'string',
            required: true,
            example: 'USD',
            description: 'Currency code for the transaction'
          }
        ],
        context_keys: ['order_id', 'total_amount', 'currency'],
        lifecycle_status: 'implemented',
        datadog_api: 'addAction'
      }
    ]
  })

  // Auto-save to localStorage when events change
  useEffect(() => {
    localStorage.setItem('dataDictionary_events', JSON.stringify(events))
  }, [events])

  // Handle snapshot restore
  const handleRestoreSnapshot = (restoredEvents: DataDictionaryEvent[]) => {
    setEvents(restoredEvents)
  }

  // Create mock DataDictionary for validation
  const dataDictionary = {
    version: '1.0.0',
    generatedAtIso: new Date().toISOString(),
    events
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Edit & Refine Events</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Fine-tune the AI-generated events, add missing details, and ensure they match your analytics needs.
        </p>
      </div>

      {/* Validation Status */}
      <ValidationBanner dictionary={dataDictionary} />

      {/* Snapshot Manager */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            📸 Version Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Save snapshots of your current work and restore previous versions
          </p>
        </div>
        <button
          onClick={() => setIsSnapshotManagerOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
        >
          Manage Snapshots
        </button>
      </div>

      {/* Editing Best Practices */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-4">
        <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">✏️ Editing Best Practices</h3>
        <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
          <p><strong>Event naming:</strong> Use consistent snake_case (e.g., product_viewed, checkout_completed)</p>
          <p><strong>Properties:</strong> Include user context, session info, and relevant business data</p>
          <p><strong>Required fields:</strong> Mark critical properties as required for data quality</p>
          <p><strong>Examples:</strong> Add realistic sample values to guide implementation</p>
        </div>
      </div>

      {/* Events Table Editor */}
      <EventsTable 
        events={events}
        onEventsChange={setEvents}
      />

      <div className="flex items-center gap-3">
        <button 
          className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800" 
          onClick={() => navigate('/export')}
        >
          Next: Export
        </button>
        <Link to="/preview" className="text-sm underline hover:text-blue-600">
          Back
        </Link>
      </div>

      {/* Snapshot Manager Modal */}
      {isSnapshotManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <SnapshotManager
              events={events}
              onRestoreSnapshot={handleRestoreSnapshot}
              onClose={() => setIsSnapshotManagerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}


