/**
 * ProjectManager component - Handle project import/export and autosave settings
 */

import { useState, useEffect, useRef } from 'react'
import type { DataDictionaryEvent } from '../lib/schema/dataDictionary'
import type { AutoSaveOptions, DataDictionaryProject } from '../lib/storage/projectManager'
import { ProjectManager as PM } from '../lib/storage/projectManager'

interface ProjectManagerProps {
  events: DataDictionaryEvent[]
  onProjectLoad: (events: DataDictionaryEvent[]) => void
  onClose: () => void
  className?: string
}

export default function ProjectManager({ 
  events, 
  onProjectLoad, 
  onClose, 
  className = '' 
}: ProjectManagerProps) {
  const [currentProject, setCurrentProject] = useState<DataDictionaryProject | null>(null)
  const [autoSaveOptions, setAutoSaveOptions] = useState<AutoSaveOptions>(() => PM.getAutoSaveOptions())
  const [projectStats, setProjectStats] = useState(() => PM.getProjectStats())
  const [autoSaveHistory, setAutoSaveHistory] = useState(() => PM.getAutoSaveHistory())
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '' })
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load current project on mount
  useEffect(() => {
    const project = PM.loadProject()
    setCurrentProject(project)
    
    // Set default project name
    if (!project && !newProjectData.name) {
      const now = new Date()
      setNewProjectData({
        name: `Data Dictionary ${now.toLocaleDateString()}`,
        description: ''
      })
    }
  }, [])

  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProjectStats(PM.getProjectStats())
      setAutoSaveHistory(PM.getAutoSaveHistory())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCreateProject = () => {
    if (!newProjectData.name.trim()) return

    try {
      const project = PM.createProject(events, {
        name: newProjectData.name.trim(),
        description: newProjectData.description.trim() || undefined
      })
      
      setCurrentProject(project)
      setIsCreatingProject(false)
      setNewProjectData({ name: '', description: '' })
      setProjectStats(PM.getProjectStats())
    } catch (error) {
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleExportProject = () => {
    try {
      PM.downloadProject(currentProject || undefined)
    } catch (error) {
      alert(`Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleImportProject = async (file: File) => {
    try {
      setImportError(null)
      const project = await PM.handleFileImport(file)
      
      setCurrentProject(project)
      onProjectLoad(project.data.events)
      setProjectStats(PM.getProjectStats())
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      alert(`Successfully imported project: ${project.metadata.name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setImportError(errorMessage)
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImportProject(file)
    }
  }

  const handleUpdateAutoSaveOptions = (updates: Partial<AutoSaveOptions>) => {
    const newOptions = { ...autoSaveOptions, ...updates }
    setAutoSaveOptions(newOptions)
    PM.setAutoSaveOptions(newOptions)
  }

  const handleClearProject = () => {
    if (confirm('Are you sure you want to clear the current project? This will remove all data and cannot be undone.')) {
      PM.clearProject()
      setCurrentProject(null)
      setProjectStats(PM.getProjectStats())
      setAutoSaveHistory([])
    }
  }

  const formatInterval = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    const seconds = ms / 1000
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Project Manager
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your data dictionary project with autosave and import/export
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Project Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Current Project
          </h4>
          
          {currentProject ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-medium text-green-900 dark:text-green-100">
                    {currentProject.metadata.name}
                  </h5>
                  {currentProject.metadata.description && (
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      {currentProject.metadata.description}
                    </p>
                  )}
                  <div className="text-xs text-green-700 dark:text-green-300 mt-2 space-y-1">
                    <p>Events: {projectStats.eventCount} • Size: {PM.formatSize(projectStats.projectSize)}</p>
                    <p>Created: {PM.formatTimestamp(currentProject.metadata.createdAt)}</p>
                    <p>Updated: {PM.getRelativeTime(currentProject.metadata.updatedAt)}</p>
                    {projectStats.lastAutoSave && (
                      <p>Last Auto-save: {PM.getRelativeTime(projectStats.lastAutoSave)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={handleExportProject}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm"
                  >
                    Export
                  </button>
                  <button
                    onClick={handleClearProject}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 text-4xl mb-2">📁</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                No project loaded. Create a new project or import an existing one.
              </p>
            </div>
          )}
        </div>

        {/* Create New Project */}
        {!currentProject && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Create New Project
              </h4>
              <button
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                {isCreatingProject ? 'Cancel' : '+ New Project'}
              </button>
            </div>

            {isCreatingProject && (
              <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProjectData.name}
                    onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., E-commerce Analytics Events"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProjectData.description}
                    onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional: Describe the purpose of this data dictionary"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectData.name.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* Import/Export */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Import/Export
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
                id="project-import"
              />
              <label
                htmlFor="project-import"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                📥 Import Project
              </label>
            </div>
            
            <button
              onClick={handleExportProject}
              disabled={!currentProject}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-sm"
            >
              📤 Export Project
            </button>
          </div>

          {importError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
              Import Error: {importError}
            </div>
          )}
        </div>

        {/* Auto-save Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Auto-save Settings
          </h4>
          
          <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Auto-save</span>
              <input
                type="checkbox"
                checked={autoSaveOptions.enabled}
                onChange={(e) => handleUpdateAutoSaveOptions({ enabled: e.target.checked })}
                className="rounded"
              />
            </div>
            
            {autoSaveOptions.enabled && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Debounce Delay: {formatInterval(autoSaveOptions.debounceMs)}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={autoSaveOptions.debounceMs}
                    onChange={(e) => handleUpdateAutoSaveOptions({ debounceMs: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1s</span>
                    <span>10s</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Max History: {autoSaveOptions.maxVersions} versions
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={autoSaveOptions.maxVersions}
                    onChange={(e) => handleUpdateAutoSaveOptions({ maxVersions: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Auto-save History */}
        {autoSaveHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Auto-save History ({autoSaveHistory.length})
            </h4>
            
            <div className="max-h-32 overflow-y-auto space-y-1">
              {autoSaveHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1"
                >
                  <span>{PM.getRelativeTime(entry.timestamp)}</span>
                  <span>{entry.eventCount} events • {PM.formatSize(entry.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}