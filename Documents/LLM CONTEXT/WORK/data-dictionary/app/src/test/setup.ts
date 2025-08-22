// Jest test setup file
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Polyfill TextEncoder/TextDecoder for React Router
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Clean up after each test
afterEach(() => {
  // Clean up DOM
  cleanup()
  
  // Clear all timers
  jest.clearAllTimers()
  
  // Clear all mocks
  jest.clearAllMocks()
  
  // Clear any pending async operations (only if fake timers are enabled)
  if (jest.isMockFunction(setTimeout)) {
    jest.runOnlyPendingTimers()
  }
})

// Mock window.matchMedia for headless testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock URL.createObjectURL and revokeObjectURL for download tests
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-blob-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
})

// Mock navigation APIs to prevent JSDOM errors
// Only define location if it doesn't exist or is configurable
try {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'location')
  if (!descriptor || descriptor.configurable) {
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
      },
    })
  }
} catch (error) {
  // Location already exists and is not configurable - skip mocking
}

// Suppress console.error for navigation warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      args[0].includes('Not implemented: navigation')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})