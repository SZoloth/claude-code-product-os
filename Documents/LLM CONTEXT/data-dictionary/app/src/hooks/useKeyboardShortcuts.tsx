/**
 * useKeyboardShortcuts hook - Global keyboard shortcuts system
 * Provides productivity shortcuts with accessibility support
 */

import { useEffect, useCallback, useState } from 'react'

export interface KeyboardShortcut {
  id: string
  key: string
  modifiers: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  description: string
  category: string
  handler: () => void
  disabled?: boolean
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Only allow help shortcut in form fields
      if (event.key === '?' && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault()
        setIsHelpOpen(true)
      }
      return
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.disabled) return false
      
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!event.ctrlKey === !!shortcut.modifiers.ctrl
      const altMatches = !!event.altKey === !!shortcut.modifiers.alt
      const shiftMatches = !!event.shiftKey === !!shortcut.modifiers.shift
      const metaMatches = !!event.metaKey === !!shortcut.modifiers.meta
      
      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches
    })

    if (matchingShortcut) {
      event.preventDefault()
      matchingShortcut.handler()
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])

  return {
    isHelpOpen,
    setIsHelpOpen
  }
}

// Keyboard shortcuts help modal component
interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsHelp({ isOpen, onClose, shortcuts }: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Focus trap - focus the modal
      const modal = document.getElementById('shortcuts-modal')
      if (modal) modal.focus()
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Group shortcuts by category
  const groupedShortcuts = shortcuts
    .filter(s => !s.disabled)
    .reduce((groups, shortcut) => {
      const category = shortcut.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(shortcut)
      return groups
    }, {} as Record<string, KeyboardShortcut[]>)

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts: string[] = []
    
    if (shortcut.modifiers.ctrl) parts.push('Ctrl')
    if (shortcut.modifiers.alt) parts.push('Alt')
    if (shortcut.modifiers.shift) parts.push('Shift')
    if (shortcut.modifiers.meta) parts.push('Cmd')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="shortcuts-modal"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="shortcuts-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close shortcuts help"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                {category}
              </h3>
              
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                      {shortcut.description}
                    </span>
                    <kbd className="ml-4 px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {shortcuts.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No keyboard shortcuts available
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press ESC to close this dialog, or ? to open it anytime
          </p>
        </div>
      </div>
    </div>
  )
}

// Common shortcuts factory functions
export const createWizardShortcuts = (callbacks: {
  goToDescribe: () => void
  goToJourneys: () => void
  goToPreview: () => void
  goToEdit: () => void
  goToExport: () => void
}): KeyboardShortcut[] => [
  {
    id: 'go-to-describe',
    key: '1',
    modifiers: { alt: true },
    description: 'Go to Describe step',
    category: 'Navigation',
    handler: callbacks.goToDescribe
  },
  {
    id: 'go-to-journeys', 
    key: '2',
    modifiers: { alt: true },
    description: 'Go to Journeys step',
    category: 'Navigation',
    handler: callbacks.goToJourneys
  },
  {
    id: 'go-to-preview',
    key: '3', 
    modifiers: { alt: true },
    description: 'Go to Preview step',
    category: 'Navigation',
    handler: callbacks.goToPreview
  },
  {
    id: 'go-to-edit',
    key: '4',
    modifiers: { alt: true },
    description: 'Go to Edit step',
    category: 'Navigation',
    handler: callbacks.goToEdit
  },
  {
    id: 'go-to-export',
    key: '5',
    modifiers: { alt: true },
    description: 'Go to Export step',
    category: 'Navigation', 
    handler: callbacks.goToExport
  }
]

export const createEditingShortcuts = (callbacks: {
  addEvent?: () => void
  deleteEvent?: () => void
  saveChanges?: () => void
  undo?: () => void
}): KeyboardShortcut[] => [
  {
    id: 'add-event',
    key: 'n',
    modifiers: { ctrl: true },
    description: 'Add new event',
    category: 'Editing',
    handler: callbacks.addEvent || (() => {}),
    disabled: !callbacks.addEvent
  },
  {
    id: 'delete-event',
    key: 'Delete',
    modifiers: { shift: true },
    description: 'Delete selected event',
    category: 'Editing',
    handler: callbacks.deleteEvent || (() => {}),
    disabled: !callbacks.deleteEvent
  },
  {
    id: 'save-changes',
    key: 's',
    modifiers: { ctrl: true },
    description: 'Save changes',
    category: 'Editing',
    handler: callbacks.saveChanges || (() => {}),
    disabled: !callbacks.saveChanges
  },
  {
    id: 'undo',
    key: 'z',
    modifiers: { ctrl: true },
    description: 'Undo last action',
    category: 'Editing',
    handler: callbacks.undo || (() => {}),
    disabled: !callbacks.undo
  }
]

export const createGlobalShortcuts = (callbacks: {
  openHelp?: () => void
  openAnalytics?: () => void
  toggleTheme?: () => void
}): KeyboardShortcut[] => [
  {
    id: 'open-help',
    key: '?',
    modifiers: { shift: true },
    description: 'Show keyboard shortcuts',
    category: 'General',
    handler: callbacks.openHelp || (() => {})
  },
  {
    id: 'open-analytics',
    key: 'a',
    modifiers: { ctrl: true, shift: true },
    description: 'Open analytics panel',
    category: 'General',
    handler: callbacks.openAnalytics || (() => {}),
    disabled: !callbacks.openAnalytics
  },
  {
    id: 'toggle-theme',
    key: 'd',
    modifiers: { ctrl: true, shift: true },
    description: 'Toggle dark mode',
    category: 'General',
    handler: callbacks.toggleTheme || (() => {}),
    disabled: !callbacks.toggleTheme
  }
]