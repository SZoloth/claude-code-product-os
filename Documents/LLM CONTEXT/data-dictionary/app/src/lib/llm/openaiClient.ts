/**
 * OpenAI API client configuration and utilities
 * Configured with temperature 0.2 for consistent data extraction
 */

// Helper to get environment variables - makes testing easier
function getEnv(key: string, defaultValue: string = ''): string {
  try {
    // For Vite environments
    if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
      return (globalThis as any).import.meta.env[key] ?? defaultValue
    }
    // Production fallback
    return defaultValue
  } catch {
    return defaultValue
  }
}

export interface OpenAIConfig {
  apiKey: string
  baseUrl: string
  model: string
  temperature: number
  timeout: number
  maxRetries: number
  retryDelay: number
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export type ProgressState = 
  | 'idle'
  | 'preparing'
  | 'calling_llm'
  | 'retrying'
  | 'processing_response'
  | 'completed'
  | 'failed'

export interface ProgressUpdate {
  state: ProgressState
  message: string
  attempt?: number
  maxAttempts?: number
  elapsedMs?: number
}

export class OpenAIClient {
  private config: OpenAIConfig

  constructor(config?: Partial<OpenAIConfig>) {
    this.config = {
      apiKey: config?.apiKey || getEnv('VITE_OPENAI_API_KEY'),
      baseUrl: config?.baseUrl || getEnv('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
      model: config?.model || getEnv('VITE_OPENAI_MODEL', 'gpt-4o-mini'),
      temperature: config?.temperature ?? parseFloat(getEnv('VITE_OPENAI_TEMPERATURE', '0.2')),
      timeout: config?.timeout ?? parseInt(getEnv('VITE_OPENAI_TIMEOUT', '30000'), 10),
      maxRetries: config?.maxRetries ?? parseInt(getEnv('VITE_OPENAI_MAX_RETRIES', '3'), 10),
      retryDelay: config?.retryDelay ?? parseInt(getEnv('VITE_OPENAI_RETRY_DELAY', '1000'), 10)
    }

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your .env file.')
    }
  }

  async createChatCompletion(
    messages: OpenAIMessage[], 
    onProgress?: (update: ProgressUpdate) => void
  ): Promise<OpenAIResponse> {
    const startTime = Date.now()
    let attempt = 1

    onProgress?.({
      state: 'preparing',
      message: 'Preparing OpenAI request...',
      attempt,
      maxAttempts: this.config.maxRetries + 1
    })

    while (attempt <= this.config.maxRetries + 1) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      try {
        onProgress?.({
          state: attempt === 1 ? 'calling_llm' : 'retrying',
          message: attempt === 1 ? 'Calling OpenAI API...' : `Retrying request (attempt ${attempt})...`,
          attempt,
          maxAttempts: this.config.maxRetries + 1,
          elapsedMs: Date.now() - startTime
        })

        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          const errorMessage = `OpenAI API error: ${response.status} - ${errorData.error?.message || 'Request failed'}`
          
          // Check if error is retryable
          if (this.isRetryableError(response.status) && attempt <= this.config.maxRetries) {
            clearTimeout(timeoutId)
            await this.delay(this.calculateRetryDelay(attempt))
            attempt++
            continue
          }
          
          throw new Error(errorMessage)
        }

        onProgress?.({
          state: 'processing_response',
          message: 'Processing OpenAI response...',
          attempt,
          maxAttempts: this.config.maxRetries + 1,
          elapsedMs: Date.now() - startTime
        })

        const data = await response.json()
        
        onProgress?.({
          state: 'completed',
          message: 'Request completed successfully',
          attempt,
          maxAttempts: this.config.maxRetries + 1,
          elapsedMs: Date.now() - startTime
        })

        return data as OpenAIResponse

      } catch (error) {
        clearTimeout(timeoutId)
        
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new Error(`Request timed out after ${this.config.timeout}ms`)
          
          if (attempt <= this.config.maxRetries) {
            await this.delay(this.calculateRetryDelay(attempt))
            attempt++
            continue
          }
          
          onProgress?.({
            state: 'failed',
            message: 'Request failed after maximum retries',
            attempt,
            maxAttempts: this.config.maxRetries + 1,
            elapsedMs: Date.now() - startTime
          })
          
          throw timeoutError
        }
        
        // For non-timeout errors, check if retryable
        if (this.isRetryableError(500) && attempt <= this.config.maxRetries) {
          await this.delay(this.calculateRetryDelay(attempt))
          attempt++
          continue
        }
        
        onProgress?.({
          state: 'failed',
          message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          attempt,
          maxAttempts: this.config.maxRetries + 1,
          elapsedMs: Date.now() - startTime
        })
        
        throw error
      }
    }

    throw new Error('Maximum retries exceeded')
  }

  private isRetryableError(statusCode: number): boolean {
    // Retry on server errors, rate limiting, and timeouts
    return statusCode >= 500 || statusCode === 429 || statusCode === 408
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.retryDelay
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * baseDelay * 0.1 // 10% jitter
    return Math.min(exponentialDelay + jitter, 30000) // Cap at 30 seconds
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async extractDataDictionary(
    input: string,
    context?: {
      fileName?: string
      fileSize?: number
      documentStructure?: any
    },
    onProgress?: (update: ProgressUpdate) => void
  ): Promise<{
    dataDictionary: any
    confidence: number
    reasoning: string
    uncertainties?: string[]
  }> {
    const { createUserPrompt, SYSTEM_PROMPT } = await import('./prompts')
    
    const promptContext = {
      documentText: input,
      fileName: context?.fileName,
      fileSize: context?.fileSize,
      documentStructure: context?.documentStructure
    }
    
    const userPrompt = createUserPrompt(promptContext)
    
    const messages: OpenAIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]

    try {
      const response = await this.createChatCompletion(messages, onProgress)
      const content = response.choices[0]?.message?.content
      
      if (!content) {
        throw new Error('No response content received from OpenAI')
      }

      // Parse the JSON response
      let parsedResponse
      try {
        parsedResponse = JSON.parse(content)
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1])
        } else {
          throw new Error(`Failed to parse JSON response: ${parseError}`)
        }
      }

      // Validate the response structure
      if (!parsedResponse.events || !Array.isArray(parsedResponse.events)) {
        throw new Error('Invalid response format: missing events array')
      }

      return {
        dataDictionary: parsedResponse,
        confidence: this.calculateConfidence(parsedResponse),
        reasoning: this.generateReasoning(parsedResponse),
        uncertainties: this.extractUncertainties(parsedResponse)
      }

    } catch (error) {
      throw new Error(
        `Failed to extract data dictionary: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  private calculateConfidence(dataDictionary: any): number {
    if (!dataDictionary.events || dataDictionary.events.length === 0) {
      return 0
    }

    let totalScore = 0
    let eventCount = dataDictionary.events.length

    for (const event of dataDictionary.events) {
      let eventScore = 0
      
      // Required fields present
      if (event.event_name && event.event_type && event.when_to_fire) eventScore += 30
      if (event.properties && event.properties.length > 0) eventScore += 20
      if (event.event_purpose && event.event_purpose.length > 10) eventScore += 20
      if (event.actor && event.object) eventScore += 15
      if (event.context_surface) eventScore += 10
      if (event.datadog_api) eventScore += 5
      
      totalScore += eventScore
    }

    return Math.min(100, Math.round(totalScore / eventCount))
  }

  private generateReasoning(dataDictionary: any): string {
    const eventCount = dataDictionary.events?.length || 0
    const intentCount = dataDictionary.events?.filter((e: any) => e.event_type === 'intent').length || 0
    const successCount = dataDictionary.events?.filter((e: any) => e.event_type === 'success').length || 0
    const failureCount = dataDictionary.events?.filter((e: any) => e.event_type === 'failure').length || 0
    
    return `Extracted ${eventCount} events following Intent-Success-Failure pattern: ${intentCount} intent events, ${successCount} success events, and ${failureCount} failure events. Events focus on user journeys and actionable analytics rather than vanity metrics.`
  }

  private extractUncertainties(dataDictionary: any): string[] {
    const uncertainties: string[] = []
    
    if (!dataDictionary.events) return uncertainties
    
    for (const event of dataDictionary.events) {
      if (event.notes && event.notes.toLowerCase().includes('uncertain')) {
        uncertainties.push(`${event.event_name}: ${event.notes}`)
      }
      
      if (!event.properties || event.properties.length === 0) {
        uncertainties.push(`${event.event_name}: No context properties defined - may limit segmentation capabilities`)
      }
    }
    
    return uncertainties
  }
}

// Default client instance - lazy loading to avoid errors in test environments
let _defaultClient: OpenAIClient | null = null

export const openaiClient = new Proxy({} as OpenAIClient, {
  get(target, prop) {
    if (!_defaultClient) {
      _defaultClient = new OpenAIClient()
    }
    return _defaultClient[prop as keyof OpenAIClient]
  }
})

// Environment validation helper
export function validateOpenAIConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!getEnv('VITE_OPENAI_API_KEY')) {
    errors.push('VITE_OPENAI_API_KEY is required')
  }
  
  const temperature = parseFloat(getEnv('VITE_OPENAI_TEMPERATURE', '0.2'))
  if (isNaN(temperature) || temperature < 0 || temperature > 2) {
    errors.push('VITE_OPENAI_TEMPERATURE must be a number between 0 and 2')
  }
  
  const timeout = parseInt(getEnv('VITE_OPENAI_TIMEOUT', '30000'), 10)
  if (isNaN(timeout) || timeout < 1000) {
    errors.push('VITE_OPENAI_TIMEOUT must be a number >= 1000 (milliseconds)')
  }

  const maxRetries = parseInt(getEnv('VITE_OPENAI_MAX_RETRIES', '3'), 10)
  if (isNaN(maxRetries) || maxRetries < 0 || maxRetries > 10) {
    errors.push('VITE_OPENAI_MAX_RETRIES must be a number between 0 and 10')
  }

  const retryDelay = parseInt(getEnv('VITE_OPENAI_RETRY_DELAY', '1000'), 10)
  if (isNaN(retryDelay) || retryDelay < 100) {
    errors.push('VITE_OPENAI_RETRY_DELAY must be a number >= 100 (milliseconds)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}