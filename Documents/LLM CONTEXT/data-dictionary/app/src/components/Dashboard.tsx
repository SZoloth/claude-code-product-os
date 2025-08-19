/**
 * Dashboard component with data visualization and reporting
 */

import { useState, useMemo } from 'react'
import type { DataDictionary } from '../lib/schema/dataDictionary'
import { PieChart, BarChart, PropertyDistributionChart, TimelineChart } from './charts/ChartComponents'
import { LoadingSpinner } from './LoadingStates'

interface DashboardProps {
  dictionary: DataDictionary
  className?: string
}

interface MetricCard {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  icon?: string
}

export default function Dashboard({ dictionary, className = '' }: DashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'events' | 'properties' | 'insights'>('overview')
  const [isLoading, setIsLoading] = useState(false)

  const metrics = useMemo(() => {
    const events = dictionary.events
    const totalEvents = events.length
    const totalProperties = events.reduce((sum, event) => sum + event.properties.length, 0)
    const avgPropertiesPerEvent = totalEvents > 0 ? (totalProperties / totalEvents).toFixed(1) : '0'
    
    const implementedEvents = events.filter(e => e.lifecycle_status === 'implemented').length
    const implementationRate = totalEvents > 0 ? Math.round((implementedEvents / totalEvents) * 100) : 0
    
    const failureEvents = events.filter(e => e.event_type === 'failure').length
    const errorRate = totalEvents > 0 ? Math.round((failureEvents / totalEvents) * 100) : 0
    
    const eventsWithPurpose = events.filter(e => e.event_purpose && e.event_purpose.trim()).length
    const documentationRate = totalEvents > 0 ? Math.round((eventsWithPurpose / totalEvents) * 100) : 0

    return [
      {
        title: 'Total Events',
        value: totalEvents,
        subtitle: 'Defined events',
        icon: '📊',
        trend: 'stable'
      },
      {
        title: 'Implementation Rate',
        value: `${implementationRate}%`,
        subtitle: `${implementedEvents}/${totalEvents} implemented`,
        icon: '🚀',
        trend: implementationRate >= 70 ? 'up' : implementationRate >= 40 ? 'stable' : 'down'
      },
      {
        title: 'Avg Properties',
        value: avgPropertiesPerEvent,
        subtitle: `${totalProperties} total properties`,
        icon: '🔧',
        trend: 'stable'
      },
      {
        title: 'Documentation',
        value: `${documentationRate}%`,
        subtitle: `${eventsWithPurpose} events documented`,
        icon: '📝',
        trend: documentationRate >= 80 ? 'up' : documentationRate >= 60 ? 'stable' : 'down'
      },
      {
        title: 'Error Coverage',
        value: `${errorRate}%`,
        subtitle: `${failureEvents} failure events`,
        icon: '⚠️',
        trend: errorRate >= 20 ? 'up' : errorRate >= 10 ? 'stable' : 'down'
      },
      {
        title: 'Data Quality',
        value: calculateDataQuality(events),
        subtitle: 'Overall score',
        icon: '✨',
        trend: parseInt(calculateDataQuality(events)) >= 80 ? 'up' : 'stable'
      }
    ]
  }, [dictionary])

  const insights = useMemo(() => {
    const events = dictionary.events
    const insights: string[] = []
    
    // Implementation insights
    const implementedCount = events.filter(e => e.lifecycle_status === 'implemented').length
    const proposedCount = events.filter(e => e.lifecycle_status === 'proposed').length
    if (proposedCount > implementedCount) {
      insights.push(`📋 ${proposedCount} events are still in proposed state - consider prioritizing implementation`)
    }
    
    // Property insights
    const eventsWithoutProperties = events.filter(e => e.properties.length === 0).length
    if (eventsWithoutProperties > 0) {
      insights.push(`🔧 ${eventsWithoutProperties} events have no properties defined - may need additional context`)
    }
    
    // Documentation insights
    const undocumentedEvents = events.filter(e => !e.event_purpose || !e.when_to_fire).length
    if (undocumentedEvents > 0) {
      insights.push(`📝 ${undocumentedEvents} events need better documentation (purpose and trigger conditions)`)
    }
    
    // Error handling insights
    const failureEvents = events.filter(e => e.event_type === 'failure').length
    if (failureEvents < events.length * 0.1) {
      insights.push(`⚠️ Consider adding more failure tracking events for better error monitoring`)
    }
    
    // Property type insights
    const propertyTypes = new Set()
    events.forEach(event => {
      event.properties.forEach(prop => propertyTypes.add(prop.type))
    })
    if (propertyTypes.size < 3) {
      insights.push(`🎯 Limited property type diversity - consider using more varied data types`)
    }
    
    return insights.slice(0, 5) // Limit to top 5 insights
  }, [dictionary])

  function calculateDataQuality(events: any[]): string {
    let score = 0
    let maxScore = 0
    
    events.forEach(event => {
      maxScore += 5 // Max points per event
      
      // Has purpose
      if (event.event_purpose) score += 1
      
      // Has when_to_fire
      if (event.when_to_fire) score += 1
      
      // Has properties
      if (event.properties.length > 0) score += 1
      
      // Has context information
      if (event.actor && event.object && event.context_surface) score += 1
      
      // Has proper naming (no spaces, underscores)
      if (event.event_name && /^[a-z0-9_]+$/.test(event.event_name)) score += 1
    })
    
    return maxScore > 0 ? Math.round((score / maxScore) * 100).toString() : '0'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'events', label: 'Events', icon: '🎯' },
    { id: 'properties', label: 'Properties', icon: '🔧' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ] as const

  return (
    <div className={`bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📊 Analytics Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data insights and visualizations for your event dictionary
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Updated: {new Date(dictionary.generatedAtIso).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Dashboard tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics.map((metric, index) => (
                    <MetricCard key={index} metric={metric} />
                  ))}
                </div>

                {/* Quick Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Event Types Distribution
                    </h3>
                    <PieChart 
                      data={dictionary.events} 
                      groupBy="event_type"
                      height={250}
                      width={300}
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Implementation Status
                    </h3>
                    <BarChart 
                      data={dictionary.events} 
                      groupBy="lifecycle_status"
                      showValues={true}
                      height={250}
                      width={350}
                    />
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <TimelineChart 
                    data={dictionary.events}
                    height={200}
                    width={800}
                  />
                </div>
              </div>
            )}

            {selectedTab === 'events' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Event Types */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Event Types Breakdown
                    </h3>
                    <PieChart 
                      data={dictionary.events} 
                      groupBy="event_type"
                      height={300}
                      width={350}
                    />
                  </div>

                  {/* Action Types */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Action Types
                    </h3>
                    <BarChart 
                      data={dictionary.events} 
                      groupBy="event_action_type"
                      showValues={true}
                      height={300}
                      width={350}
                    />
                  </div>
                </div>

                {/* Implementation Status Details */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Implementation Status Overview
                  </h3>
                  <BarChart 
                    data={dictionary.events} 
                    groupBy="lifecycle_status"
                    showValues={true}
                    height={300}
                    width={700}
                  />
                </div>
              </div>
            )}

            {selectedTab === 'properties' && (
              <div className="space-y-8">
                <PropertyDistributionChart 
                  data={dictionary.events}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
                />

                {/* Property Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dictionary.events.reduce((sum, e) => sum + e.properties.length, 0)}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-300">Total Properties</div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {dictionary.events.reduce((sum, e) => sum + e.properties.filter(p => p.required).length, 0)}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-300">Required Properties</div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round((dictionary.events.reduce((sum, e) => sum + e.properties.length, 0) / dictionary.events.length) * 10) / 10}
                    </div>
                    <div className="text-sm text-purple-800 dark:text-purple-300">Avg per Event</div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'insights' && (
              <div className="space-y-6">
                {/* Insights List */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-4">
                    💡 Key Insights & Recommendations
                  </h3>
                  {insights.length > 0 ? (
                    <ul className="space-y-3">
                      {insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                          <span className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      🎉 Great job! Your data dictionary looks well-structured with no major issues identified.
                    </p>
                  )}
                </div>

                {/* Quality Score Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Data Quality Assessment
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        category: 'Documentation Completeness',
                        score: Math.round((dictionary.events.filter(e => e.event_purpose && e.when_to_fire).length / dictionary.events.length) * 100),
                        description: 'Events with purpose and trigger conditions'
                      },
                      {
                        category: 'Implementation Coverage',
                        score: Math.round((dictionary.events.filter(e => e.lifecycle_status === 'implemented').length / dictionary.events.length) * 100),
                        description: 'Events currently implemented'
                      },
                      {
                        category: 'Property Richness',
                        score: Math.round((dictionary.events.filter(e => e.properties.length > 0).length / dictionary.events.length) * 100),
                        description: 'Events with defined properties'
                      },
                      {
                        category: 'Context Information',
                        score: Math.round((dictionary.events.filter(e => e.actor && e.object && e.context_surface).length / dictionary.events.length) * 100),
                        description: 'Events with complete context'
                      }
                    ].map((item) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.category}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.score}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              item.score >= 80 ? 'bg-green-500' :
                              item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Metric Card Component
 */
function MetricCard({ metric }: { metric: MetricCard }) {
  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400'
      case 'down': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↗️'
      case 'down': return '↘️'
      default: return '➡️'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {metric.title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {metric.value}
          </p>
          {metric.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {metric.subtitle}
            </p>
          )}
        </div>
        <div className="text-2xl">
          {metric.icon}
        </div>
      </div>
      {metric.trend && (
        <div className={`flex items-center mt-3 text-sm ${getTrendColor(metric.trend)}`}>
          <span className="mr-1">{getTrendIcon(metric.trend)}</span>
          <span>{metric.trendValue || 'Tracking'}</span>
        </div>
      )}
    </div>
  )
}