/**
 * Chart components for data visualization
 * SVG-based charts with accessibility and responsive design
 */

import { useMemo } from 'react'
import type { DataDictionaryEvent } from '../../lib/schema/dataDictionary'

interface ChartProps {
  data: DataDictionaryEvent[]
  className?: string
  height?: number
  width?: number
}


// Color palettes for charts
const EVENT_TYPE_COLORS = {
  intent: '#3B82F6', // blue
  success: '#10B981', // green
  failure: '#EF4444'  // red
}

const LIFECYCLE_STATUS_COLORS = {
  proposed: '#F59E0B',    // amber
  approved: '#8B5CF6',    // purple
  implemented: '#10B981', // green
  deprecated: '#6B7280'   // gray
}

const ACTION_TYPE_COLORS = {
  action: '#3B82F6',  // blue
  view: '#8B5CF6',    // purple
  error: '#EF4444'    // red
}

/**
 * Pie Chart Component
 */
export function PieChart({ data, className = '', height = 300, width = 300, groupBy }: ChartProps & { 
  groupBy: 'event_type' | 'lifecycle_status' | 'event_action_type'
}) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}
    const colors = groupBy === 'event_type' ? EVENT_TYPE_COLORS 
                  : groupBy === 'lifecycle_status' ? LIFECYCLE_STATUS_COLORS 
                  : ACTION_TYPE_COLORS

    data.forEach(event => {
      const key = event[groupBy]
      counts[key] = (counts[key] || 0) + 1
    })

    const total = data.length
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      color: colors[label as keyof typeof colors] || '#6B7280',
      percentage: Math.round((value / total) * 100)
    }))
  }, [data, groupBy])

  const radius = Math.min(width, height) / 2 - 10
  const centerX = width / 2
  const centerY = height / 2

  let currentAngle = -Math.PI / 2 // Start at top

  return (
    <div className={`${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <title>Distribution of {groupBy.replace('_', ' ')}</title>
        
        {chartData.map((item) => {
          const angle = (item.value / data.length) * 2 * Math.PI
          const endAngle = currentAngle + angle
          
          const x1 = centerX + radius * Math.cos(currentAngle)
          const y1 = centerY + radius * Math.sin(currentAngle)
          const x2 = centerX + radius * Math.cos(endAngle)
          const y2 = centerY + radius * Math.sin(endAngle)
          
          const largeArcFlag = angle > Math.PI ? 1 : 0
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')
          
          const labelAngle = currentAngle + angle / 2
          const labelRadius = radius * 0.7
          const labelX = centerX + labelRadius * Math.cos(labelAngle)
          const labelY = centerY + labelRadius * Math.sin(labelAngle)
          
          currentAngle = endAngle
          
          return (
            <g key={item.label}>
              <path
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity"
              >
                <title>{item.label}: {item.value} ({item.percentage}%)</title>
              </path>
              
              {item.percentage >= 10 && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-xs font-medium pointer-events-none"
                >
                  {item.percentage}%
                </text>
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {chartData.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {item.label} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Bar Chart Component
 */
export function BarChart({ data, className = '', height = 300, width = 400, groupBy, showValues = false }: ChartProps & {
  groupBy: 'event_type' | 'lifecycle_status' | 'event_action_type'
  showValues?: boolean
}) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}
    const colors = groupBy === 'event_type' ? EVENT_TYPE_COLORS 
                  : groupBy === 'lifecycle_status' ? LIFECYCLE_STATUS_COLORS 
                  : ACTION_TYPE_COLORS

    data.forEach(event => {
      const key = event[groupBy]
      counts[key] = (counts[key] || 0) + 1
    })

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        color: colors[label as keyof typeof colors] || '#6B7280',
        percentage: Math.round((value / data.length) * 100)
      }))
      .sort((a, b) => b.value - a.value)
  }, [data, groupBy])

  const maxValue = Math.max(...chartData.map(d => d.value))
  const padding = { top: 20, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const barWidth = chartWidth / chartData.length * 0.8
  const barSpacing = chartWidth / chartData.length * 0.2

  return (
    <div className={className}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <title>Bar chart of {groupBy.replace('_', ' ')}</title>
        
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-300 dark:text-gray-600"
        />
        
        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-300 dark:text-gray-600"
        />
        
        {/* Y-axis labels */}
        {[0, Math.ceil(maxValue / 4), Math.ceil(maxValue / 2), Math.ceil(maxValue * 3/4), maxValue].map((value) => {
          const y = height - padding.bottom - (value / maxValue) * chartHeight
          return (
            <g key={value}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-300 dark:text-gray-600"
              />
              <text
                x={padding.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {value}
              </text>
            </g>
          )
        })}
        
        {/* Bars */}
        {chartData.map((item, index) => {
          const x = padding.left + index * (barWidth + barSpacing) + barSpacing / 2
          const barHeight = (item.value / maxValue) * chartHeight
          const y = height - padding.bottom - barHeight
          
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color}
                className="hover:opacity-80 transition-opacity"
              >
                <title>{item.label}: {item.value} events</title>
              </rect>
              
              {/* Value labels */}
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-700 dark:fill-gray-300 font-medium"
                >
                  {item.value}
                </text>
              )}
              
              {/* X-axis labels */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                transform={`rotate(-45, ${x + barWidth / 2}, ${height - padding.bottom + 15})`}
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Property Distribution Chart
 */
export function PropertyDistributionChart({ data, className = '' }: ChartProps) {
  const chartData = useMemo(() => {
    const propertyTypeCounts: Record<string, number> = {}
    const propertyCounts: number[] = []
    
    data.forEach(event => {
      propertyCounts.push(event.properties.length)
      
      event.properties.forEach(prop => {
        propertyTypeCounts[prop.type] = (propertyTypeCounts[prop.type] || 0) + 1
      })
    })
    
    // Property count distribution
    const countDistribution: Record<string, number> = {}
    propertyCounts.forEach(count => {
      const range = count === 0 ? '0' : 
                   count <= 2 ? '1-2' :
                   count <= 5 ? '3-5' :
                   count <= 10 ? '6-10' : '10+'
      countDistribution[range] = (countDistribution[range] || 0) + 1
    })
    
    return {
      propertyTypes: Object.entries(propertyTypeCounts).map(([type, count]) => ({
        label: type,
        value: count,
        color: type === 'string' ? '#3B82F6' :
               type === 'number' ? '#10B981' :
               type === 'boolean' ? '#F59E0B' :
               type === 'array' ? '#8B5CF6' :
               type === 'object' ? '#EF4444' : '#6B7280'
      })),
      countDistribution: Object.entries(countDistribution).map(([range, count]) => ({
        label: range,
        value: count,
        color: '#6366F1'
      }))
    }
  }, [data])
  
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Types */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Property Types
          </h4>
          <div className="space-y-2">
            {chartData.propertyTypes.map((item) => {
              const maxValue = Math.max(...chartData.propertyTypes.map(d => d.value))
              const percentage = (item.value / maxValue) * 100
              
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Property Count Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Properties per Event
          </h4>
          <div className="space-y-2">
            {chartData.countDistribution.map((item) => {
              const maxValue = Math.max(...chartData.countDistribution.map(d => d.value))
              const percentage = (item.value / maxValue) * 100
              
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.label} props</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.value} events</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Timeline Chart for event creation/modification
 */
export function TimelineChart({ data, className = '', height = 200, width = 600 }: ChartProps) {
  const chartData = useMemo(() => {
    // Since we don't have actual timestamps, we'll simulate based on lifecycle status
    const statusOrder = ['proposed', 'approved', 'implemented', 'deprecated']
    const timelineData: { date: string; count: number; status: string }[] = []
    
    // Create mock timeline data
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i * 7) // Weekly intervals
      
      const weekData = data.filter(event => {
        // Mock distribution based on status
        const statusIndex = statusOrder.indexOf(event.lifecycle_status)
        return Math.random() > (statusIndex / statusOrder.length) * 0.7
      })
      
      timelineData.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(weekData.length * (0.5 + Math.random() * 0.5)),
        status: 'events'
      })
    }
    
    return timelineData
  }, [data])
  
  const maxValue = Math.max(...chartData.map(d => d.count))
  const padding = { top: 20, right: 40, bottom: 40, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  
  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Event Activity Timeline
      </h4>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <title>Timeline of event activity</title>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + ratio * chartHeight
          return (
            <line
              key={ratio}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-700"
              strokeDasharray="2,2"
            />
          )
        })}
        
        {/* Line path */}
        <path
          d={`M ${chartData.map((point, index) => {
            const x = padding.left + (index / (chartData.length - 1)) * chartWidth
            const y = padding.top + (1 - point.count / maxValue) * chartHeight
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')}`}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Data points */}
        {chartData.map((point, index) => {
          const x = padding.left + (index / (chartData.length - 1)) * chartWidth
          const y = padding.top + (1 - point.count / maxValue) * chartHeight
          
          return (
            <g key={point.date}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="drop-shadow-sm"
              >
                <title>{point.date}: {point.count} events</title>
              </circle>
              
              {/* X-axis labels */}
              <text
                x={x}
                y={height - padding.bottom + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          )
        })}
        
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-400 dark:text-gray-600"
        />
        
        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-400 dark:text-gray-600"
        />
      </svg>
    </div>
  )
}