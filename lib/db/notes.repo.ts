import { articleNoteRowSchema, noteRowSchema, type ArticleNoteRow, type NoteRow } from '../schemas'
import { sanitizeHtml } from '../security/sanitize'
import { supabase } from '../supabase/client'
import type { ArticleNote, Note } from '../types'

function toNoteRow(note: Note, userId: string) {
  return {
    user_id: userId,
    client_id: note.id,
    title: note.title,
    body_text: note.body,
    body_html: sanitizeHtml(note.bodyHtml ?? ''),
    folder: note.folder,
    tags: note.tags,
    favorite: note.favorite,
    archived: note.archived,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
    deleted_at: null as string | null,
  }
}

function fromNoteRow(row: NoteRow, articleNotes: ArticleNote[] = []): Note {
  return {
    id: row.client_id,
    title: row.title,
    body: row.body_text,
    bodyHtml: row.body_html ? sanitizeHtml(row.body_html) : undefined,
    folder: row.folder,
    tags: row.tags ?? [],
    favorite: row.favorite,
    archived: row.archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    articleNotes,
  }
}

function fromArticleNoteRow(row: ArticleNoteRow): ArticleNote {
  return {
    id: row.client_id,
    text: row.text,
    done: row.done,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const NOTE_COLUMNS =
  'id, user_id, client_id, title, body_text, body_html, folder, tags, favorite, archived, version, created_at, updated_at, deleted_at'

const ARTICLE_COLUMNS = 'id, note_id, user_id, client_id, text, done, created_at, updated_at'

export async function fetchUserNotes(userId: string): Promise<Note[] | null> {
  const { data: noteRows, error: notesError } = await supabase
    .from('notes')
    .select(NOTE_COLUMNS)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (notesError || !noteRows) return null

  const validated: NoteRow[] = []
  for (const raw of noteRows) {
    const parsed = noteRowSchema.safeParse(raw)
    if (parsed.success) {
      validated.push(parsed.data)
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('[notes.repo] dropping invalid note row:', parsed.error.flatten())
    }
  }

  if (validated.length === 0) return []
  const noteIds = validated.map((row) => row.id)

  const { data: articleRows } = await supabase
    .from('article_notes')
    .select(ARTICLE_COLUMNS)
    .in('note_id', noteIds)

  const articlesByNoteId = new Map<string, ArticleNote[]>()
  for (const raw of articleRows ?? []) {
    const parsed = articleNoteRowSchema.safeParse(raw)
    if (!parsed.success) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[notes.repo] dropping invalid article note row:', parsed.error.flatten())
      }
      continue
    }
    const article: ArticleNoteRow = parsed.data
    const list = articlesByNoteId.get(article.note_id) ?? []
    list.push(fromArticleNoteRow(article))
    articlesByNoteId.set(article.note_id, list)
  }

  return validated.map((row) => fromNoteRow(row, articlesByNoteId.get(row.id) ?? []))
}

export async function upsertNote(userId: string, note: Note): Promise<void> {
  const { data, error } = await supabase
    .from('notes')
    .upsert(toNoteRow(note, userId), { onConflict: 'user_id,client_id' })
    .select('id')
    .single()

  if (error || !data) throw error ?? new Error('Failed to upsert note')

  const noteId = (data as { id: string }).id
  const articleNotes = note.articleNotes ?? []

  if (articleNotes.length > 0) {
    const articleRows = articleNotes.map((article) => ({
      note_id: noteId,
      user_id: userId,
      client_id: article.id,
      text: article.text,
      done: article.done,
      created_at: article.createdAt,
      updated_at: article.updatedAt,
    }))
    await supabase.from('article_notes').upsert(articleRows, { onConflict: 'user_id,client_id' })
  }

  const clientIds = articleNotes.map((a) => a.id)
  const deleteQuery = supabase.from('article_notes').delete().eq('note_id', noteId)
  if (clientIds.length > 0) {
    await deleteQuery.not('client_id', 'in', `(${clientIds.map((id) => `"${id}"`).join(',')})`)
  } else {
    await deleteQuery
  }
}

export async function softDeleteNote(userId: string, clientId: string): Promise<void> {
  await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('client_id', clientId)
}

export async function replaceUserNotes(userId: string, notes: Note[]): Promise<void> {
  for (const note of notes) {
    await upsertNote(userId, note)
  }

  const currentClientIds = notes.map((note) => note.id)
  const softDeleteQuery = supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (currentClientIds.length > 0) {
    await softDeleteQuery.not('client_id', 'in', `(${currentClientIds.map((id) => `"${id}"`).join(',')})`)
  } else {
    await softDeleteQuery
  }
}
