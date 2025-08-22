/**
 * Project management system for data dictionary projects
 * Handles autosave, import/export, and project metadata
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface ProjectMetadata {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  version: string
  eventCount: number
  lastAutoSave?: string
}

export interface DataDictionaryProject {
  metadata: ProjectMetadata
  data: DataDictionary
}

export interface ProjectExportData {
  exportedAt: string
  exportVersion: '1.0.0'
  project: DataDictionaryProject
}

export interface AutoSaveOptions {
  enabled: boolean
  intervalMs: number
  debounceMs: number
  maxVersions: number
}

const PROJECT_KEY = 'dataDictionary_currentProject'
const AUTOSAVE_HISTORY_KEY = 'dataDictionary_autosaveHistory'
const SETTINGS_KEY = 'dataDictionary_settings'

// Default settings
const DEFAULT_AUTOSAVE_OPTIONS: AutoSaveOptions = {
  enabled: true,
  intervalMs: 30000, // 30 seconds
  debounceMs: 2000,  // 2 seconds
  maxVersions: 10
}

export interface AutoSaveEntry {
  timestamp: string
  eventCount: number
  size: number
}

export class ProjectManager {
  private static autosaveTimeout: NodeJS.Timeout | null = null
  private static listeners: Array<(project: DataDictionaryProject | null) => void> = []

  /**
   * Create a new project
   */
  static createProject(
    events: DataDictionaryEvent[],
    metadata: { name: string; description?: string }
  ): DataDictionaryProject {
    const now = new Date().toISOString()
    
    const project: DataDictionaryProject = {
      metadata: {
        id: this.generateProjectId(),
        name: metadata.name,
        description: metadata.description,
        createdAt: now,
        updatedAt: now,
        version: '1.0.0',
        eventCount: events.length
      },
      data: {
        version: '1.0.0',
        generatedAtIso: now,
        events
      }
    }

    this.saveProject(project)
    return project
  }

  /**
   * Load current project
   */
  static loadProject(): DataDictionaryProject | null {
    try {
      const saved = localStorage.getItem(PROJECT_KEY)
      if (!saved) return null
      
      const project = JSON.parse(saved) as DataDictionaryProject
      
      // Validate project structure
      if (this.validateProject(project)) {
        return project
      }
      
      return null
    } catch (error) {
      console.warn('Failed to load project:', error)
      return null
    }
  }

  /**
   * Save project to localStorage
   */
  static saveProject(project: DataDictionaryProject): void {
    try {
      // Update metadata
      project.metadata.updatedAt = new Date().toISOString()
      project.metadata.eventCount = project.data.events.length
      project.data.generatedAtIso = project.metadata.updatedAt

      localStorage.setItem(PROJECT_KEY, JSON.stringify(project))
      
      // Notify listeners
      this.notifyListeners(project)
    } catch (error) {
      console.error('Failed to save project:', error)
      throw new Error('Failed to save project. Storage may be full.')
    }
  }

  /**
   * Update project with new events
   */
  static updateProject(events: DataDictionaryEvent[]): DataDictionaryProject {
    const currentProject = this.loadProject()
    
    if (currentProject) {
      currentProject.data.events = events
      this.saveProject(currentProject)
      return currentProject
    } else {
      // Create new project if none exists
      return this.createProject(events, {
        name: `Project ${new Date().toLocaleDateString()}`,
        description: 'Auto-created project'
      })
    }
  }

  /**
   * Auto-save with debouncing
   */
  static autoSave(events: DataDictionaryEvent[]): void {
    const options = this.getAutoSaveOptions()
    
    if (!options.enabled) return

    // Clear existing timeout
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout)
    }

    // Set new timeout
    this.autosaveTimeout = setTimeout(() => {
      try {
        const project = this.updateProject(events)
        
        // Add to autosave history
        this.addAutoSaveEntry(project)
        
        console.log(`Auto-saved project: ${events.length} events`)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, options.debounceMs)
  }

  /**
   * Export project as JSON
   */
  static exportProject(project?: DataDictionaryProject): string {
    const projectToExport = project || this.loadProject()
    
    if (!projectToExport) {
      throw new Error('No project to export')
    }

    const exportData: ProjectExportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0',
      project: projectToExport
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import project from JSON
   */
  static importProject(jsonData: string): DataDictionaryProject {
    try {
      const importData = JSON.parse(jsonData) as ProjectExportData
      
      // Validate import format
      if (!importData.project || !this.validateProject(importData.project)) {
        throw new Error('Invalid project format')
      }

      const project = importData.project
      
      // Update metadata for import
      project.metadata.id = this.generateProjectId()
      project.metadata.updatedAt = new Date().toISOString()
      
      // Save imported project
      this.saveProject(project)
      
      return project
    } catch (error) {
      throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
    }
  }

  /**
   * Download project as JSON file
   */
  static downloadProject(project?: DataDictionaryProject): void {
    try {
      const projectToDownload = project || this.loadProject()
      
      if (!projectToDownload) {
        throw new Error('No project to download')
      }

      const jsonData = this.exportProject(projectToDownload)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const filename = `${projectToDownload.metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
      
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Failed to download project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Handle file input for import
   */
  static handleFileImport(file: File): Promise<DataDictionaryProject> {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.json')) {
        reject(new Error('Please select a JSON file'))
        return
      }

      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string
          const project = this.importProject(jsonData)
          resolve(project)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Get autosave options
   */
  static getAutoSaveOptions(): AutoSaveOptions {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        const settings = JSON.parse(saved)
        return { ...DEFAULT_AUTOSAVE_OPTIONS, ...settings.autoSave }
      }
    } catch (error) {
      console.warn('Failed to load autosave settings:', error)
    }
    
    return DEFAULT_AUTOSAVE_OPTIONS
  }

  /**
   * Update autosave options
   */
  static setAutoSaveOptions(options: Partial<AutoSaveOptions>): void {
    try {
      const current = this.getAutoSaveOptions()
      const updated = { ...current, ...options }
      
      const settings = { autoSave: updated }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save autosave settings:', error)
    }
  }

  /**
   * Get autosave history
   */
  static getAutoSaveHistory(): AutoSaveEntry[] {
    try {
      const saved = localStorage.getItem(AUTOSAVE_HISTORY_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load autosave history:', error)
    }
    
    return []
  }

  /**
   * Add entry to autosave history
   */
  private static addAutoSaveEntry(project: DataDictionaryProject): void {
    try {
      const history = this.getAutoSaveHistory()
      const options = this.getAutoSaveOptions()
      
      const entry: AutoSaveEntry = {
        timestamp: new Date().toISOString(),
        eventCount: project.data.events.length,
        size: new Blob([JSON.stringify(project.data)]).size
      }
      
      // Add to beginning of history
      history.unshift(entry)
      
      // Limit history size
      if (history.length > options.maxVersions) {
        history.splice(options.maxVersions)
      }
      
      localStorage.setItem(AUTOSAVE_HISTORY_KEY, JSON.stringify(history))
      
      // Update project metadata
      project.metadata.lastAutoSave = entry.timestamp
    } catch (error) {
      console.error('Failed to update autosave history:', error)
    }
  }

  /**
   * Clear project and start fresh
   */
  static clearProject(): void {
    localStorage.removeItem(PROJECT_KEY)
    localStorage.removeItem(AUTOSAVE_HISTORY_KEY)
    this.notifyListeners(null)
  }

  /**
   * Get project statistics
   */
  static getProjectStats(): {
    hasProject: boolean
    eventCount: number
    projectSize: number
    autoSaveCount: number
    lastSaved?: string
    lastAutoSave?: string
  } {
    const project = this.loadProject()
    const history = this.getAutoSaveHistory()
    
    if (!project) {
      return {
        hasProject: false,
        eventCount: 0,
        projectSize: 0,
        autoSaveCount: history.length
      }
    }
    
    return {
      hasProject: true,
      eventCount: project.data.events.length,
      projectSize: new Blob([JSON.stringify(project)]).size,
      autoSaveCount: history.length,
      lastSaved: project.metadata.updatedAt,
      lastAutoSave: project.metadata.lastAutoSave
    }
  }

  /**
   * Subscribe to project changes
   */
  static subscribe(listener: (project: DataDictionaryProject | null) => void): () => void {
    this.listeners.push(listener)
    
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Format size in human-readable format
   */
  static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${Math.round(size * 10) / 10} ${units[unitIndex]}`
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: string): string {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  /**
   * Get relative time
   */
  static getRelativeTime(timestamp: string): string {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes}m ago`
      
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) return `${diffDays}d ago`
      
      return this.formatTimestamp(timestamp)
    } catch {
      return timestamp
    }
  }

  /**
   * Validate project structure
   */
  private static validateProject(project: any): project is DataDictionaryProject {
    return (
      project &&
      project.metadata &&
      typeof project.metadata.id === 'string' &&
      typeof project.metadata.name === 'string' &&
      typeof project.metadata.createdAt === 'string' &&
      typeof project.metadata.updatedAt === 'string' &&
      project.data &&
      typeof project.data.version === 'string' &&
      typeof project.data.generatedAtIso === 'string' &&
      Array.isArray(project.data.events)
    )
  }

  /**
   * Generate unique project ID
   */
  private static generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Notify all listeners of project changes
   */
  private static notifyListeners(project: DataDictionaryProject | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(project)
      } catch (error) {
        console.error('Error in project listener:', error)
      }
    })
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout)
      this.autosaveTimeout = null
    }
    this.listeners.length = 0
  }
}