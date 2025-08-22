/**
 * Snapshot management system for data dictionary versions
 * Provides save/restore functionality with metadata
 */

import type { DataDictionary, DataDictionaryEvent } from '../schema/dataDictionary'

export interface Snapshot {
  id: string
  timestamp: string
  name: string
  description?: string
  version: string
  eventCount: number
  data: DataDictionary
  size: number // in bytes for display
}

export interface SnapshotMetadata {
  name: string
  description?: string
}

const SNAPSHOTS_KEY = 'dataDictionary_snapshots'
const MAX_SNAPSHOTS = 50 // Prevent localStorage overflow
const MAX_SNAPSHOT_SIZE = 1024 * 1024 // 1MB per snapshot

export class SnapshotManager {
  /**
   * Save current data dictionary as a snapshot
   */
  static saveSnapshot(
    events: DataDictionaryEvent[], 
    metadata: SnapshotMetadata
  ): Snapshot {
    const timestamp = new Date().toISOString()
    const dataDictionary: DataDictionary = {
      version: '1.0.0',
      generatedAtIso: timestamp,
      events
    }
    
    const snapshot: Snapshot = {
      id: this.generateSnapshotId(),
      timestamp,
      name: metadata.name,
      description: metadata.description,
      version: dataDictionary.version,
      eventCount: events.length,
      data: dataDictionary,
      size: this.calculateSize(dataDictionary)
    }

    // Validate size
    if (snapshot.size > MAX_SNAPSHOT_SIZE) {
      throw new Error(`Snapshot too large (${this.formatSize(snapshot.size)}). Maximum allowed: ${this.formatSize(MAX_SNAPSHOT_SIZE)}`)
    }

    // Get existing snapshots
    const snapshots = this.getSnapshots()
    
    // Add new snapshot at the beginning (most recent first)
    snapshots.unshift(snapshot)
    
    // Enforce maximum snapshot limit
    if (snapshots.length > MAX_SNAPSHOTS) {
      snapshots.splice(MAX_SNAPSHOTS)
    }

    // Save to localStorage
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots))
      return snapshot
    } catch (error) {
      throw new Error('Failed to save snapshot to localStorage. Storage may be full.')
    }
  }

  /**
   * Get all saved snapshots
   */
  static getSnapshots(): Snapshot[] {
    try {
      const saved = localStorage.getItem(SNAPSHOTS_KEY)
      if (!saved) return []
      
      const snapshots = JSON.parse(saved) as Snapshot[]
      
      // Validate and clean up any invalid snapshots
      return snapshots.filter(snapshot => this.validateSnapshot(snapshot))
    } catch (error) {
      console.warn('Failed to load snapshots:', error)
      return []
    }
  }

  /**
   * Get a specific snapshot by ID
   */
  static getSnapshot(id: string): Snapshot | null {
    const snapshots = this.getSnapshots()
    return snapshots.find(snapshot => snapshot.id === id) || null
  }

  /**
   * Delete a snapshot by ID
   */
  static deleteSnapshot(id: string): boolean {
    const snapshots = this.getSnapshots()
    const index = snapshots.findIndex(snapshot => snapshot.id === id)
    
    if (index === -1) return false
    
    snapshots.splice(index, 1)
    
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots))
      return true
    } catch (error) {
      console.error('Failed to delete snapshot:', error)
      return false
    }
  }

  /**
   * Restore events from a snapshot
   */
  static restoreSnapshot(id: string): DataDictionaryEvent[] | null {
    const snapshot = this.getSnapshot(id)
    if (!snapshot) return null
    
    return snapshot.data.events
  }

  /**
   * Get storage usage statistics
   */
  static getStorageStats(): {
    snapshotCount: number
    totalSize: number
    averageSize: number
    oldestSnapshot?: string
    newestSnapshot?: string
  } {
    const snapshots = this.getSnapshots()
    
    if (snapshots.length === 0) {
      return {
        snapshotCount: 0,
        totalSize: 0,
        averageSize: 0
      }
    }

    const totalSize = snapshots.reduce((sum, snapshot) => sum + snapshot.size, 0)
    
    return {
      snapshotCount: snapshots.length,
      totalSize,
      averageSize: Math.round(totalSize / snapshots.length),
      oldestSnapshot: snapshots[snapshots.length - 1]?.timestamp,
      newestSnapshot: snapshots[0]?.timestamp
    }
  }

  /**
   * Clear all snapshots (with confirmation)
   */
  static clearAllSnapshots(): boolean {
    try {
      localStorage.removeItem(SNAPSHOTS_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear snapshots:', error)
      return false
    }
  }

  /**
   * Export snapshots as JSON
   */
  static exportSnapshots(): string {
    const snapshots = this.getSnapshots()
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      snapshots
    }, null, 2)
  }

  /**
   * Import snapshots from JSON
   */
  static importSnapshots(jsonData: string): number {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.snapshots || !Array.isArray(importData.snapshots)) {
        throw new Error('Invalid snapshot export format')
      }

      const existingSnapshots = this.getSnapshots()
      const importedSnapshots = importData.snapshots as Snapshot[]
      
      // Validate imported snapshots
      const validSnapshots = importedSnapshots.filter(snapshot => 
        this.validateSnapshot(snapshot)
      )

      // Merge with existing, avoiding duplicates
      const merged = [...existingSnapshots]
      let importedCount = 0

      for (const snapshot of validSnapshots) {
        if (!merged.some(existing => existing.id === snapshot.id)) {
          merged.push(snapshot)
          importedCount++
        }
      }

      // Sort by timestamp (newest first)
      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      // Enforce limit
      if (merged.length > MAX_SNAPSHOTS) {
        merged.splice(MAX_SNAPSHOTS)
      }

      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(merged))
      return importedCount
    } catch (error) {
      throw new Error(`Failed to import snapshots: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate unique snapshot ID
   */
  private static generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Calculate size of data dictionary in bytes
   */
  static calculateSize(data: DataDictionary): number {
    return new Blob([JSON.stringify(data)]).size
  }

  /**
   * Format size in human-readable format
   */
  static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
  }

  /**
   * Validate snapshot structure
   */
  private static validateSnapshot(snapshot: any): snapshot is Snapshot {
    return (
      snapshot &&
      typeof snapshot.id === 'string' &&
      typeof snapshot.timestamp === 'string' &&
      typeof snapshot.name === 'string' &&
      typeof snapshot.version === 'string' &&
      typeof snapshot.eventCount === 'number' &&
      snapshot.data &&
      Array.isArray(snapshot.data.events)
    )
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return timestamp
    }
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  static getRelativeTime(timestamp: string): string {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      
      return this.formatTimestamp(timestamp)
    } catch {
      return timestamp
    }
  }
}