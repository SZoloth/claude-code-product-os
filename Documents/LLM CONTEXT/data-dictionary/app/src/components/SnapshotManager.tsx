/**
 * SnapshotManager component - Save and restore data dictionary snapshots
 */

import { useState, useEffect } from 'react'
import type { DataDictionaryEvent } from '../lib/schema/dataDictionary'
import type { Snapshot, SnapshotMetadata } from '../lib/storage/snapshotManager'
import { SnapshotManager as SM } from '../lib/storage/snapshotManager'

interface SnapshotManagerProps {
  events: DataDictionaryEvent[]
  onRestoreSnapshot: (events: DataDictionaryEvent[]) => void
  onClose: () => void
  className?: string
}

export default function SnapshotManager({ 
  events, 
  onRestoreSnapshot, 
  onClose, 
  className = '' 
}: SnapshotManagerProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false)
  const [newSnapshotData, setNewSnapshotData] = useState<SnapshotMetadata>({
    name: '',
    description: ''
  })
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null)
  const [storageStats, setStorageStats] = useState(() => SM.getStorageStats())

  // Load snapshots on mount
  useEffect(() => {
    loadSnapshots()
  }, [])

  const loadSnapshots = () => {
    setSnapshots(SM.getSnapshots())
    setStorageStats(SM.getStorageStats())
  }

  const handleCreateSnapshot = async () => {
    if (!newSnapshotData.name.trim()) {
      return
    }

    try {
      SM.saveSnapshot(events, {
        name: newSnapshotData.name.trim(),
        description: newSnapshotData.description?.trim() || undefined
      })
      
      loadSnapshots()
      setIsCreatingSnapshot(false)
      setNewSnapshotData({ name: '', description: '' })
      
      // Generate default name for next snapshot
      const now = new Date()
      setNewSnapshotData({
        name: `Snapshot ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        description: ''
      })
    } catch (error) {
      alert(`Failed to create snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleRestoreSnapshot = (snapshotId: string) => {
    const events = SM.restoreSnapshot(snapshotId)
    if (events) {
      onRestoreSnapshot(events)
      onClose()
    } else {
      alert('Failed to restore snapshot')
    }
  }

  const handleDeleteSnapshot = (snapshotId: string, snapshotName: string) => {
    if (confirm(`Are you sure you want to delete the snapshot "${snapshotName}"? This action cannot be undone.`)) {
      if (SM.deleteSnapshot(snapshotId)) {
        loadSnapshots()
        if (selectedSnapshot === snapshotId) {
          setSelectedSnapshot(null)
        }
      } else {
        alert('Failed to delete snapshot')
      }
    }
  }

  const handleClearAllSnapshots = () => {
    if (confirm('Are you sure you want to delete ALL snapshots? This action cannot be undone.')) {
      if (SM.clearAllSnapshots()) {
        loadSnapshots()
        setSelectedSnapshot(null)
      } else {
        alert('Failed to clear snapshots')
      }
    }
  }

  const handleExportSnapshots = () => {
    try {
      const exportData = SM.exportSnapshots()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `data-dictionary-snapshots-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(`Failed to export snapshots: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate default snapshot name
  useEffect(() => {
    if (!isCreatingSnapshot && !newSnapshotData.name) {
      const now = new Date()
      setNewSnapshotData({
        name: `Snapshot ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        description: ''
      })
    }
  }, [isCreatingSnapshot])

  const selectedSnapshotData = selectedSnapshot ? snapshots.find(s => s.id === selectedSnapshot) : null

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Snapshot Manager
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Save versions of your data dictionary and restore them later
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
        {/* Current State Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Current State
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {events.length} events • {SM.formatSize(SM.calculateSize({ version: '1.0.0', generatedAtIso: new Date().toISOString(), events }))}
          </p>
        </div>

        {/* Create New Snapshot */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Create New Snapshot
            </h4>
            <button
              onClick={() => setIsCreatingSnapshot(!isCreatingSnapshot)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              {isCreatingSnapshot ? 'Cancel' : '+ New Snapshot'}
            </button>
          </div>

          {isCreatingSnapshot && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Snapshot Name *
                </label>
                <input
                  type="text"
                  value={newSnapshotData.name}
                  onChange={(e) => setNewSnapshotData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Working version with checkout flow"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newSnapshotData.description}
                  onChange={(e) => setNewSnapshotData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional: What makes this version special?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
              <button
                onClick={handleCreateSnapshot}
                disabled={!newSnapshotData.name.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
              >
                Save Snapshot
              </button>
            </div>
          )}
        </div>

        {/* Snapshots List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Saved Snapshots ({snapshots.length})
            </h4>
            {snapshots.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportSnapshots}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Export All
                </button>
                <button
                  onClick={handleClearAllSnapshots}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Storage Stats */}
          {storageStats.snapshotCount > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total: {SM.formatSize(storageStats.totalSize)} • Average: {SM.formatSize(storageStats.averageSize)}
            </div>
          )}

          {/* Snapshots */}
          {snapshots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📸</div>
              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                No snapshots yet
              </h5>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Create your first snapshot to save the current state
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedSnapshot === snapshot.id
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedSnapshot(selectedSnapshot === snapshot.id ? null : snapshot.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {snapshot.name}
                      </h5>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {SM.getRelativeTime(snapshot.timestamp)} • {snapshot.eventCount} events • {SM.formatSize(snapshot.size)}
                      </div>
                      {snapshot.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {snapshot.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestoreSnapshot(snapshot.id)
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                        title="Restore this snapshot"
                      >
                        Restore
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSnapshot(snapshot.id, snapshot.name)
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm"
                        title="Delete this snapshot"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Snapshot Details */}
        {selectedSnapshotData && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Snapshot Details
            </h5>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Created:</strong> {SM.formatTimestamp(selectedSnapshotData.timestamp)}</p>
              <p><strong>Events:</strong> {selectedSnapshotData.eventCount}</p>
              <p><strong>Size:</strong> {SM.formatSize(selectedSnapshotData.size)}</p>
              <p><strong>Version:</strong> {selectedSnapshotData.version}</p>
              {selectedSnapshotData.description && (
                <p><strong>Description:</strong> {selectedSnapshotData.description}</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleRestoreSnapshot(selectedSnapshotData.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Restore This Version
              </button>
              <button
                onClick={() => handleDeleteSnapshot(selectedSnapshotData.id, selectedSnapshotData.name)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}