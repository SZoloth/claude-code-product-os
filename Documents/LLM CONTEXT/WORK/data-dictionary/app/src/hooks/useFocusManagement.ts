/**
 * useFocusManagement hook - Advanced focus management for accessibility
 * Provides focus trapping, restoration, and keyboard navigation utilities
 */

import { useEffect, useCallback, useRef } from 'react'

interface FocusableElement {
  element: HTMLElement
  index: number
}

// Selector for focusable elements
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

/**
 * Hook for managing focus within a container (focus trap)
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const elements = container.querySelectorAll(FOCUSABLE_ELEMENTS)
    return Array.from(elements).filter((element): element is HTMLElement => {
      return element instanceof HTMLElement && 
             getComputedStyle(element).display !== 'none' &&
             getComputedStyle(element).visibility !== 'hidden'
    })
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current || event.key !== 'Tab') return

    const focusableElements = getFocusableElements(containerRef.current)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab - moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab - moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [isActive, containerRef, getFocusableElements])

  useEffect(() => {
    if (!isActive) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the first focusable element in the container
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current)
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
        previousActiveElement.current = null
      }
    }
  }, [isActive, handleKeyDown, getFocusableElements, containerRef])
}

/**
 * Hook for managing focus restoration after modals/overlays close
 */
export function useFocusRestore(isActive: boolean) {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement
    } else if (previousActiveElement.current) {
      // Restore focus when no longer active
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [isActive])
}

/**
 * Hook for managing roving tabindex (for component groups like radio buttons, tabs)
 */
export function useRovingTabIndex(
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement>,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) {
  const currentIndex = useRef(0)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll('[role="tab"], [role="radio"], [role="option"]')
    const elements = Array.from(focusableElements) as HTMLElement[]
    
    if (elements.length === 0) return

    let nextIndex: number | null = null

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault()
          nextIndex = (currentIndex.current + 1) % elements.length
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault()
          nextIndex = (currentIndex.current - 1 + elements.length) % elements.length
        }
        break
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault()
          nextIndex = (currentIndex.current + 1) % elements.length
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault()
          nextIndex = (currentIndex.current - 1 + elements.length) % elements.length
        }
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = elements.length - 1
        break
    }

    if (nextIndex !== null) {
      // Update tabindex values
      elements.forEach((element, index) => {
        element.tabIndex = index === nextIndex ? 0 : -1
      })
      
      // Focus the new element
      elements[nextIndex].focus()
      currentIndex.current = nextIndex
    }
  }, [isActive, containerRef, orientation])

  useEffect(() => {
    if (!isActive) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, handleKeyDown])

  // Initialize tabindex values
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll('[role="tab"], [role="radio"], [role="option"]')
    const elements = Array.from(focusableElements) as HTMLElement[]
    
    elements.forEach((element, index) => {
      element.tabIndex = index === 0 ? 0 : -1
    })
  }, [isActive, containerRef])
}

/**
 * Hook for announcing content changes to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create announcement container if it doesn't exist
    if (!announcementRef.current) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.id = 'screen-reader-announcements'
      document.body.appendChild(announcement)
      announcementRef.current = announcement
    }

    return () => {
      // Cleanup on unmount
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current)
      }
    }
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) return

    // Update aria-live for priority
    announcementRef.current.setAttribute('aria-live', priority)
    
    // Clear and set new message
    announcementRef.current.textContent = ''
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message
      }
    }, 100)
  }, [])

  return announce
}

/**
 * Hook for auto-focusing elements on mount
 */
export function useAutoFocus(
  shouldFocus: boolean,
  elementRef: React.RefObject<HTMLElement>,
  options: {
    delay?: number
    selectText?: boolean
  } = {}
) {
  const { delay = 0, selectText = false } = options

  useEffect(() => {
    if (!shouldFocus || !elementRef.current) return

    const timer = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.focus()
        
        if (selectText && elementRef.current instanceof HTMLInputElement) {
          elementRef.current.select()
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [shouldFocus, elementRef, delay, selectText])
}

/**
 * Hook for managing focus within a data table
 */
export function useTableFocus(
  isActive: boolean,
  tableRef: React.RefObject<HTMLTableElement>
) {
  const currentCell = useRef<{ row: number; col: number }>({ row: 0, col: 0 })

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !tableRef.current) return

    const rows = tableRef.current.querySelectorAll('tr')
    if (rows.length === 0) return

    let nextRow = currentCell.current.row
    let nextCol = currentCell.current.col

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        nextRow = Math.max(0, currentCell.current.row - 1)
        break
      case 'ArrowDown':
        event.preventDefault()
        nextRow = Math.min(rows.length - 1, currentCell.current.row + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextCol = Math.max(0, currentCell.current.col - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        const currentRowCells = rows[currentCell.current.row].querySelectorAll('td, th')
        nextCol = Math.min(currentRowCells.length - 1, currentCell.current.col + 1)
        break
      case 'Home':
        event.preventDefault()
        if (event.ctrlKey) {
          nextRow = 0
          nextCol = 0
        } else {
          nextCol = 0
        }
        break
      case 'End':
        event.preventDefault()
        if (event.ctrlKey) {
          nextRow = rows.length - 1
          const lastRowCells = rows[nextRow].querySelectorAll('td, th')
          nextCol = lastRowCells.length - 1
        } else {
          const currentRowCells = rows[currentCell.current.row].querySelectorAll('td, th')
          nextCol = currentRowCells.length - 1
        }
        break
    }

    if (nextRow !== currentCell.current.row || nextCol !== currentCell.current.col) {
      const targetRow = rows[nextRow]
      const targetCells = targetRow.querySelectorAll('td, th')
      const targetCell = targetCells[nextCol] as HTMLElement

      if (targetCell) {
        targetCell.focus()
        currentCell.current = { row: nextRow, col: nextCol }
      }
    }
  }, [isActive, tableRef])

  useEffect(() => {
    if (!isActive) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, handleKeyDown])
}