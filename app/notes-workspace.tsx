'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthForm } from '../components/auth/auth-form'
import { ArticleNotebook } from '../components/workspace/article-notebook'
import { EmptyState } from '../components/workspace/empty-state'
import { NoteEditor } from '../components/workspace/note-editor'
import { NoteList } from '../components/workspace/note-list'
import { RailNav } from '../components/workspace/rail-nav'
import { Sidebar } from '../components/workspace/sidebar'
import { WorkspaceHeader } from '../components/workspace/workspace-header'
import { useAuth } from '../hooks/use-auth'
import { useDictation } from '../hooks/use-dictation'
import { useNotesEditor } from '../hooks/use-notes-editor'
import { useServiceWorker } from '../hooks/use-service-worker'
import { useSyncedNotes } from '../hooks/use-synced-notes'
import { createDocxBlob } from '../lib/docx/export'
import { readDocxBlocks } from '../lib/docx/import'
import {
  clearLegacyLocalStorage,
  isLegacyMigrated,
  loadLegacyNotes,
  markLegacyMigrated,
} from '../lib/sync/legacy-migration'
import type { ArticleNote, Filter, Note, SaveState } from '../lib/types'
import { blocksToHtml, blocksToPlainText, htmlToPlainText, noteHtml, sanitizeFileName, uniqueValues } from '../lib/utils/text'

export function NotesWorkspace() {
  const { user, loading: authLoading, signOut } = useAuth()
  const synced = useSyncedNotes(user?.id ?? null)

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [articleNotebookOpen, setArticleNotebookOpen] = useState(false)
  const [articleNoteDraft, setArticleNoteDraft] = useState('')
  const [fileStatus, setFileStatus] = useState('')
  const [formatToolbarOpen, setFormatToolbarOpen] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const migrationAttemptedRef = useRef(false)
  const lastLoadedNoteIdRef = useRef<string | null>(null)
  const upsertRef = useRef(synced.upsertNote)

  useEffect(() => {
    upsertRef.current = synced.upsertNote
  })

  const { status: offlineStatus } = useServiceWorker('/sw.js', '/')

  const notes = synced.notes
  const activeId =
    (selectedNoteId && notes.some((note) => note.id === selectedNoteId) ? selectedNoteId : notes[0]?.id) ?? ''
  const activeNote = notes.find((note) => note.id === activeId) ?? notes[0]

  const handleEditorChange = useCallback((bodyHtml: string) => {
    if (!lastLoadedNoteIdRef.current) return
    const note = notes.find((existing) => existing.id === lastLoadedNoteIdRef.current)
    if (!note) return
    void upsertRef.current({
      ...note,
      bodyHtml,
      body: htmlToPlainText(bodyHtml),
      updatedAt: new Date().toISOString(),
    })
  }, [notes])

  const editor = useNotesEditor({
    initialContent: activeNote ? noteHtml(activeNote) : '',
    onUpdateHtml: handleEditorChange,
    searchQuery: query,
  })

  useEffect(() => {
    if (!editor || !activeNote) return
    if (lastLoadedNoteIdRef.current === activeNote.id) return

    editor.commands.setContent(noteHtml(activeNote), { emitUpdate: false })
    lastLoadedNoteIdRef.current = activeNote.id
  }, [editor, activeNote])

  const activeArticleNotes = activeNote?.articleNotes ?? []
  const activeArticleNotesCount = activeArticleNotes.filter((articleNote) => !articleNote.done).length
  const folders = useMemo(() => uniqueValues(notes, 'folder'), [notes])
  const tags = useMemo(() => uniqueValues(notes, 'tags'), [notes])

  useEffect(() => {
    if (!user || !synced.hydrated || migrationAttemptedRef.current) return
    migrationAttemptedRef.current = true

    void (async () => {
      if (notes.length > 0 || isLegacyMigrated(user.id)) {
        markLegacyMigrated(user.id)
        clearLegacyLocalStorage()
        return
      }
      const legacy = await loadLegacyNotes(user.id)
      if (legacy.length > 0) {
        await synced.replaceAll(legacy)
      }
      markLegacyMigrated(user.id)
      clearLegacyLocalStorage()
    })()
  }, [user, synced, notes])

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return notes
      .filter((note) => {
        if (activeFilter === 'archive' && !note.archived) return false
        if (activeFilter !== 'archive' && note.archived) return false
        if (activeFilter === 'favorites' && !note.favorite) return false
        if (activeTag && !note.tags.includes(activeTag)) return false
        if (activeFolder && note.folder !== activeFolder) return false

        if (!normalizedQuery) return true
        const searchable = [
          note.title,
          note.body,
          note.folder,
          ...note.tags,
          ...(note.articleNotes ?? []).map((articleNote) => articleNote.text),
        ]
          .join(' ')
          .toLowerCase()
        return searchable.includes(normalizedQuery)
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [activeFilter, activeFolder, activeTag, notes, query])

  const saveState: SaveState =
    synced.status === 'syncing' ? 'saving' : synced.pendingOps > 0 ? 'ready' : 'saved'

  async function handleSignOut() {
    await signOut()
    setSelectedNoteId(null)
    lastLoadedNoteIdRef.current = null
  }

  function updateNote(patch: Partial<Note>) {
    if (!activeNote) return
    const next = { ...activeNote, ...patch, updatedAt: new Date().toISOString() }
    void synced.upsertNote(next)
  }

  const dictation = useDictation({
    onTranscript: (text) => editor?.chain().focus().insertContent(text).run(),
    beforeStart: () => editor?.chain().focus().run(),
  })

  function updateArticleNotes(articleNotes: ArticleNote[]) {
    updateNote({ articleNotes })
  }

  function addArticleNote() {
    const text = articleNoteDraft.trim()
    if (!text) return

    const now = new Date().toISOString()
    const articleNote: ArticleNote = {
      id: `an-${crypto.randomUUID()}`,
      text,
      done: false,
      createdAt: now,
      updatedAt: now,
    }

    updateArticleNotes([articleNote, ...activeArticleNotes])
    setArticleNoteDraft('')
  }

  function toggleArticleNote(id: string) {
    const now = new Date().toISOString()
    updateArticleNotes(
      activeArticleNotes.map((articleNote) =>
        articleNote.id === id ? { ...articleNote, done: !articleNote.done, updatedAt: now } : articleNote,
      ),
    )
  }

  function deleteArticleNote(id: string) {
    if (!window.confirm('למחוק את ההערה הזו?')) return
    updateArticleNotes(activeArticleNotes.filter((articleNote) => articleNote.id !== id))
  }

  function createNote() {
    const now = new Date().toISOString()
    const note: Note = {
      id: `n-${crypto.randomUUID()}`,
      title: query.trim() || 'פתק חדש',
      body: '',
      bodyHtml: '<p></p>',
      articleNotes: [],
      tags: activeTag ? [activeTag] : ['כללי'],
      folder: activeFolder || 'כללי',
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }

    void synced.upsertNote(note)
    setSelectedNoteId(note.id)
    setArticleNoteDraft('')
    setActiveFilter('all')
    setSidebarOpen(false)
  }

  function deleteNote(id: string) {
    if (!window.confirm('למחוק את הפתק הזה?')) return
    void synced.deleteNote(id)
    if (activeId === id) {
      const remaining = notes.find((note) => note.id !== id)
      setSelectedNoteId(remaining?.id ?? null)
    }
  }

  async function importWordFile(file: File) {
    setFileStatus('מייבא קובץ Word...')

    try {
      const blocks = await readDocxBlocks(file)
      const [firstLine, ...rest] = blocks
      const now = new Date().toISOString()
      const title = firstLine?.text.trim() || file.name.replace(/\.docx$/i, '')
      const bodyBlocks = rest.length > 0 ? rest : blocks
      const bodyHtml = blocksToHtml(bodyBlocks)
      const note: Note = {
        id: `n-${crypto.randomUUID()}`,
        title,
        body: blocksToPlainText(bodyBlocks),
        bodyHtml,
        articleNotes: [],
        tags: ['Word'],
        folder: 'מיובאים',
        favorite: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      }

      await synced.upsertNote(note)
      setSelectedNoteId(note.id)
      setArticleNoteDraft('')
      setActiveFilter('all')
      setFileStatus('קובץ Word יובא לפתק חדש')
    } catch (error) {
      setFileStatus(error instanceof Error ? error.message : 'לא הצלחתי לייבא את הקובץ')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function exportActiveNote() {
    if (!activeNote) return

    const blob = createDocxBlob(activeNote)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizeFileName(activeNote.title)}.docx`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setFileStatus('הפתק יוצא לקובץ Word')
  }

  function clearFilters() {
    setActiveTag(null)
    setActiveFolder(null)
    setQuery('')
  }

  const emptySearch = Boolean(query.trim() && filteredNotes.length === 0)

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f2] text-[#17211b]">
        <p className="text-sm font-bold text-[#53625c]">טוען...</p>
      </main>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#17211b]">
      <div className="min-h-screen pr-16">
        <RailNav
          activeFilter={activeFilter}
          hasActiveNote={Boolean(activeNote)}
          onSetActiveFilter={setActiveFilter}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onCreate={createNote}
          onImportClick={() => fileInputRef.current?.click()}
          onExport={exportActiveNote}
        />

        <Sidebar
          open={sidebarOpen}
          notes={notes}
          folders={folders}
          tags={tags}
          query={query}
          fileStatus={fileStatus}
          activeFilter={activeFilter}
          activeFolder={activeFolder}
          activeTag={activeTag}
          hasActiveNote={Boolean(activeNote)}
          fileInputRef={fileInputRef}
          onClose={() => setSidebarOpen(false)}
          onCreate={createNote}
          onImportClick={() => fileInputRef.current?.click()}
          onExport={exportActiveNote}
          onImportFile={(file) => {
            void importWordFile(file)
          }}
          onQueryChange={setQuery}
          onSelectFilter={(filter) => {
            setActiveFilter(filter)
            setSidebarOpen(false)
          }}
          onSelectFolder={setActiveFolder}
          onSelectTag={setActiveTag}
        />

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="סגירת תפריט"
            className="fixed inset-0 z-30 bg-black/10"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <section className="flex min-w-0 flex-1 flex-col lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
          <WorkspaceHeader
            saveState={saveState}
            offlineStatus={offlineStatus}
            userEmail={user.email ?? null}
            onOpenSidebar={() => setSidebarOpen(true)}
            onSignOut={() => {
              void handleSignOut()
            }}
          />

          <NoteList
            notes={filteredNotes}
            activeNoteId={activeNote?.id}
            query={query}
            activeTag={activeTag}
            activeFolder={activeFolder}
            emptySearch={emptySearch}
            onSelect={(id) => {
              setSelectedNoteId(id)
              setArticleNoteDraft('')
              setSidebarOpen(false)
            }}
            onCreate={createNote}
            onClearFilters={clearFilters}
          />

          <article className="relative min-h-0 bg-[#fcfcf8] lg:h-[calc(100vh-4rem)]">
            {activeNote ? (
              <>
                <NoteEditor
                  note={activeNote}
                  editor={editor}
                  formatToolbarOpen={formatToolbarOpen}
                  dictationState={dictation.state}
                  dictationMessage={dictation.message}
                  activeArticleNotesCount={activeArticleNotesCount}
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                  onOpenArticleNotebook={() => setArticleNotebookOpen(true)}
                  onToggleFormatToolbar={() => setFormatToolbarOpen((open) => !open)}
                  onToggleDictation={dictation.toggle}
                />

                <ArticleNotebook
                  open={articleNotebookOpen}
                  articleNotes={activeArticleNotes}
                  activeCount={activeArticleNotesCount}
                  draft={articleNoteDraft}
                  onClose={() => setArticleNotebookOpen(false)}
                  onDraftChange={setArticleNoteDraft}
                  onAdd={addArticleNote}
                  onToggle={toggleArticleNote}
                  onDelete={deleteArticleNote}
                />
              </>
            ) : (
              <EmptyState onCreate={createNote} />
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
