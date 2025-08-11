import type { DataDictionary } from '../schema/dataDictionary'

const KEY = 'ddg_project_json'

export function saveProject(dict: DataDictionary) {
  localStorage.setItem(KEY, JSON.stringify(dict))
}

export function loadProject(): DataDictionary | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}


