/**
 * TableEditor component - Demonstrates accessible table styles
 * Will be used for event/property editing in later tasks
 */

interface MockEvent {
  id: string
  event_name: string
  event_type: string
  lifecycle_status: string
  description: string
}

interface MockProperty {
  id: string
  name: string
  type: string
  required: boolean
  example: string
  description: string
}

const mockEvents: MockEvent[] = [
  {
    id: '1',
    event_name: 'product_viewed',
    event_type: 'intent',
    lifecycle_status: 'active',
    description: 'User views a product detail page'
  },
  {
    id: '2',
    event_name: 'checkout_completed',
    event_type: 'success',
    lifecycle_status: 'active',
    description: 'User successfully completes checkout process'
  }
]

const mockProperties: MockProperty[] = [
  {
    id: '1',
    name: 'product_id',
    type: 'string',
    required: true,
    example: 'prod_123',
    description: 'Unique product identifier'
  },
  {
    id: '2',
    name: 'category',
    type: 'string',
    required: false,
    example: 'electronics',
    description: 'Product category'
  }
]

export default function TableEditor() {
  return (
    <div className="content-section-lg">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Events
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manage your event definitions and properties
        </p>
      </div>

      {/* Desktop Table */}
      <div className="table-container hidden sm:block">
        <table className="data-table" role="table" aria-label="Event definitions">
          <thead>
            <tr>
              <th scope="col">Event Name</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Description</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockEvents.map((event) => (
              <tr key={event.id}>
                <td>
                  <input 
                    type="text" 
                    value={event.event_name}
                    className="field-input text-sm"
                    aria-label={`Event name for ${event.event_name}`}
                    readOnly
                  />
                </td>
                <td>
                  <select 
                    value={event.event_type}
                    className="field-select text-sm"
                    aria-label={`Event type for ${event.event_name}`}
                    disabled
                  >
                    <option value="intent">Intent</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                  </select>
                </td>
                <td>
                  <span className="status-required">
                    {event.lifecycle_status}
                  </span>
                </td>
                <td>
                  <textarea 
                    value={event.description}
                    className="field-textarea text-sm"
                    rows={2}
                    aria-label={`Description for ${event.event_name}`}
                    readOnly
                  />
                </td>
                <td>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    aria-label={`Edit ${event.event_name}`}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {mockEvents.map((event) => (
          <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Event Name
                </label>
                <input 
                  type="text" 
                  value={event.event_name}
                  className="field-input text-sm"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Type
                  </label>
                  <select 
                    value={event.event_type}
                    className="field-select text-sm"
                    disabled
                  >
                    <option value="intent">Intent</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <span className="status-required">
                    {event.lifecycle_status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea 
                  value={event.description}
                  className="field-textarea text-sm"
                  rows={2}
                  readOnly
                />
              </div>
              <div className="flex justify-end">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Properties Section */}
      <div className="mt-8">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
          Properties for: product_viewed
        </h4>
        
        <div className="table-container">
          <table className="data-table" role="table" aria-label="Event properties">
            <thead>
              <tr>
                <th scope="col">Property Name</th>
                <th scope="col">Type</th>
                <th scope="col">Required</th>
                <th scope="col">Example</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {mockProperties.map((prop) => (
                <tr key={prop.id}>
                  <td>
                    <input 
                      type="text" 
                      value={prop.name}
                      className="field-input text-sm"
                      readOnly
                    />
                  </td>
                  <td>
                    <select 
                      value={prop.type}
                      className="field-select text-sm"
                      disabled
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </td>
                  <td>
                    <span className={prop.required ? 'status-required' : 'status-optional'}>
                      {prop.required ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={prop.example}
                      className="field-input text-sm"
                      readOnly
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={prop.description}
                      className="field-input text-sm"
                      readOnly
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placeholder note */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This is a preview of the table editor component. Full editing functionality will be implemented in Task 5.x.
        </p>
      </div>
    </div>
  )
}