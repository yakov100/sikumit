import { loadNotesFromWorkspaces } from '../db/workspaces.repo'
import { loadNotesFromDb, localStorageKey } from '../storage/indexed-db'
import type { Note } from '../types'

const migrationFlagKey = 'sikumit-legacy-migrated-v1'

export function isLegacyMigrated(userId: string) {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(`${migrationFlagKey}:${userId}`) === '1'
}

export function markLegacyMigrated(userId: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(`${migrationFlagKey}:${userId}`, '1')
}

export async function loadLegacyNotes(userId: string): Promise<Note[]> {
  try {
    const workspaces = await loadNotesFromWorkspaces(userId)
    if (workspaces?.notes.length) return workspaces.notes
  } catch {
    // Legacy table may not exist after PR4 cutover.
  }

  try {
    const indexed = await loadNotesFromDb()
    if (indexed?.length) return indexed
  } catch {
    // IDB may be unavailable.
  }

  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(localStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as Note[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch {
    // ignore
  }

  return []
}

export function clearLegacyLocalStorage() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(localStorageKey)
}
