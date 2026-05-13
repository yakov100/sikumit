'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { SyncEngine, type EngineState } from '../lib/sync/engine'
import type { Note } from '../lib/types'
import { initialNotes } from '../lib/utils/initial-notes'

const emptyEngineState: EngineState = {
  notes: [],
  pendingOps: 0,
  status: 'idle',
}

type EngineStore = {
  engine: SyncEngine
  state: EngineState
  hydrated: boolean
  listeners: Set<() => void>
}

const stores = new Map<string, EngineStore>()

function getOrCreateStore(userId: string): EngineStore {
  let store = stores.get(userId)
  if (store) return store

  const engine = new SyncEngine(userId)
  const created: EngineStore = {
    engine,
    state: emptyEngineState,
    hydrated: false,
    listeners: new Set(),
  }
  engine.subscribe((next) => {
    created.state = next
    created.hydrated = true
    for (const listener of created.listeners) listener()
  })
  void engine.start()
  stores.set(userId, created)
  store = created
  return store
}

function teardownStore(userId: string) {
  const store = stores.get(userId)
  if (!store) return
  if (store.listeners.size > 0) return
  void store.engine.stop()
  stores.delete(userId)
}

export function useSyncedNotes(userId: string | null) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!userId) return () => {}
      const store = getOrCreateStore(userId)
      store.listeners.add(notify)
      return () => {
        store.listeners.delete(notify)
        teardownStore(userId)
      }
    },
    [userId],
  )

  const getSnapshot = useCallback(() => {
    if (!userId) return emptyEngineState
    return stores.get(userId)?.state ?? emptyEngineState
  }, [userId])

  const getServerSnapshot = useCallback(() => emptyEngineState, [])

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const hydrated = userId ? (stores.get(userId)?.hydrated ?? false) : false

  const displayNotes = useMemo(() => {
    if (!userId) return initialNotes
    if (!hydrated) return []
    return state.notes
  }, [hydrated, state.notes, userId])

  return {
    notes: displayNotes,
    pendingOps: state.pendingOps,
    status: state.status,
    hydrated,
    upsertNote: (note: Note) =>
      userId ? (stores.get(userId)?.engine.upsertNote(note) ?? Promise.resolve()) : Promise.resolve(),
    deleteNote: (clientId: string) =>
      userId ? (stores.get(userId)?.engine.deleteNote(clientId) ?? Promise.resolve()) : Promise.resolve(),
    replaceAll: (notes: Note[]) =>
      userId ? (stores.get(userId)?.engine.replaceAll(notes) ?? Promise.resolve()) : Promise.resolve(),
  }
}
