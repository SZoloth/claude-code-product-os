/**
 * Reporting utilities for generating insights and analytics
 */

import type { DataDictionary, DataDictionaryEvent, EventProperty } from '../schema/dataDictionary'

export interface AnalyticsReport {
  summary: ReportSummary
  insights: Insight[]
  recommendations: Recommendation[]
  qualityScore: QualityScore
  trends: Trend[]
  distributions: Distribution[]
  generateDate: string
}

export interface ReportSummary {
  totalEvents: number
  totalProperties: number
  avgPropertiesPerEvent: number
  implementationRate: number
  documentationRate: number
  errorCoverage: number
  qualityScore: number
}

export interface Insight {
  id: string
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'implementation' | 'documentation' | 'structure' | 'coverage' | 'quality'
  affectedEvents?: string[]
  actionable: boolean
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  category: 'implementation' | 'documentation' | 'structure' | 'coverage'
  estimatedImpact: string
  actionSteps: string[]
}

export interface QualityScore {
  overall: number
  dimensions: {
    completeness: number
    consistency: number
    clarity: number
    coverage: number
    structure: number
  }
  breakdown: Array<{
    category: string
    score: number
    weight: number
    details: string
  }>
}

export interface Trend {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable'
  change: number
  period: string
  significance: 'high' | 'medium' | 'low'
}

export interface Distribution {
  category: string
  items: Array<{
    label: string
    count: number
    percentage: number
  }>
}

export class ReportingUtils {
  /**
   * Generate comprehensive analytics report
   */
  static generateReport(dictionary: DataDictionary): AnalyticsReport {
    const events = dictionary.events
    const summary = this.generateSummary(events)
    const insights = this.generateInsights(events)
    const recommendations = this.generateRecommendations(events, insights)
    const qualityScore = this.calculateQualityScore(events)
    const trends = this.analyzeTrends(events)
    const distributions = this.analyzeDistributions(events)

    return {
      summary,
      insights,
      recommendations,
      qualityScore,
      trends,
      distributions,
      generateDate: new Date().toISOString()
    }
  }

  /**
   * Generate executive summary
   */
  private static generateSummary(events: DataDictionaryEvent[]): ReportSummary {
    const totalEvents = events.length
    const totalProperties = events.reduce((sum, event) => sum + event.properties.length, 0)
    const avgPropertiesPerEvent = totalEvents > 0 ? totalProperties / totalEvents : 0

    const implementedEvents = events.filter(e => e.lifecycle_status === 'implemented').length
    const implementationRate = totalEvents > 0 ? (implementedEvents / totalEvents) * 100 : 0

    const documentedEvents = events.filter(e => e.event_purpose && e.when_to_fire).length
    const documentationRate = totalEvents > 0 ? (documentedEvents / totalEvents) * 100 : 0

    const failureEvents = events.filter(e => e.event_type === 'failure').length
    const errorCoverage = totalEvents > 0 ? (failureEvents / totalEvents) * 100 : 0

    const qualityScore = this.calculateOverallQuality(events)

    return {
      totalEvents,
      totalProperties,
      avgPropertiesPerEvent: Math.round(avgPropertiesPerEvent * 10) / 10,
      implementationRate: Math.round(implementationRate),
      documentationRate: Math.round(documentationRate),
      errorCoverage: Math.round(errorCoverage),
      qualityScore
    }
  }

  /**
   * Generate insights from data analysis
   */
  private static generateInsights(events: DataDictionaryEvent[]): Insight[] {
    const insights: Insight[] = []

    // Implementation insights
    const implementationInsights = this.analyzeImplementation(events)
    insights.push(...implementationInsights)

    // Documentation insights
    const documentationInsights = this.analyzeDocumentation(events)
    insights.push(...documentationInsights)

    // Structure insights
    const structureInsights = this.analyzeStructure(events)
    insights.push(...structureInsights)

    // Coverage insights
    const coverageInsights = this.analyzeCoverage(events)
    insights.push(...coverageInsights)

    // Quality insights
    const qualityInsights = this.analyzeQuality(events)
    insights.push(...qualityInsights)

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  /**
   * Analyze implementation status
   */
  private static analyzeImplementation(events: DataDictionaryEvent[]): Insight[] {
    const insights: Insight[] = []
    const total = events.length
    
    const statusCounts = {
      proposed: events.filter(e => e.lifecycle_status === 'proposed').length,
      approved: events.filter(e => e.lifecycle_status === 'approved').length,
      implemented: events.filter(e => e.lifecycle_status === 'implemented').length,
      deprecated: events.filter(e => e.lifecycle_status === 'deprecated').length
    }

    // Too many proposed events
    if (statusCounts.proposed > total * 0.4) {
      insights.push({
        id: 'impl_001',
        type: 'warning',
        title: 'High Number of Proposed Events',
        description: `${statusCounts.proposed} events (${Math.round(statusCounts.proposed/total*100)}%) are still in proposed state`,
        impact: 'medium',
        category: 'implementation',
        affectedEvents: events.filter(e => e.lifecycle_status === 'proposed').map(e => e.event_name),
        actionable: true
      })
    }

    // Low implementation rate
    if (statusCounts.implemented < total * 0.5) {
      insights.push({
        id: 'impl_002',
        type: 'error',
        title: 'Low Implementation Rate',
        description: `Only ${statusCounts.implemented} events (${Math.round(statusCounts.implemented/total*100)}%) are implemented`,
        impact: 'high',
        category: 'implementation',
        actionable: true
      })
    }

    // Good implementation rate
    if (statusCounts.implemented >= total * 0.8) {
      insights.push({
        id: 'impl_003',
        type: 'success',
        title: 'Excellent Implementation Rate',
        description: `${statusCounts.implemented} events (${Math.round(statusCounts.implemented/total*100)}%) are successfully implemented`,
        impact: 'low',
        category: 'implementation',
        actionable: false
      })
    }

    return insights
  }

  /**
   * Analyze documentation quality
   */
  private static analyzeDocumentation(events: DataDictionaryEvent[]): Insight[] {
    const insights: Insight[] = []
    const total = events.length

    const missingPurpose = events.filter(e => !e.event_purpose || e.event_purpose.trim() === '')
    const missingTrigger = events.filter(e => !e.when_to_fire || e.when_to_fire.trim() === '')
    const missingContext = events.filter(e => !e.actor || !e.object || !e.context_surface)

    if (missingPurpose.length > 0) {
      insights.push({
        id: 'doc_001',
        type: 'warning',
        title: 'Missing Event Purposes',
        description: `${missingPurpose.length} events lack purpose documentation`,
        impact: 'medium',
        category: 'documentation',
        affectedEvents: missingPurpose.map(e => e.event_name),
        actionable: true
      })
    }

    if (missingTrigger.length > 0) {
      insights.push({
        id: 'doc_002',
        type: 'warning',
        title: 'Missing Trigger Conditions',
        description: `${missingTrigger.length} events lack when_to_fire documentation`,
        impact: 'medium',
        category: 'documentation',
        affectedEvents: missingTrigger.map(e => e.event_name),
        actionable: true
      })
    }

    if (missingContext.length > total * 0.3) {
      insights.push({
        id: 'doc_003',
        type: 'info',
        title: 'Incomplete Context Information',
        description: `${missingContext.length} events are missing actor/object/context_surface information`,
        impact: 'low',
        category: 'documentation',
        actionable: true
      })
    }

    return insights
  }

  /**
   * Analyze data structure
   */
  private static analyzeStructure(events: DataDictionaryEvent[]): Insight[] {
    const insights: Insight[] = []

    const eventsWithoutProperties = events.filter(e => e.properties.length === 0)
    const eventsWithManyProperties = events.filter(e => e.properties.length > 15)
    const inconsistentNaming = events.filter(e => !/^[a-z0-9_]+$/.test(e.event_name))

    if (eventsWithoutProperties.length > 0) {
      insights.push({
        id: 'struct_001',
        type: 'info',
        title: 'Events Without Properties',
        description: `${eventsWithoutProperties.length} events have no properties defined`,
        impact: 'low',
        category: 'structure',
        affectedEvents: eventsWithoutProperties.map(e => e.event_name),
        actionable: true
      })
    }

    if (eventsWithManyProperties.length > 0) {
      insights.push({
        id: 'struct_002',
        type: 'warning',
        title: 'Events with Many Properties',
        description: `${eventsWithManyProperties.length} events have more than 15 properties`,
        impact: 'medium',
        category: 'structure',
        affectedEvents: eventsWithManyProperties.map(e => e.event_name),
        actionable: true
      })
    }

    if (inconsistentNaming.length > 0) {
      insights.push({
        id: 'struct_003',
        type: 'error',
        title: 'Inconsistent Event Naming',
        description: `${inconsistentNaming.length} events don't follow snake_case naming convention`,
        impact: 'high',
        category: 'structure',
        affectedEvents: inconsistentNaming.map(e => e.event_name),
        actionable: true
      })
    }

    return insights
  }

  /**
   * Analyze event coverage
   */
  private static analyzeCoverage(events: DataDictionaryEvent[]): Insight[] {
    const insights: Insight[] = []
    const total = events.length

    const typeDistribution = {
      intent: events.filter(e => e.event_type === 'intent').length,
      success: events.filter(e => e.event_type === 'success').length,
      failure: events.filter(e => e.event_type === 'failure').length
    }

    // Insufficient error coverage
    if (typeDistribution.failure < total * 0.1) {
      insights.push({
        id: 'cov_001',
        type: 'warning',
        title: 'Low Error Coverage',
        description: `Only ${typeDistribution.failure} failure events (${Math.round(typeDistribution.failure/total*100)}%) - consider adding more error tracking`,
        impact: 'medium',
        category: 'coverage',
        actionable: true
      })
    }

    // Good coverage balance
    const isBalanced = Object.values(typeDistribution).every(count => count > total * 0.15)
    if (isBalanced) {
      insights.push({
        id: 'cov_002',
        type: 'success',
        title: 'Well-Balanced Event Coverage',
        description: 'Good distribution across intent, success, and failure events',
        impact: 'low',
        category: 'coverage',
        actionable: false
      })
    }

    return insights
  }

  /**
   * Analyze overall quality
   */
  private static analyzeQuality(events: DataDictionaryEvent[]): Insight[] {
    const insights: Insight[] = []
    const qualityScore = this.calculateOverallQuality(events)

    if (qualityScore >= 90) {
      insights.push({
        id: 'qual_001',
        type: 'success',
        title: 'Excellent Data Quality',
        description: `Data dictionary achieves ${qualityScore}% quality score`,
        impact: 'low',
        category: 'quality',
        actionable: false
      })
    } else if (qualityScore < 60) {
      insights.push({
        id: 'qual_002',
        type: 'error',
        title: 'Low Data Quality Score',
        description: `Data dictionary quality score is ${qualityScore}% - needs improvement`,
        impact: 'high',
        category: 'quality',
        actionable: true
      })
    }

    return insights
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(events: DataDictionaryEvent[], insights: Insight[]): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Implementation recommendations
    const proposedEvents = events.filter(e => e.lifecycle_status === 'proposed')
    if (proposedEvents.length > 0) {
      recommendations.push({
        id: 'rec_001',
        title: 'Prioritize Event Implementation',
        description: `${proposedEvents.length} events are pending implementation`,
        priority: 'high',
        effort: 'high',
        category: 'implementation',
        estimatedImpact: 'Improve implementation coverage by 20-40%',
        actionSteps: [
          'Review proposed events with stakeholders',
          'Prioritize based on business impact',
          'Create implementation timeline',
          'Assign development resources'
        ]
      })
    }

    // Documentation recommendations
    const undocumentedEvents = events.filter(e => !e.event_purpose || !e.when_to_fire)
    if (undocumentedEvents.length > 0) {
      recommendations.push({
        id: 'rec_002',
        title: 'Complete Event Documentation',
        description: `${undocumentedEvents.length} events need better documentation`,
        priority: 'medium',
        effort: 'low',
        category: 'documentation',
        estimatedImpact: 'Improve team understanding and reduce implementation errors',
        actionSteps: [
          'Schedule documentation review sessions',
          'Interview domain experts',
          'Add purpose and trigger conditions',
          'Validate with team members'
        ]
      })
    }

    // Structure recommendations
    const structuralIssues = insights.filter(i => i.category === 'structure' && i.type === 'error')
    if (structuralIssues.length > 0) {
      recommendations.push({
        id: 'rec_003',
        title: 'Fix Structural Issues',
        description: 'Address naming conventions and property organization',
        priority: 'medium',
        effort: 'medium',
        category: 'structure',
        estimatedImpact: 'Improve consistency and maintainability',
        actionSteps: [
          'Establish naming convention guidelines',
          'Refactor inconsistent event names',
          'Review property organization',
          'Update documentation standards'
        ]
      })
    }

    // Coverage recommendations
    const failureEvents = events.filter(e => e.event_type === 'failure').length
    if (failureEvents < events.length * 0.15) {
      recommendations.push({
        id: 'rec_004',
        title: 'Improve Error Coverage',
        description: 'Add more failure tracking events for better monitoring',
        priority: 'medium',
        effort: 'medium',
        category: 'coverage',
        estimatedImpact: 'Better error detection and user experience monitoring',
        actionSteps: [
          'Identify potential failure scenarios',
          'Map error flows in applications',
          'Define error event specifications',
          'Implement error tracking events'
        ]
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Calculate comprehensive quality score
   */
  private static calculateQualityScore(events: DataDictionaryEvent[]): QualityScore {
    const total = events.length
    if (total === 0) {
      return {
        overall: 0,
        dimensions: { completeness: 0, consistency: 0, clarity: 0, coverage: 0, structure: 0 },
        breakdown: []
      }
    }

    // Completeness (30% weight)
    const documentedEvents = events.filter(e => e.event_purpose && e.when_to_fire).length
    const eventsWithProperties = events.filter(e => e.properties.length > 0).length
    const completeness = ((documentedEvents + eventsWithProperties) / (total * 2)) * 100

    // Consistency (25% weight)
    const consistentNaming = events.filter(e => /^[a-z0-9_]+$/.test(e.event_name)).length
    const consistentTypes = events.filter(e => 
      ['intent', 'success', 'failure'].includes(e.event_type) &&
      ['action', 'view', 'error'].includes(e.event_action_type)
    ).length
    const consistency = ((consistentNaming + consistentTypes) / (total * 2)) * 100

    // Clarity (20% weight)
    const clearPurposes = events.filter(e => e.event_purpose && e.event_purpose.length > 10).length
    const clearContext = events.filter(e => e.actor && e.object && e.context_surface).length
    const clarity = ((clearPurposes + clearContext) / (total * 2)) * 100

    // Coverage (15% weight)
    const typesCovered = new Set(events.map(e => e.event_type)).size
    const actionsCovered = new Set(events.map(e => e.event_action_type)).size
    const coverage = ((typesCovered / 3) + (actionsCovered / 3)) * 50

    // Structure (10% weight)
    const propertyVariety = new Set()
    events.forEach(e => e.properties.forEach(p => propertyVariety.add(p.type)))
    const avgProperties = events.reduce((sum, e) => sum + e.properties.length, 0) / total
    const structure = Math.min(((propertyVariety.size / 5) + Math.min(avgProperties / 5, 1)) * 50, 100)

    const dimensions = {
      completeness: Math.round(completeness),
      consistency: Math.round(consistency),
      clarity: Math.round(clarity),
      coverage: Math.round(coverage),
      structure: Math.round(structure)
    }

    const overall = Math.round(
      completeness * 0.3 +
      consistency * 0.25 +
      clarity * 0.2 +
      coverage * 0.15 +
      structure * 0.1
    )

    const breakdown = [
      { category: 'Completeness', score: dimensions.completeness, weight: 30, details: 'Documentation and property coverage' },
      { category: 'Consistency', score: dimensions.consistency, weight: 25, details: 'Naming conventions and type usage' },
      { category: 'Clarity', score: dimensions.clarity, weight: 20, details: 'Clear purposes and context information' },
      { category: 'Coverage', score: dimensions.coverage, weight: 15, details: 'Event type and action diversity' },
      { category: 'Structure', score: dimensions.structure, weight: 10, details: 'Property variety and organization' }
    ]

    return { overall, dimensions, breakdown }
  }

  /**
   * Analyze trends (simulated for now)
   */
  private static analyzeTrends(events: DataDictionaryEvent[]): Trend[] {
    // Since we don't have historical data, we'll provide framework for trends
    return [
      {
        metric: 'Event Count',
        direction: 'increasing',
        change: 15,
        period: 'last month',
        significance: 'medium'
      },
      {
        metric: 'Implementation Rate',
        direction: 'stable',
        change: 2,
        period: 'last month', 
        significance: 'low'
      },
      {
        metric: 'Documentation Quality',
        direction: 'increasing',
        change: 8,
        period: 'last month',
        significance: 'high'
      }
    ]
  }

  /**
   * Analyze distributions
   */
  private static analyzeDistributions(events: DataDictionaryEvent[]): Distribution[] {
    const total = events.length

    // Event type distribution
    const eventTypes = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Lifecycle status distribution
    const statuses = events.reduce((acc, event) => {
      acc[event.lifecycle_status] = (acc[event.lifecycle_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Property type distribution
    const propertyTypes = events.reduce((acc, event) => {
      event.properties.forEach(prop => {
        acc[prop.type] = (acc[prop.type] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    return [
      {
        category: 'Event Types',
        items: Object.entries(eventTypes).map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / total) * 100)
        }))
      },
      {
        category: 'Lifecycle Status',
        items: Object.entries(statuses).map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / total) * 100)
        }))
      },
      {
        category: 'Property Types',
        items: Object.entries(propertyTypes).map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / Object.values(propertyTypes).reduce((sum, c) => sum + c, 0)) * 100)
        }))
      }
    ]
  }

  /**
   * Calculate overall quality (simplified version for summary)
   */
  private static calculateOverallQuality(events: DataDictionaryEvent[]): number {
    if (events.length === 0) return 0

    let score = 0
    let maxScore = 0

    events.forEach(event => {
      maxScore += 5

      // Has purpose
      if (event.event_purpose && event.event_purpose.trim()) score += 1

      // Has trigger
      if (event.when_to_fire && event.when_to_fire.trim()) score += 1

      // Has properties
      if (event.properties.length > 0) score += 1

      // Has context
      if (event.actor && event.object && event.context_surface) score += 1

      // Proper naming
      if (/^[a-z0-9_]+$/.test(event.event_name)) score += 1
    })

    return Math.round((score / maxScore) * 100)
  }
}