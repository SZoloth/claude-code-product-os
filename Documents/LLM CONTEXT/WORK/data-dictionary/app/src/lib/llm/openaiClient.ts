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
        
        // For non-timeout errors, don't retry - re-throw the original error
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

  /**
   * Determine if we should use the uncertainty-focused prompt
   * based on document complexity and content indicators
   */
  private shouldUseUncertaintyPrompt(
    input: string, 
    context?: { fileName?: string; fileSize?: number; documentStructure?: any }
  ): boolean {
    // Use uncertainty prompt for complex documents
    if (context?.documentStructure?.complexity === 'high') {
      return true
    }
    
    // Use uncertainty prompt for very large documents
    if (context?.fileSize && context.fileSize > 100000) { // > 100KB
      return true
    }
    
    // Use uncertainty prompt if the document contains uncertainty indicators
    const uncertaintyIndicators = [
      'tbd', 'todo', 'placeholder', 'draft', 'preliminary', 'proposal',
      'concept', 'idea', 'maybe', 'possibly', 'might', 'could be',
      'unclear', 'uncertain', 'depends on', 'to be determined',
      'needs research', 'open question', 'assumption'
    ]
    
    const inputLower = input.toLowerCase()
    const hasUncertaintyIndicators = uncertaintyIndicators.some(indicator => 
      inputLower.includes(indicator)
    )
    
    if (hasUncertaintyIndicators) {
      return true
    }
    
    // Use uncertainty prompt for technical specs or wireframes that might be implementation-light
    const techSpecIndicators = [
      'wireframe', 'mockup', 'prototype', 'user story', 'acceptance criteria',
      'technical spec', 'api spec', 'endpoint', 'database', 'schema'
    ]
    
    const hasTechSpecIndicators = techSpecIndicators.some(indicator => 
      inputLower.includes(indicator)
    )
    
    return hasTechSpecIndicators
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
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const { createUserPrompt, createUncertaintyPrompt, SYSTEM_PROMPT } = await import('./prompts')
    const { DataDictionaryPostProcessor } = await import('./postProcessor')
    
    const promptContext = {
      documentText: input,
      fileName: context?.fileName,
      fileSize: context?.fileSize,
      documentStructure: context?.documentStructure
    }
    
    // Determine if we should use the uncertainty-focused prompt
    const useUncertaintyPrompt = this.shouldUseUncertaintyPrompt(input, context)
    const userPrompt = useUncertaintyPrompt 
      ? createUncertaintyPrompt(promptContext)
      : createUserPrompt(promptContext)
    
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

      // Use the new post-processor for comprehensive normalization
      onProgress?.({
        state: 'processing_response',
        message: 'Normalizing and validating response...',
        elapsedMs: Date.now() - (Date.now() - 1000) // Approximate elapsed time
      })

      const result = DataDictionaryPostProcessor.processLLMResponse(content)
      
      return {
        dataDictionary: result.dataDictionary,
        confidence: result.confidence,
        reasoning: result.reasoning,
        uncertainties: result.uncertainties,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings
      }

    } catch (error) {
      throw new Error(
        `Failed to extract data dictionary: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
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