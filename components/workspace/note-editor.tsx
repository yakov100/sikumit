'use client'

import { Archive, FileText, Folder, Heart, MoreHorizontal, Tag, Trash2 } from 'lucide-react'
import { EditorContent, type Editor } from '@tiptap/react'
import { formatRelativeDate } from '../../lib/utils/dates'
import { parseTagInput } from '../../lib/utils/text'
import type { DictationState, Note } from '../../lib/types'
import { TiptapToolbar } from './tiptap-toolbar'

type Props = {
  note: Note
  editor: Editor | null
  formatToolbarOpen: boolean
  dictationState: DictationState
  dictationMessage: string
  activeArticleNotesCount: number
  onUpdate: (patch: Partial<Note>) => void
  onDelete: (id: string) => void
  onOpenArticleNotebook: () => void
  onToggleFormatToolbar: () => void
  onToggleDictation: () => void
}

export function NoteEditor({
  note,
  editor,
  formatToolbarOpen,
  dictationState,
  dictationMessage,
  activeArticleNotesCount,
  onUpdate,
  onDelete,
  onOpenArticleNotebook,
  onToggleFormatToolbar,
  onToggleDictation,
}: Props) {
  const wordCount = note.body.split(/\s+/).filter(Boolean).length

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#deded4] px-5 py-4 lg:px-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <TiptapToolbar
            editor={editor}
            open={formatToolbarOpen}
            dictationState={dictationState}
            dictationMessage={dictationMessage}
            onToggleOpen={onToggleFormatToolbar}
            onToggleDictation={onToggleDictation}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ favorite: !note.favorite })}
              className={`grid h-9 w-9 place-items-center rounded-md border transition ${
                note.favorite
                  ? 'border-[#e2bd62] bg-[#fff4d6] text-[#9f690b]'
                  : 'border-[#d8d8cf] bg-white text-[#59665f] hover:border-[#c7a44b]'
              }`}
              aria-label="סימון מועדף"
              title="מועדף"
            >
              <Heart className={`h-4 w-4 ${note.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ archived: !note.archived })}
              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#59665f] transition hover:border-[#317d6e]"
              aria-label="ארכוב"
              title="ארכוב"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="grid h-9 w-9 place-items-center rounded-md border border-[#e5c7c2] bg-white text-[#a34334] transition hover:bg-[#fff0ed]"
              aria-label="מחיקה"
              title="מחיקה"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#59665f]"
              aria-label="עוד"
              title="עוד"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <input
          value={note.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
          className="w-full bg-transparent text-3xl font-black leading-tight text-[#17211b] outline-none placeholder:text-[#a2aaa5] sm:text-4xl"
          placeholder="כותרת הפתק"
        />

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
          <label className="flex items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm font-semibold text-[#53625c]">
            <Folder className="h-4 w-4 text-[#317d6e]" />
            <input
              value={note.folder}
              onChange={(event) => onUpdate({ folder: event.target.value || 'כללי' })}
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder="נושא"
            />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm font-semibold text-[#53625c]">
            <Tag className="h-4 w-4 text-[#317d6e]" />
            <input
              value={note.tags.join(', ')}
              onChange={(event) => onUpdate({ tags: parseTagInput(event.target.value) })}
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder="תגיות"
            />
          </label>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[420px] flex-1 overflow-y-auto bg-[#fcfcf8] px-5 py-5 text-base leading-7 text-[#24302a] lg:px-8"
      />

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#deded4] px-5 py-3 text-xs font-bold text-[#6a766f] lg:px-8">
        <span>{wordCount} מילים</span>
        <span>{note.tags.length} תגיות</span>
        <span>{formatRelativeDate(note.updatedAt)}</span>
      </footer>

      <button
        type="button"
        onClick={onOpenArticleNotebook}
        className="fixed bottom-6 left-5 z-20 grid h-14 w-14 place-items-center rounded-full border border-[#c7d8d0] bg-[#183c35] text-white shadow-lg shadow-black/15 transition hover:bg-[#225246] sm:left-6"
        aria-label="פתיחת פנקס מאמר"
        title="פנקס מאמר"
      >
        <FileText className="h-5 w-5" />
        {activeArticleNotesCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-h-6 min-w-6 place-items-center rounded-full border border-[#183c35] bg-white px-1.5 text-xs font-black text-[#183c35]">
            {activeArticleNotesCount}
          </span>
        ) : null}
      </button>
    </div>
  )
}
