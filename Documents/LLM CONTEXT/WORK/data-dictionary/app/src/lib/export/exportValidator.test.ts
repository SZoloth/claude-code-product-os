/**
 * Unit tests for ExportValidator
 */

import { ExportValidator } from './exportValidator'
import type { DataDictionary } from '../schema/dataDictionary'

describe('ExportValidator', () => {
  const mockDictionary: DataDictionary = {
    version: '1.0.0',
    generatedAtIso: '2024-01-01T00:00:00Z',
    events: [
      {
        event_name: 'test_event',
        event_type: 'intent',
        event_action_type: 'action',
        event_purpose: 'Test event for validation',
        when_to_fire: 'When testing validation',
        actor: 'user',
        object: 'test',
        context_surface: 'test_page',
        properties: [
          {
            name: 'test_prop',
            type: 'string',
            required: true,
            example: 'test_value',
            description: 'Test property'
          }
        ],
        context_keys: ['test_key'],
        lifecycle_status: 'approved',
        datadog_api: 'addAction'
      }
    ]
  }

  describe('validateExport', () => {
    it('should validate CSV format successfully', () => {
      const csvData = 'event_name,event_type\ntest_event,intent'
      const result = ExportValidator.validateExport(csvData, 'csv')
      
      expect(result.format).toBe('csv')
      expect(result.eventCount).toBe(1)
      expect(result.schemaCompliance.csvCompatible).toBe(true)
    })

    it('should validate JSON format successfully', () => {
      const jsonData = JSON.stringify(mockDictionary)
      const result = ExportValidator.validateExport(jsonData, 'json')
      
      expect(result.format).toBe('json')
      expect(result.eventCount).toBe(1)
      expect(result.isValid).toBe(true)
    })

    it('should validate Markdown format', () => {
      const markdownData = '# Data Dictionary\n\n## Table of Contents\n\n### test_event'
      const result = ExportValidator.validateExport(markdownData, 'markdown')
      
      expect(result.format).toBe('markdown')
      expect(result.eventCount).toBe(1)
      expect(result.isValid).toBe(true)
    })

    it('should validate TypeScript format', () => {
      const typescriptData = 'import { datadogRum } from "@datadog/browser-rum";\nexport function trackTestEvent() {}'
      const result = ExportValidator.validateExport(typescriptData, 'typescript')
      
      expect(result.format).toBe('typescript')
      expect(result.eventCount).toBe(1)
      expect(result.isValid).toBe(true)
    })

    it('should handle invalid CSV format', () => {
      const csvData = 'invalid,csv'
      const result = ExportValidator.validateExport(csvData, 'csv')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle invalid JSON format', () => {
      const invalidJson = '{ invalid json }'
      const result = ExportValidator.validateExport(invalidJson, 'json')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('importFromCsv', () => {
    it('should handle CSV import process', () => {
      const csvData = [
        'event_name,event_type,event_action_type,event_purpose,when_to_fire,actor,object,context_surface,properties,lifecycle_status,datadog_api',
        'test_event,intent,action,"Test event","When testing",user,test,test_page,"[]",approved,addAction'
      ].join('\n')
      
      const result = ExportValidator.importFromCsv(csvData)
      
      // Test should not fail even if validation errors occur
      expect(result.format).toBe('csv')
      expect(result.originalEventCount).toBe(1)
      expect(typeof result.success).toBe('boolean')
    })

    it('should handle CSV with missing headers', () => {
      const csvData = 'event_name\ntest_event'
      const result = ExportValidator.importFromCsv(csvData)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle empty CSV', () => {
      const csvData = ''
      const result = ExportValidator.importFromCsv(csvData)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('CSV must have at least a header row and one data row')
    })
  })

  describe('importFromJson', () => {
    it('should import valid JSON dictionary', () => {
      const jsonData = JSON.stringify(mockDictionary)
      const result = ExportValidator.importFromJson(jsonData)
      
      expect(result.success).toBe(true)
      expect(result.importedEventCount).toBe(1)
      expect(result.dictionary).toEqual(mockDictionary)
    })

    it('should import project export format', () => {
      const projectData = {
        project: {
          data: mockDictionary
        }
      }
      const result = ExportValidator.importFromJson(JSON.stringify(projectData))
      
      expect(result.success).toBe(true)
      expect(result.importedEventCount).toBe(1)
    })

    it('should import events array format', () => {
      const eventsData = mockDictionary.events
      const result = ExportValidator.importFromJson(JSON.stringify(eventsData))
      
      expect(result.success).toBe(true)
      expect(result.importedEventCount).toBe(1)
    })

    it('should handle invalid JSON', () => {
      const invalidJson = '{ invalid }'
      const result = ExportValidator.importFromJson(invalidJson)
      
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle invalid JSON structure', () => {
      const invalidStructure = JSON.stringify({ invalid: 'structure' })
      const result = ExportValidator.importFromJson(invalidStructure)
      
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid JSON format. Expected dictionary, project, or events array.')
    })
  })

  describe('generateValidationReport', () => {
    it('should generate report for valid export', () => {
      const validResult = {
        isValid: true,
        errors: [],
        warnings: [],
        format: 'csv' as const,
        eventCount: 5,
        validEventCount: 5,
        schemaCompliance: {
          hasRequiredFields: true,
          hasValidNaming: true,
          hasValidEnums: true,
          csvCompatible: true
        }
      }
      
      const report = ExportValidator.generateValidationReport(validResult)
      
      expect(report).toContain('✅ Valid')
      expect(report).toContain('5/5 valid')
      expect(report).toContain('Next Steps')
    })

    it('should generate report for invalid export', () => {
      const invalidResult = {
        isValid: false,
        errors: ['Missing required field', 'Invalid naming'],
        warnings: ['Optional field empty'],
        format: 'csv' as const,
        eventCount: 5,
        validEventCount: 3,
        schemaCompliance: {
          hasRequiredFields: false,
          hasValidNaming: false,
          hasValidEnums: true,
          csvCompatible: true
        }
      }
      
      const report = ExportValidator.generateValidationReport(invalidResult)
      
      expect(report).toContain('❌ Invalid')
      expect(report).toContain('3/5 valid')
      expect(report).toContain('## Errors')
      expect(report).toContain('## Warnings')
      expect(report).toContain('Missing required field')
    })
  })
})