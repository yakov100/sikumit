import type { Note } from '../types'

export type UpsertNoteOp = {
  kind: 'upsert'
  clientOpId: string
  enqueuedAt: number
  note: Note
}

export type DeleteNoteOp = {
  kind: 'delete'
  clientOpId: string
  enqueuedAt: number
  clientId: string
}

export type SyncOperation = UpsertNoteOp | DeleteNoteOp

export function makeUpsertOp(note: Note): UpsertNoteOp {
  return {
    kind: 'upsert',
    clientOpId: crypto.randomUUID(),
    enqueuedAt: Date.now(),
    note,
  }
}

export function makeDeleteOp(clientId: string): DeleteNoteOp {
  return {
    kind: 'delete',
    clientOpId: crypto.randomUUID(),
    enqueuedAt: Date.now(),
    clientId,
  }
}
