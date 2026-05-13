'use client'

import { CalendarDays, Plus, Search, Star, X } from 'lucide-react'
import { formatRelativeDate } from '../../lib/utils/dates'
import type { Note } from '../../lib/types'
import { highlightText } from './highlight-text'

type Props = {
  notes: Note[]
  activeNoteId?: string
  query: string
  activeTag: string | null
  activeFolder: string | null
  emptySearch: boolean
  onSelect: (id: string) => void
  onCreate: () => void
  onClearFilters: () => void
}

export function NoteList({
  notes,
  activeNoteId,
  query,
  activeTag,
  activeFolder,
  emptySearch,
  onSelect,
  onCreate,
  onClearFilters,
}: Props) {
  return (
    <div className="min-h-0 border-l border-[#deded4] bg-[#f1f1ea] lg:h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#deded4] px-4 py-3">
          <div>
            <p className="text-sm font-black text-[#27352f]">{notes.length} פתקים</p>
            <p className="text-xs font-semibold text-[#738078]">
              {activeTag ? `תגית: ${activeTag}` : activeFolder ? `נושא: ${activeFolder}` : 'תצוגת עבודה'}
            </p>
          </div>
          {(activeTag || activeFolder || query) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="grid h-9 w-9 place-items-center rounded-md text-[#59665f] hover:bg-white"
              aria-label="ניקוי סינון"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {emptySearch ? (
            <div className="mt-10 px-5 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-[#87918b]" />
              <p className="font-black">לא נמצאו תוצאות</p>
              <p className="mt-2 text-sm leading-6 text-[#68756f]">אפשר ליצור פתק חדש עם מילת החיפוש הנוכחית.</p>
              <button
                type="button"
                onClick={onCreate}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white"
              >
                <Plus className="h-4 w-4" />
                יצירת פתק
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => {
                const selected = note.id === activeNoteId
                const preview = note.body || 'אין תוכן עדיין'

                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => onSelect(note.id)}
                    className={`w-full rounded-md border p-4 text-right transition ${
                      selected
                        ? 'border-[#317d6e] bg-white shadow-sm'
                        : 'border-transparent bg-transparent hover:border-[#deded4] hover:bg-white/70'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h2 className="line-clamp-2 text-base font-black leading-6 text-[#1d2a24]">
                        {highlightText(note.title, query)}
                      </h2>
                      {note.favorite ? <Star className="mt-1 h-4 w-4 shrink-0 fill-[#c88a12] text-[#c88a12]" /> : null}
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[#5e6b65]">{highlightText(preview, query)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#7a857f]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatRelativeDate(note.updatedAt)}
                      </span>
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded bg-[#e7e7de] px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
