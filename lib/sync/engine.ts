import type { RealtimeChannel } from '@supabase/supabase-js'
import { fetchUserNotes, softDeleteNote, upsertNote } from '../db/notes.repo'
import { enqueueOp, listOps, removeOps, readCachedNotes, writeCachedNotes } from '../storage/outbox'
import { supabase } from '../supabase/client'
import type { Note } from '../types'
import { makeDeleteOp, makeUpsertOp } from './operations'

export type EngineState = {
  notes: Note[]
  pendingOps: number
  status: 'idle' | 'syncing' | 'error' | 'offline'
}

export type EngineListener = (state: EngineState) => void

export class SyncEngine {
  private userId: string
  private channel: RealtimeChannel | null = null
  private listeners = new Set<EngineListener>()
  private state: EngineState = { notes: [], pendingOps: 0, status: 'idle' }
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private flushing = false
  private started = false

  constructor(userId: string) {
    this.userId = userId
  }

  subscribe(listener: EngineListener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private setState(partial: Partial<EngineState>) {
    this.state = { ...this.state, ...partial }
    for (const listener of this.listeners) listener(this.state)
  }

  async start() {
    if (this.started) return
    this.started = true

    const cached = await readCachedNotes<Note[]>()
    if (cached) this.setState({ notes: cached })

    try {
      const remote = await fetchUserNotes(this.userId)
      if (remote) {
        await writeCachedNotes(remote)
        this.setState({ notes: remote })
      }
    } catch (error) {
      console.warn('[sync] failed to fetch remote notes:', error)
      this.setState({ status: 'error' })
    }

    this.subscribeRealtime()

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.scheduleFlush)
      window.addEventListener('visibilitychange', this.handleVisibility)
    }

    await this.scheduleFlush()
  }

  async stop() {
    if (!this.started) return
    this.started = false
    if (this.channel) {
      await supabase.removeChannel(this.channel)
      this.channel = null
    }
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.scheduleFlush)
      window.removeEventListener('visibilitychange', this.handleVisibility)
    }
    this.listeners.clear()
  }

  private subscribeRealtime() {
    this.channel = supabase
      .channel(`sync:user:${this.userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${this.userId}` },
        () => {
          void this.refresh()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'article_notes', filter: `user_id=eq.${this.userId}` },
        () => {
          void this.refresh()
        },
      )
      .subscribe()
  }

  private async refresh() {
    try {
      const remote = await fetchUserNotes(this.userId)
      if (remote) {
        await writeCachedNotes(remote)
        this.setState({ notes: remote })
      }
    } catch (error) {
      console.warn('[sync] refresh failed:', error)
    }
  }

  private handleVisibility = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      void this.scheduleFlush()
    }
  }

  scheduleFlush = async () => {
    if (this.flushTimer) clearTimeout(this.flushTimer)
    this.flushTimer = setTimeout(() => {
      void this.flush()
    }, 280)
  }

  async upsertNote(note: Note) {
    const nextNotes = this.state.notes.some((existing) => existing.id === note.id)
      ? this.state.notes.map((existing) => (existing.id === note.id ? note : existing))
      : [note, ...this.state.notes]
    await writeCachedNotes(nextNotes)
    this.setState({ notes: nextNotes })

    await enqueueOp(makeUpsertOp(note))
    const pending = (await listOps()).length
    this.setState({ pendingOps: pending })
    await this.scheduleFlush()
  }

  async deleteNote(clientId: string) {
    const nextNotes = this.state.notes.filter((existing) => existing.id !== clientId)
    await writeCachedNotes(nextNotes)
    this.setState({ notes: nextNotes })

    await enqueueOp(makeDeleteOp(clientId))
    const pending = (await listOps()).length
    this.setState({ pendingOps: pending })
    await this.scheduleFlush()
  }

  async replaceAll(notes: Note[]) {
    const previousIds = new Set(this.state.notes.map((note) => note.id))
    const nextIds = new Set(notes.map((note) => note.id))

    await writeCachedNotes(notes)
    this.setState({ notes })

    for (const note of notes) {
      await enqueueOp(makeUpsertOp(note))
    }
    for (const previousId of previousIds) {
      if (!nextIds.has(previousId)) {
        await enqueueOp(makeDeleteOp(previousId))
      }
    }
    const pending = (await listOps()).length
    this.setState({ pendingOps: pending })
    await this.scheduleFlush()
  }

  private async flush() {
    if (this.flushing) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setState({ status: 'offline' })
      return
    }

    this.flushing = true
    this.setState({ status: 'syncing' })

    try {
      const ops = await listOps()
      if (ops.length === 0) {
        this.setState({ status: 'idle', pendingOps: 0 })
        return
      }

      const completed: string[] = []
      for (const op of ops) {
        try {
          if (op.kind === 'upsert') {
            await upsertNote(this.userId, op.note)
          } else {
            await softDeleteNote(this.userId, op.clientId)
          }
          completed.push(op.clientOpId)
        } catch (error) {
          console.warn('[sync] op failed, leaving in outbox:', error)
          break
        }
      }
      await removeOps(completed)
      const remaining = (await listOps()).length
      this.setState({ pendingOps: remaining, status: remaining > 0 ? 'error' : 'idle' })
    } catch (error) {
      console.warn('[sync] flush failed:', error)
      this.setState({ status: 'error' })
    } finally {
      this.flushing = false
    }
  }
}
