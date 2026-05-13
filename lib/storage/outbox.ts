import type { SyncOperation } from '../sync/operations'

const dbName = 'sikumit-sync'
const dbVersion = 1
const outboxStore = 'outbox'
const cacheStore = 'notes-cache'

function openSyncDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(outboxStore)) {
        db.createObjectStore(outboxStore, { keyPath: 'clientOpId' })
      }
      if (!db.objectStoreNames.contains(cacheStore)) {
        db.createObjectStore(cacheStore)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function enqueueOp(op: SyncOperation): Promise<void> {
  const db = await openSyncDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(outboxStore, 'readwrite')
    tx.objectStore(outboxStore).put(op)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function listOps(): Promise<SyncOperation[]> {
  const db = await openSyncDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(outboxStore, 'readonly')
    const request = tx.objectStore(outboxStore).getAll()
    request.onsuccess = () => {
      const result = (request.result as SyncOperation[]) ?? []
      result.sort((a, b) => a.enqueuedAt - b.enqueuedAt)
      resolve(result)
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function removeOps(opIds: string[]): Promise<void> {
  if (opIds.length === 0) return
  const db = await openSyncDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(outboxStore, 'readwrite')
    const store = tx.objectStore(outboxStore)
    opIds.forEach((id) => store.delete(id))
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function readCachedNotes<T>(): Promise<T | null> {
  const db = await openSyncDb()
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(cacheStore, 'readonly')
    const request = tx.objectStore(cacheStore).get('notes')
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function writeCachedNotes<T>(value: T): Promise<void> {
  const db = await openSyncDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cacheStore, 'readwrite')
    tx.objectStore(cacheStore).put(value, 'notes')
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}
