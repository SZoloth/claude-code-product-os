import {
  SYSTEM_PROMPT,
  createUserPrompt,
  createValidationPrompt,
  createUncertaintyPrompt,
  type PromptContext
} from './prompts'

describe('prompts', () => {
  describe('SYSTEM_PROMPT', () => {
    it('should contain Section 12 framework reference', () => {
      expect(SYSTEM_PROMPT).toContain('Section 12 Framework')
    })

    it('should reference Crystal Widjaja methodology', () => {
      expect(SYSTEM_PROMPT).toContain('Crystal Widjaja')
      expect(SYSTEM_PROMPT).toContain('Intent → Success → Failure')
    })

    it('should include event type definitions', () => {
      expect(SYSTEM_PROMPT).toContain('Intent Events')
      expect(SYSTEM_PROMPT).toContain('Success Events')
      expect(SYSTEM_PROMPT).toContain('Failure Events')
    })

    it('should specify schema requirements', () => {
      expect(SYSTEM_PROMPT).toContain('DataDictionaryEvent')
      expect(SYSTEM_PROMPT).toContain('event_name')
      expect(SYSTEM_PROMPT).toContain('event_type')
      expect(SYSTEM_PROMPT).toContain('snake_case')
    })

    it('should include pressure testing guidance', () => {
      expect(SYSTEM_PROMPT).toContain('Pressure Test Each Event')
      expect(SYSTEM_PROMPT).toContain('99% of users performed this action')
    })

    it('should specify output format as JSON', () => {
      expect(SYSTEM_PROMPT).toContain('Return valid JSON')
      expect(SYSTEM_PROMPT).toContain('"events"')
    })

    it('should emphasize actionable analytics', () => {
      expect(SYSTEM_PROMPT).toContain('actionable analytics')
      expect(SYSTEM_PROMPT).toContain('"why" analysis')
    })
  })

  describe('createUserPrompt', () => {
    const sampleContext: PromptContext = {
      documentText: 'User can sign up, log in, and create posts. If login fails, show error.',
      fileName: 'user-flows.md',
      documentStructure: {
        headings: [
          { text: 'User Authentication', level: 1 },
          { text: 'Post Creation', level: 2 }
        ],
        sections: [
          { title: 'User Authentication', content: 'Login and signup flows' },
          { title: 'Post Creation', content: 'Creating and publishing posts' }
        ],
        complexity: 'medium' as const,
        estimatedReadingTime: 5
      }
    }

    it('should include document context when provided', () => {
      const prompt = createUserPrompt(sampleContext)
      
      expect(prompt).toContain('user-flows.md')
      expect(prompt).toContain('medium')
      expect(prompt).toContain('5 minutes')
      expect(prompt).toContain('User Authentication, Post Creation')
    })

    it('should include the document text', () => {
      const prompt = createUserPrompt(sampleContext)
      expect(prompt).toContain('User can sign up, log in, and create posts')
    })

    it('should include analysis requirements', () => {
      const prompt = createUserPrompt(sampleContext)
      
      expect(prompt).toContain('Identify Core User Journeys')
      expect(prompt).toContain('Intent → Success → Failure patterns')
      expect(prompt).toContain('Essential Context')
      expect(prompt).toContain('Prioritize by Impact')
    })

    it('should include specific focus areas', () => {
      const prompt = createUserPrompt(sampleContext)
      
      expect(prompt).toContain('User onboarding')
      expect(prompt).toContain('Core product functionality')
      expect(prompt).toContain('Error conditions')
      expect(prompt).toContain('Performance and technical metrics')
    })

    it('should include quality checklist', () => {
      const prompt = createUserPrompt(sampleContext)
      
      expect(prompt).toContain('Quality Checklist')
      expect(prompt).toContain('snake_case convention')
      expect(prompt).toContain('"Why" analysis is possible')
      expect(prompt).toContain('Business value is clear')
    })

    it('should handle minimal context gracefully', () => {
      const minimalContext: PromptContext = {
        documentText: 'Simple app description'
      }
      
      const prompt = createUserPrompt(minimalContext)
      expect(prompt).toContain('Simple app description')
      expect(prompt).toContain('Analysis Requirements')
    })
  })

  describe('createValidationPrompt', () => {
    const sampleResponse = '{"events": [{"event_name": "user_login"}]}'
    const sampleErrors = [
      'Missing event_type field',
      'Invalid snake_case format',
      'No properties defined'
    ]

    it('should include validation errors', () => {
      const prompt = createValidationPrompt(sampleResponse, sampleErrors)
      
      expect(prompt).toContain('Validation Errors')
      expect(prompt).toContain('1. Missing event_type field')
      expect(prompt).toContain('2. Invalid snake_case format')
      expect(prompt).toContain('3. No properties defined')
    })

    it('should include the original response', () => {
      const prompt = createValidationPrompt(sampleResponse, sampleErrors)
      expect(prompt).toContain('Original Response')
      expect(prompt).toContain(sampleResponse)
    })

    it('should specify correction requirements', () => {
      const prompt = createValidationPrompt(sampleResponse, sampleErrors)
      
      expect(prompt).toContain('Schema Compliance')
      expect(prompt).toContain('Unique Names')
      expect(prompt).toContain('Required Fields')
      expect(prompt).toContain('Failure Events')
      expect(prompt).toContain('Property Validation')
    })

    it('should request corrected JSON format', () => {
      const prompt = createValidationPrompt(sampleResponse, sampleErrors)
      expect(prompt).toContain('return the corrected data dictionary as valid JSON')
    })
  })

  describe('createUncertaintyPrompt', () => {
    const sampleContext: PromptContext = {
      documentText: 'Vague feature description with ambiguous requirements',
      fileName: 'unclear-specs.md'
    }

    it('should include the base user prompt', () => {
      const prompt = createUncertaintyPrompt(sampleContext)
      expect(prompt).toContain('Vague feature description')
      expect(prompt).toContain('Analysis Requirements')
    })

    it('should include uncertainty handling instructions', () => {
      const prompt = createUncertaintyPrompt(sampleContext)
      
      expect(prompt).toContain('Special Instructions for Uncertainty Handling')
      expect(prompt).toContain('Ambiguous Implementation')
      expect(prompt).toContain('Multiple Interpretations')
      expect(prompt).toContain('Missing Context')
      expect(prompt).toContain('Complex Business Logic')
    })

    it('should include pressure testing guidelines', () => {
      const prompt = createUncertaintyPrompt(sampleContext)
      
      expect(prompt).toContain('Pressure Testing Guidelines')
      expect(prompt).toContain('What would I do if this metric was surprisingly high')
      expect(prompt).toContain('How would this help teams prioritize')
      expect(prompt).toContain('What follow-up questions would this data enable')
    })

    it('should emphasize decision-making over data collection', () => {
      const prompt = createUncertaintyPrompt(sampleContext)
      expect(prompt).toContain('help product teams make better decisions')
      expect(prompt).toContain('rather than just collecting data')
    })
  })

  describe('prompt integration', () => {
    it('should create consistent messaging across prompt types', () => {
      const context: PromptContext = {
        documentText: 'Sample document',
        fileName: 'test.md'
      }
      
      const userPrompt = createUserPrompt(context)
      const uncertaintyPrompt = createUncertaintyPrompt(context)
      
      // Both should contain core analysis requirements
      expect(userPrompt).toContain('Intent → Success → Failure patterns')
      expect(uncertaintyPrompt).toContain('Intent → Success → Failure patterns')
      
      // Both should reference business value
      expect(userPrompt).toContain('business outcomes')
      expect(uncertaintyPrompt).toContain('business')
    })

    it('should maintain focus on actionable analytics throughout', () => {
      const context: PromptContext = { documentText: 'Test content' }
      const validationErrors = ['Test error']
      const originalResponse = '{"events": []}'
      
      const userPrompt = createUserPrompt(context)
      const validationPrompt = createValidationPrompt(originalResponse, validationErrors)
      const uncertaintyPrompt = createUncertaintyPrompt(context)
      
      // All should emphasize actionable insights
      const prompts = [userPrompt, validationPrompt, uncertaintyPrompt]
      prompts.forEach(prompt => {
        expect(prompt.toLowerCase()).toMatch(/action|insight|decision|analytic/)
      })
    })
  })
})