/**
 * Application configuration and environment variable management
 */

export interface AppConfig {
  openai: {
    apiKey: string
    baseUrl: string
    model: string
    temperature: number
    timeout: number
  }
  app: {
    env: string
    debugMode: boolean
  }
}

export function getAppConfig(): AppConfig {
  return {
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.2'),
      timeout: parseInt(import.meta.env.VITE_OPENAI_TIMEOUT || '30000', 10)
    },
    app: {
      env: import.meta.env.VITE_APP_ENV || 'development',
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
    }
  }
}

export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = getAppConfig()
  
  // Validate required fields
  if (!config.openai.apiKey) {
    errors.push('OpenAI API key is required (VITE_OPENAI_API_KEY)')
  }
  
  // Validate numeric ranges
  if (isNaN(config.openai.temperature) || config.openai.temperature < 0 || config.openai.temperature > 2) {
    errors.push('OpenAI temperature must be between 0 and 2')
  }
  
  if (isNaN(config.openai.timeout) || config.openai.timeout < 1000) {
    errors.push('OpenAI timeout must be at least 1000ms')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}