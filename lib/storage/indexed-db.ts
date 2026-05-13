import type { Note } from '../types'

const dbName = 'sikumit-db'
const dbStore = 'notes'
const dbRecordKey = 'workspace'

export const localStorageKey = 'quiet-notes-workspace'

function openNotesDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(dbStore)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadNotesFromDb(): Promise<Note[] | null> {
  const db = await openNotesDb()

  return new Promise<Note[] | null>((resolve, reject) => {
    const transaction = db.transaction(dbStore, 'readonly')
    const request = transaction.objectStore(dbStore).get(dbRecordKey)

    request.onsuccess = () => resolve((request.result as Note[] | undefined) ?? null)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

export async function saveNotesToDb(notes: Note[]): Promise<void> {
  const db = await openNotesDb()

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(dbStore, 'readwrite')
    transaction.objectStore(dbStore).put(notes, dbRecordKey)
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}
