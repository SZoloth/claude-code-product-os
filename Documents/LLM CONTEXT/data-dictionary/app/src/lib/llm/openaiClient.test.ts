/**
 * Tests for OpenAI client with retry logic and progress tracking
 */

import { 
  OpenAIClient, 
  OpenAIMessage, 
  ProgressUpdate, 
  ProgressState,
  validateOpenAIConfig
} from './openaiClient'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock import.meta.env for Jest environment
const mockEnv = {
  VITE_OPENAI_API_KEY: '',
  VITE_OPENAI_TEMPERATURE: '0.2',
  VITE_OPENAI_TIMEOUT: '30000',
  VITE_OPENAI_MAX_RETRIES: '3',
  VITE_OPENAI_RETRY_DELAY: '1000',
  VITE_OPENAI_BASE_URL: 'https://api.openai.com/v1',
  VITE_OPENAI_MODEL: 'gpt-4o-mini'
}

// Mock import.meta
Object.defineProperty(globalThis, 'import.meta', {
  value: { env: mockEnv },
  writable: true
})

describe('OpenAIClient', () => {
  let client: OpenAIClient
  const mockApiKey = 'test-api-key'
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Update mock environment variables
    mockEnv.VITE_OPENAI_API_KEY = mockApiKey
    mockEnv.VITE_OPENAI_TEMPERATURE = '0.2'
    mockEnv.VITE_OPENAI_TIMEOUT = '5000'
    mockEnv.VITE_OPENAI_MAX_RETRIES = '2'
    mockEnv.VITE_OPENAI_RETRY_DELAY = '100'
    
    client = new OpenAIClient({
      apiKey: mockApiKey,
      timeout: 5000,
      maxRetries: 2,
      retryDelay: 100
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('constructor', () => {
    it('should create client with default configuration', () => {
      const defaultClient = new OpenAIClient({ apiKey: 'test' })
      expect(defaultClient).toBeDefined()
    })

    it('should throw error if no API key provided', () => {
      mockEnv.VITE_OPENAI_API_KEY = ''
      expect(() => new OpenAIClient()).toThrow('OpenAI API key is required')
    })

    it('should use environment variables for configuration', () => {
      mockEnv.VITE_OPENAI_MAX_RETRIES = '5'
      mockEnv.VITE_OPENAI_RETRY_DELAY = '2000'
      
      const envClient = new OpenAIClient({ apiKey: 'test' })
      expect(envClient).toBeDefined()
    })
  })

  describe('createChatCompletion', () => {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: 'You are a test assistant' },
      { role: 'user', content: 'Hello' }
    ]

    const mockSuccessResponse = {
      choices: [{
        message: { content: '{"test": "response"}', role: 'assistant' },
        finish_reason: 'stop'
      }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
    }

    it('should successfully make API call on first attempt', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      } as Response)

      const result = await client.createChatCompletion(messages, (update) => {
        progressUpdates.push(update)
      })

      expect(result).toEqual(mockSuccessResponse)
      expect(progressUpdates).toHaveLength(4)
      expect(progressUpdates[0].state).toBe('preparing')
      expect(progressUpdates[1].state).toBe('calling_llm')
      expect(progressUpdates[2].state).toBe('processing_response')
      expect(progressUpdates[3].state).toBe('completed')
    })

    it('should retry on 500 error and succeed', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      // First call fails with 500
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: 'Internal server error' } })
      } as Response)
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      } as Response)

      const result = await client.createChatCompletion(messages, (update) => {
        progressUpdates.push(update)
      })

      expect(result).toEqual(mockSuccessResponse)
      expect(mockFetch).toHaveBeenCalledTimes(2)
      
      const retryUpdate = progressUpdates.find(u => u.state === 'retrying')
      expect(retryUpdate).toBeDefined()
      expect(retryUpdate?.attempt).toBe(2)
    })

    it('should retry on 429 rate limit error', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      } as Response)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      } as Response)

      const result = await client.createChatCompletion(messages, (update) => {
        progressUpdates.push(update)
      })

      expect(result).toEqual(mockSuccessResponse)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should fail after maximum retries', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      // All calls fail with 500
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: { message: 'Server error' } })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: { message: 'Server error' } })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: { message: 'Server error' } })
        } as Response)

      await expect(
        client.createChatCompletion(messages, (update) => {
          progressUpdates.push(update)
        })
      ).rejects.toThrow('OpenAI API error: 500 - Server error')

      expect(mockFetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
      
      const failedUpdate = progressUpdates.find(u => u.state === 'failed')
      expect(failedUpdate).toBeDefined()
    })

    it('should not retry on 401 authentication error', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      } as Response)

      await expect(
        client.createChatCompletion(messages, (update) => {
          progressUpdates.push(update)
        })
      ).rejects.toThrow('OpenAI API error: 401 - Invalid API key')

      expect(mockFetch).toHaveBeenCalledTimes(1) // No retries for auth errors
    })

    it('should handle timeout with retries', async () => {
      jest.useFakeTimers()
      const progressUpdates: ProgressUpdate[] = []
      
      // Mock fetch to hang indefinitely
      mockFetch.mockImplementation(() => new Promise(() => {}))

      const requestPromise = client.createChatCompletion(messages, (update) => {
        progressUpdates.push(update)
      })

      // Fast-forward to trigger all timeouts and retries
      jest.advanceTimersByTime(30000) // Advance enough time for all timeouts + retries

      await expect(requestPromise).rejects.toThrow('Request timed out after 5000ms')
      
      jest.useRealTimers() // Reset to real timers for this test
    }, 10000)

    it('should calculate exponential backoff correctly', async () => {
      const progressUpdates: ProgressUpdate[] = []
      const startTime = Date.now()
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: 'Server error' } })
      } as Response)

      try {
        await client.createChatCompletion(messages, (update) => {
          progressUpdates.push(update)
        })
      } catch (error) {
        // Expected to fail after retries
      }

      const elapsedTime = Date.now() - startTime
      expect(elapsedTime).toBeGreaterThan(200) // Should have waited for retry delays
    })

    it('should work without progress callback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse)
      } as Response)

      const result = await client.createChatCompletion(messages)
      expect(result).toEqual(mockSuccessResponse)
    })
  })

  describe('extractDataDictionary', () => {
    const mockDataDictionaryResponse = {
      choices: [{
        message: { 
          content: JSON.stringify({
            version: '1.0',
            generatedAtIso: '2025-01-15T10:30:00Z',
            events: [{
              event_name: 'user_login_attempt',
              event_type: 'intent',
              event_action_type: 'action',
              event_purpose: 'Track user login attempts'
            }]
          }), 
          role: 'assistant' 
        },
        finish_reason: 'stop'
      }],
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
    }

    it('should extract data dictionary with progress updates', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDataDictionaryResponse)
      } as Response)

      const result = await client.extractDataDictionary(
        'User can log in to the system',
        { fileName: 'test.md' },
        (update) => progressUpdates.push(update)
      )

      expect(result.dataDictionary).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.reasoning).toContain('events')
      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates.some(u => u.state === 'completed')).toBe(true)
    })

    it('should handle malformed JSON response', async () => {
      const progressUpdates: ProgressUpdate[] = []
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { content: 'invalid json', role: 'assistant' },
            finish_reason: 'stop'
          }]
        })
      } as Response)

      const result = await client.extractDataDictionary(
        'Test input',
        {},
        (update) => progressUpdates.push(update)
      )

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/Critical parsing error/)
      expect(result.dataDictionary.events).toHaveLength(0)
    })

    it('should handle JSON in markdown code blocks', async () => {
      const progressUpdates: ProgressUpdate[] = []
      const jsonContent = {
        version: '1.0',
        events: [{ 
          event_name: 'test_event', 
          event_type: 'intent',
          event_action_type: 'action',
          event_purpose: 'Test event purpose',
          when_to_fire: 'Test trigger',
          actor: 'user',
          object: 'test',
          context_surface: 'test_page',
          properties: [],
          lifecycle_status: 'proposed'
        }]
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { 
              content: `\`\`\`json\n${JSON.stringify(jsonContent)}\n\`\`\``,
              role: 'assistant' 
            },
            finish_reason: 'stop'
          }]
        })
      } as Response)

      const result = await client.extractDataDictionary(
        'Test input',
        {},
        (update) => progressUpdates.push(update)
      )

      expect(result.dataDictionary.events).toHaveLength(1)
      expect(result.dataDictionary.events[0].event_name).toBe('test_event')
      expect(result.dataDictionary.events[0].event_type).toBe('intent')
      expect(result.isValid).toBe(true)
    })

    it('should calculate confidence score correctly', async () => {
      const highQualityEvent = {
        event_name: 'user_login_successful',
        event_type: 'success',
        event_action_type: 'action',
        event_purpose: 'Track successful user authentication to measure conversion',
        when_to_fire: 'After successful authentication',
        actor: 'User',
        object: 'Authentication System',
        context_surface: 'Login Page',
        properties: [{ name: 'user_id', type: 'string', required: true }],
        datadog_api: 'addAction'
      }

      const mockResponse = {
        choices: [{
          message: { 
            content: JSON.stringify({
              version: '1.0',
              events: [highQualityEvent]
            }),
            role: 'assistant' 
          },
          finish_reason: 'stop'
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await client.extractDataDictionary('Test input')
      
      expect(result.confidence).toBeGreaterThan(80) // High quality event should score well
    })

    it('should use uncertainty prompt for complex documents', async () => {
      const progressUpdates: ProgressUpdate[] = []
      const mockResponse = {
        choices: [{
          message: { 
            content: JSON.stringify({
              version: '1.0',
              events: [{
                event_name: 'complex_feature_used',
                event_type: 'intent',
                event_action_type: 'action',
                event_purpose: 'Track usage of complex feature - uncertain about specific implementation details',
                when_to_fire: 'When user interacts with feature',
                actor: 'user',
                object: 'feature',
                context_surface: 'app',
                properties: [],
                lifecycle_status: 'proposed',
                notes: 'Implementation details TBD - need to clarify tracking requirements'
              }]
            }),
            role: 'assistant' 
          },
          finish_reason: 'stop'
        }]
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await client.extractDataDictionary(
        'This document contains TBD sections and uncertain requirements...',
        { 
          documentStructure: { 
            complexity: 'high',
            headings: [{ text: 'Test Heading', level: 1 }],
            sections: [{ title: 'Test', content: 'test content' }],
            estimatedReadingTime: 5
          } 
        },
        (update) => progressUpdates.push(update)
      )

      // Should detect pressure test issues from the post-processor
      expect(result.uncertainties.length).toBeGreaterThan(0)
      expect(result.uncertainties.some(u => 
        u.includes('Intent event with minimal context')
      )).toBe(true)
      expect(result.isValid).toBe(true)
    })

    it('should detect uncertainties in events', async () => {
      const uncertainEvent = {
        event_name: 'uncertain_action',
        event_type: 'intent',
        notes: 'Uncertain about when to fire this event',
        properties: []
      }

      const mockResponse = {
        choices: [{
          message: { 
            content: JSON.stringify({
              version: '1.0',
              events: [uncertainEvent]
            }),
            role: 'assistant' 
          },
          finish_reason: 'stop'
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await client.extractDataDictionary('Test input')
      
      expect(result.uncertainties).toBeDefined()
      expect(result.uncertainties!.length).toBeGreaterThan(0)
      expect(result.uncertainties![0]).toContain('uncertain_action')
    })
  })

  describe('validateOpenAIConfig', () => {
    beforeEach(() => {
      // Reset mock env vars
      mockEnv.VITE_OPENAI_API_KEY = ''
      mockEnv.VITE_OPENAI_TEMPERATURE = '0.2'
      mockEnv.VITE_OPENAI_TIMEOUT = '30000'
      mockEnv.VITE_OPENAI_MAX_RETRIES = '3'
      mockEnv.VITE_OPENAI_RETRY_DELAY = '1000'
    })

    it('should validate required API key', () => {
      const result = validateOpenAIConfig()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('VITE_OPENAI_API_KEY is required')
    })

    it('should validate temperature range', () => {
      mockEnv.VITE_OPENAI_API_KEY = 'test'
      mockEnv.VITE_OPENAI_TEMPERATURE = '3.0'
      
      const result = validateOpenAIConfig()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('VITE_OPENAI_TEMPERATURE must be a number between 0 and 2')
      
      // Reset for other tests
      mockEnv.VITE_OPENAI_API_KEY = ''
      mockEnv.VITE_OPENAI_TEMPERATURE = '0.2'
    })

    it('should validate timeout minimum', () => {
      mockEnv.VITE_OPENAI_API_KEY = 'test'
      mockEnv.VITE_OPENAI_TIMEOUT = '500'
      
      const result = validateOpenAIConfig()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('VITE_OPENAI_TIMEOUT must be a number >= 1000 (milliseconds)')
      
      // Reset for other tests
      mockEnv.VITE_OPENAI_API_KEY = ''
      mockEnv.VITE_OPENAI_TIMEOUT = '30000'
    })

    it('should validate max retries range', () => {
      mockEnv.VITE_OPENAI_API_KEY = 'test'
      mockEnv.VITE_OPENAI_MAX_RETRIES = '15'
      
      const result = validateOpenAIConfig()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('VITE_OPENAI_MAX_RETRIES must be a number between 0 and 10')
      
      // Reset for other tests
      mockEnv.VITE_OPENAI_API_KEY = ''
      mockEnv.VITE_OPENAI_MAX_RETRIES = '3'
    })

    it('should validate retry delay minimum', () => {
      mockEnv.VITE_OPENAI_API_KEY = 'test'
      mockEnv.VITE_OPENAI_RETRY_DELAY = '50'
      
      const result = validateOpenAIConfig()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('VITE_OPENAI_RETRY_DELAY must be a number >= 100 (milliseconds)')
      
      // Reset for other tests
      mockEnv.VITE_OPENAI_API_KEY = ''
      mockEnv.VITE_OPENAI_RETRY_DELAY = '1000'
    })

    it('should pass with valid configuration', () => {
      mockEnv.VITE_OPENAI_API_KEY = 'test'
      mockEnv.VITE_OPENAI_TEMPERATURE = '0.2'
      mockEnv.VITE_OPENAI_TIMEOUT = '30000'
      mockEnv.VITE_OPENAI_MAX_RETRIES = '3'
      mockEnv.VITE_OPENAI_RETRY_DELAY = '1000'
      
      const result = validateOpenAIConfig()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      
      // Reset for other tests
      mockEnv.VITE_OPENAI_API_KEY = ''
    })
  })
})