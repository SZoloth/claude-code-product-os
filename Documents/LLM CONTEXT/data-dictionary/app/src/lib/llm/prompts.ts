/**
 * System and user prompts for LLM transformation following Section 12 requirements
 * Aligned with Crystal Widjaja's analytics best practices for actionable event tracking
 */

import { DataDictionary } from '../schema/dataDictionary'

export interface PromptContext {
  documentText: string
  fileName?: string
  fileSize?: number
  documentStructure?: {
    headings: Array<{ text: string; level: number }>
    sections: Array<{ title?: string; content: string }>
    complexity: 'low' | 'medium' | 'high'
    estimatedReadingTime: number
  }
}

export interface PromptResponse {
  dataDictionary: DataDictionary
  confidence: number
  reasoning: string
  uncertainties?: string[]
}

/**
 * System prompt following Section 12 requirements for event analytics extraction
 */
export const SYSTEM_PROMPT = `You are an expert Product Analytics Engineer specializing in extracting actionable event tracking specifications from product documents. Your role is to analyze product documentation and generate a comprehensive data dictionary following proven analytics best practices.

## Core Principles (Section 12 Framework)

You follow Crystal Widjaja's proven analytics methodology that focuses on Intent → Success → Failure event patterns to create actionable insights rather than vanity metrics.

### Event Classification Framework:
1. **Intent Events**: User actions that signal intention to accomplish a goal
2. **Success Events**: Completed achievements of user goals  
3. **Failure Events**: Explicit errors or implicit drop-offs preventing success

### Property Guidelines:
- Track context that enables segmentation and "why" analysis
- Include user profile, marketing context, action context, and environmental factors
- Always ask: "If this were the last event tracked, what would we want to know?"

## Data Dictionary Schema Requirements

Generate events conforming to this exact structure:

\`\`\`typescript
interface DataDictionaryEvent {
  event_name: string           // snake_case, unique, descriptive
  event_type: 'intent' | 'success' | 'failure'
  event_action_type: 'action' | 'error' | 'feature_flag'
  event_purpose: string        // Clear business justification
  user_story?: string         // Optional user story format
  when_to_fire: string        // Specific trigger conditions
  actor: string               // Who performs this action
  object: string              // What is being acted upon
  context_surface: string     // Where in the product this happens
  properties: EventProperty[] // Context for segmentation
  context_keys?: string[]     // Key context properties
  ownership_team?: string     // Responsible team
  priority?: string           // Low/Medium/High
  lifecycle_status: 'proposed' | 'approved' | 'implemented' | 'deprecated'
  notes?: string              // Include when uncertain or needs clarification
  datadog_api: 'addAction' | 'addError' | 'addFeatureFlagEvaluation'
  datadog_sample_code?: string // Implementation example
  error_code?: string         // Required for failure events
  error_message?: string      // Required for failure events
}
\`\`\`

## Quality Standards

### Pressure Test Each Event:
"If 99% of users performed this action, what would I do about it? What would it tell me?"
If you can't identify actionable insights, the event may not be worth tracking.

### Essential Context Properties:
- **User Profile**: Role, experience level, preferences that influence behavior
- **Journey Context**: How they arrived, what they've done previously  
- **Environmental**: System state, available options, constraints
- **Outcome**: Results, performance metrics, success indicators

### Naming Conventions:
- Use snake_case for all names
- Be specific and descriptive
- Follow pattern: {object}_{action}_{outcome} when applicable
- Examples: user_login_successful, cart_item_added, payment_process_failed

## Analysis Process

1. **Identify Core User Goals**: What are users trying to accomplish?
2. **Map User Journeys**: Document the paths to achieve those goals
3. **Extract Intent Events**: Actions that signal goal pursuit
4. **Define Success Events**: Successful goal completion
5. **Identify Failure Points**: Where and why users fail
6. **Determine Essential Context**: Properties needed for actionable analysis

## Output Format

Return valid JSON matching this exact structure:

\`\`\`json
{
  "version": "1.0",
  "generatedAtIso": "2025-01-15T10:30:00Z",
  "events": [
    // Array of DataDictionaryEvent objects
  ]
}
\`\`\`

## Important Guidelines

- Focus on business-critical user journeys and outcomes
- Prioritize events that enable "why" analysis over simple counts
- Include failure events with specific error context
- Add notes field when uncertain about implementation details
- Ensure event names are unique and follow snake_case convention
- Map appropriate datadog_api values (addAction for intent/success, addError for failures)
- Set realistic priority levels based on business impact

Remember: The goal is actionable analytics that help teams understand what successful users do differently from unsuccessful users, not just counting what users do.`

/**
 * Creates a user prompt for document analysis
 */
export function createUserPrompt(context: PromptContext): string {
  const { documentText, fileName, documentStructure } = context
  
  let prompt = `Please analyze the following product documentation and extract a comprehensive data dictionary for event tracking.

## Document Context
${fileName ? `**File**: ${fileName}` : ''}
${documentStructure ? `
**Document Complexity**: ${documentStructure.complexity}
**Estimated Reading Time**: ${documentStructure.estimatedReadingTime} minutes
**Main Topics**: ${documentStructure.headings.filter(h => h.level <= 2).map(h => h.text).slice(0, 5).join(', ')}
` : ''}

## Document Content

${documentText}

## Analysis Requirements

1. **Identify Core User Journeys**: What are the main workflows and user goals described?
2. **Extract Event Flows**: Map out Intent → Success → Failure patterns for each journey
3. **Define Essential Context**: Determine properties needed for actionable segmentation
4. **Prioritize by Impact**: Focus on events that drive key business outcomes

## Specific Focus Areas

- User onboarding and activation flows
- Core product functionality and feature usage
- Commerce/transaction flows if present
- Error conditions and failure scenarios
- User preference and personalization events
- Performance and technical metrics where business-relevant

## Quality Checklist

Before finalizing each event, ensure:
- [ ] Event name is unique and follows snake_case convention
- [ ] Event type correctly reflects intent/success/failure
- [ ] Properties enable meaningful user segmentation
- [ ] "Why" analysis is possible with the tracked data
- [ ] Business value is clear from event_purpose
- [ ] Failure events include appropriate error context

Generate a complete data dictionary that enables teams to understand user behavior patterns and optimize the product experience based on data-driven insights.`

  return prompt
}

/**
 * Creates a follow-up prompt for validation and refinement
 */
export function createValidationPrompt(
  initialResponse: string, 
  validationErrors: string[]
): string {
  return `The initial event extraction needs refinement. Please review and correct the following issues:

## Validation Errors
${validationErrors.map((error, index) => `${index + 1}. ${error}`).join('\n')}

## Original Response
${initialResponse}

## Requirements for Correction

1. **Schema Compliance**: Ensure all events match the exact DataDictionaryEvent interface
2. **Unique Names**: All event_name values must be unique and snake_case
3. **Required Fields**: All mandatory fields must be present and valid
4. **Failure Events**: Must include error_code and error_message when event_type is 'failure'
5. **Property Validation**: All properties must have valid types and examples

Please return the corrected data dictionary as valid JSON, addressing all validation errors while maintaining the analytical quality and business relevance of the events.`
}

/**
 * Creates a prompt for handling uncertainty and adding notes
 */
export function createUncertaintyPrompt(context: PromptContext): string {
  return `${createUserPrompt(context)}

## Special Instructions for Uncertainty Handling

When you encounter any of the following situations, add detailed notes to the event:

1. **Ambiguous Implementation**: When the document doesn't clearly specify when or how to track something
2. **Multiple Interpretations**: When a feature could be tracked in different ways
3. **Missing Context**: When key information for proper implementation is not provided
4. **Complex Business Logic**: When the tracking depends on complex rules not fully explained

## Pressure Testing Guidelines

For each event, explicitly consider:
- "What would I do if this metric was surprisingly high or low?"
- "How would this help teams prioritize product improvements?"
- "What follow-up questions would this data enable?"

If you cannot answer these questions confidently, either refine the event or add detailed notes explaining the uncertainty and suggesting what additional context would be needed.

Focus on creating events that will genuinely help product teams make better decisions rather than just collecting data for its own sake.`
}