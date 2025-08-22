/**
 * ContextKeysSelector component - Select key properties for quick reference
 */

import { useState } from 'react'
import type { EventProperty } from '../lib/schema/dataDictionary'

interface ContextKeysSelectorProps {
  contextKeys: string[]
  properties: EventProperty[]
  onContextKeysChange: (contextKeys: string[]) => void
  className?: string
}

export default function ContextKeysSelector({ 
  contextKeys, 
  properties, 
  onContextKeysChange, 
  className = '' 
}: ContextKeysSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const availableProperties = properties.filter(prop => prop.name.trim() !== '')
  const maxContextKeys = 10

  // Identify context keys that reference missing properties
  const validContextKeys = contextKeys.filter(key => properties.some(prop => prop.name === key))
  const invalidContextKeys = contextKeys.filter(key => !properties.some(prop => prop.name === key))

  const handleToggleProperty = (propertyName: string) => {
    if (contextKeys.includes(propertyName)) {
      // Remove from context keys
      onContextKeysChange(contextKeys.filter(key => key !== propertyName))
    } else if (contextKeys.length < maxContextKeys) {
      // Add to context keys
      onContextKeysChange([...contextKeys, propertyName])
    }
  }

  const handleRemoveContextKey = (keyToRemove: string) => {
    onContextKeysChange(contextKeys.filter(key => key !== keyToRemove))
  }

  // Get property object for a context key (to show type info)
  const getPropertyForKey = (key: string) => {
    return properties.find(prop => prop.name === key)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header and Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Context Keys
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({contextKeys.length}/{maxContextKeys})
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Select key properties for quick reference and segmentation. Max {maxContextKeys} items.
        </p>
      </div>

      {/* Selected Context Keys */}
      {validContextKeys.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">Selected Keys:</h5>
          <div className="flex flex-wrap gap-2">
            {validContextKeys.map((key) => {
              const property = getPropertyForKey(key)
              return (
                <div
                  key={key}
                  className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-sm"
                >
                  <code className="font-mono text-xs">{key}</code>
                  {property && (
                    <span className="text-xs opacity-70">({property.type})</span>
                  )}
                  <button
                    onClick={() => handleRemoveContextKey(key)}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    title={`Remove ${key} from context keys`}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Invalid Context Keys Warning */}
      {invalidContextKeys.length > 0 && (
        <div className="space-y-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <h5 className="text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
            ⚠️ Invalid Context Keys Found
          </h5>
          <p className="text-xs text-red-600 dark:text-red-400">
            These context keys reference properties that no longer exist:
          </p>
          <div className="flex flex-wrap gap-2">
            {invalidContextKeys.map((key) => (
              <div
                key={key}
                className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-md text-sm"
              >
                <code className="font-mono text-xs">{key}</code>
                <button
                  onClick={() => handleRemoveContextKey(key)}
                  className="ml-1 text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
                  title={`Remove invalid key ${key}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => onContextKeysChange(validContextKeys)}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
          >
            Clean up all invalid keys
          </button>
        </div>
      )}

      {/* Property Selector */}
      {availableProperties.length > 0 ? (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            disabled={contextKeys.length >= maxContextKeys}
          >
            {contextKeys.length >= maxContextKeys ? (
              <span className="text-gray-400">Maximum context keys selected</span>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">
                {isOpen ? 'Choose properties to add as context keys...' : 'Click to select context keys from properties...'}
              </span>
            )}
            <span className="float-right text-gray-400">
              {isOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isOpen && contextKeys.length < maxContextKeys && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {availableProperties.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No properties available. Add some properties first.
                </div>
              ) : (
                <div className="py-1">
                  {availableProperties.map((property) => {
                    const isSelected = contextKeys.includes(property.name)
                    const canSelect = !isSelected && contextKeys.length < maxContextKeys
                    
                    return (
                      <button
                        key={property.name}
                        onClick={() => canSelect && handleToggleProperty(property.name)}
                        disabled={!canSelect}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                            : canSelect
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                            {property.name}
                          </code>
                          <span className={`text-xs px-1 py-0.5 rounded-full ${
                            property.type === 'string' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            property.type === 'number' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            property.type === 'boolean' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {property.type}
                          </span>
                          {property.required && (
                            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-1 py-0.5 rounded-full">
                              required
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <span className="text-blue-600 dark:text-blue-400 text-xs">✓ Selected</span>
                          )}
                          {!canSelect && !isSelected && (
                            <span className="text-gray-400 text-xs">Max reached</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No properties available for context keys.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Add some properties to this event first, then you can select key ones as context keys.
          </p>
        </div>
      )}

      {/* Enhanced Validation Hints */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">💡 Context Keys Guidelines:</h5>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {/* Dynamic feedback based on current selection */}
          {contextKeys.length === 0 && (
            <p className="text-blue-600 dark:text-blue-400">
              ℹ️ Start by selecting 2-3 key properties that are most important for analysis
            </p>
          )}
          
          {contextKeys.length > 0 && contextKeys.length <= 3 && (
            <p className="text-green-600 dark:text-green-400">
              ✅ Good selection size - consider if you need additional context
            </p>
          )}
          
          {contextKeys.length > 7 && (
            <p className="text-amber-600 dark:text-amber-400">
              ⚠️ Consider reducing to 3-5 keys for better usability and query performance
            </p>
          )}

          {/* Check for required properties in context keys */}
          {(() => {
            const requiredProps = properties.filter(p => p.required)
            const requiredInContext = contextKeys.filter(key => 
              requiredProps.some(prop => prop.name === key)
            )
            const missingRequired = requiredProps.filter(prop => 
              !contextKeys.includes(prop.name)
            )

            if (requiredProps.length > 0 && requiredInContext.length === 0) {
              return (
                <p className="text-orange-600 dark:text-orange-400">
                  💡 Consider including required properties like: {missingRequired.slice(0, 2).map(p => p.name).join(', ')}
                </p>
              )
            }
            return null
          })()}

          {/* Check for common analytics patterns */}
          {(() => {
            const hasUserContext = contextKeys.some(key => 
              ['user_id', 'session_id', 'customer_id', 'account_id'].includes(key)
            )
            const hasBusinessContext = contextKeys.some(key => 
              ['product_id', 'category', 'order_id', 'campaign_id'].includes(key)
            )
            
            if (contextKeys.length > 0 && !hasUserContext && !hasBusinessContext) {
              return (
                <p className="text-blue-600 dark:text-blue-400">
                  💡 Consider including user context (user_id, session_id) or business context (product_id, category)
                </p>
              )
            }
            return null
          })()}

          {/* General best practices */}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>• Select properties that analysts will commonly use for filtering and grouping</p>
            <p>• Include identifiers that enable joins with other data sources</p>
            <p>• Balance detail with simplicity - more keys = more complexity</p>
            <p>• Required properties make good context keys since they're always present</p>
          </div>
        </div>
      </div>

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}