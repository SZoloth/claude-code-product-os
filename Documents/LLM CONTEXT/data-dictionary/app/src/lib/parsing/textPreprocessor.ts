/**
 * Text preprocessing utilities for plain text input (not files)
 * Used for text typed directly into the textarea
 */

import { preprocessText, type PreprocessingResult } from './preprocess'

export interface TextInputResult {
  originalText: string
  processedText: string
  preprocessing: PreprocessingResult
  suggestions: string[]
  needsChunking: boolean
}

/**
 * Processes text input from the textarea with user-friendly feedback
 */
export function processTextInput(text: string): TextInputResult {
  const preprocessingResult = preprocessText(text)
  const suggestions: string[] = []
  
  // Generate helpful suggestions for users
  if (preprocessingResult.structure.headings.length === 0 && text.length > 500) {
    suggestions.push('Consider adding headings to structure your content (e.g., # Main Section)')
  }
  
  if (preprocessingResult.structure.metadata.primaryTopics.length === 0) {
    suggestions.push('Try to include clear topic descriptions and key workflows')
  }
  
  if (preprocessingResult.statistics.wordCount < 50) {
    suggestions.push('Provide more detail about user journeys and business processes for better AI analysis')
  }
  
  if (preprocessingResult.statistics.wordCount > 5000) {
    suggestions.push('Consider breaking down very long descriptions into focused sections')
  }
  
  // Check for missing key information
  const hasUserJourneys = /journey|workflow|process|step|flow/i.test(text)
  if (!hasUserJourneys) {
    suggestions.push('Include user journeys and workflows to help identify relevant events')
  }
  
  const hasActions = /click|submit|create|delete|update|view|navigate/i.test(text)
  if (!hasActions) {
    suggestions.push('Describe specific user actions and interactions')
  }
  
  const hasErrorScenarios = /error|fail|timeout|invalid|exception/i.test(text)
  if (!hasErrorScenarios) {
    suggestions.push('Consider adding error scenarios and edge cases')
  }
  
  return {
    originalText: text,
    processedText: preprocessingResult.cleanedText,
    preprocessing: preprocessingResult,
    suggestions,
    needsChunking: preprocessingResult.cleanedText.length > 60000
  }
}

/**
 * Validates text input and provides feedback
 */
export function validateTextInput(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!text.trim()) {
    errors.push('Please provide a product description')
    return { isValid: false, errors }
  }
  
  if (text.trim().length < 20) {
    errors.push('Description is too short - please provide more detail')
  }
  
  if (text.length > 100000) {
    errors.push('Description is too long - consider uploading as a document instead')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Gets quality score for text input (0-100)
 */
export function getTextQualityScore(result: TextInputResult): {
  score: number
  reasons: string[]
} {
  let score = 50 // Base score
  const reasons: string[] = []
  
  // Word count scoring
  const wordCount = result.preprocessing.statistics.wordCount
  if (wordCount >= 100 && wordCount <= 2000) {
    score += 20
    reasons.push('Good length for analysis')
  } else if (wordCount < 50) {
    score -= 20
    reasons.push('Too short - needs more detail')
  } else if (wordCount > 5000) {
    score -= 10
    reasons.push('Very long - consider structuring better')
  }
  
  // Structure scoring
  if (result.preprocessing.structure.headings.length > 0) {
    score += 15
    reasons.push('Well-structured with headings')
  }
  
  if (result.preprocessing.structure.sections.length > 2) {
    score += 10
    reasons.push('Good sectional organization')
  }
  
  // Content analysis scoring
  const text = result.originalText.toLowerCase()
  
  if (text.includes('user') || text.includes('customer')) {
    score += 5
    reasons.push('Mentions users/customers')
  }
  
  if (/journey|workflow|process|flow/.test(text)) {
    score += 10
    reasons.push('Describes workflows/journeys')
  }
  
  if (/click|submit|create|delete|update|view/.test(text)) {
    score += 10
    reasons.push('Includes specific actions')
  }
  
  if (/error|fail|exception/.test(text)) {
    score += 5
    reasons.push('Covers error scenarios')
  }
  
  // Complexity scoring
  if (result.preprocessing.structure.metadata.complexity === 'medium') {
    score += 5
    reasons.push('Good complexity level')
  } else if (result.preprocessing.structure.metadata.complexity === 'high') {
    score -= 5
    reasons.push('High complexity - may need simplification')
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    reasons
  }
}