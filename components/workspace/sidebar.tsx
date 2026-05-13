'use client'

import { type RefObject } from 'react'
import { Download, Folder, Hash, PenLine, Plus, Search, Tag, Upload, X } from 'lucide-react'
import { filters } from '../../lib/editor-constants'
import type { Filter, Note } from '../../lib/types'

type Props = {
  open: boolean
  notes: Note[]
  folders: string[]
  tags: string[]
  query: string
  fileStatus: string
  activeFilter: Filter
  activeFolder: string | null
  activeTag: string | null
  hasActiveNote: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onClose: () => void
  onCreate: () => void
  onImportClick: () => void
  onExport: () => void
  onImportFile: (file: File) => void
  onQueryChange: (value: string) => void
  onSelectFilter: (filter: Filter) => void
  onSelectFolder: (folder: string | null) => void
  onSelectTag: (tag: string | null) => void
}

export function Sidebar({
  open,
  notes,
  folders,
  tags,
  query,
  fileStatus,
  activeFilter,
  activeFolder,
  activeTag,
  hasActiveNote,
  fileInputRef,
  onClose,
  onCreate,
  onImportClick,
  onExport,
  onImportFile,
  onQueryChange,
  onSelectFilter,
  onSelectFolder,
  onSelectTag,
}: Props) {
  return (
    <aside
      className={`fixed inset-y-0 right-16 z-40 w-[292px] border-l border-[#deded4] bg-[#fbfbf6] shadow-xl transition-transform duration-200 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-[#deded4] px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-[#183c35] text-white">
              <PenLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black leading-5">סיכומית</p>
              <p className="text-xs font-semibold text-[#69756f]">מרחב כתיבה אישי</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-[#58655f] hover:bg-[#ecece4]"
            aria-label="סגירת תפריט"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-4 py-4">
          <button
            type="button"
            onClick={onCreate}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#225246]"
          >
            <Plus className="h-4 w-4" />
            פתק חדש
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onImportClick}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 text-sm font-bold text-[#44514c] transition hover:border-[#317d6e]"
            >
              <Upload className="h-4 w-4" />
              ייבוא Word
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={!hasActiveNote}
              className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 text-sm font-bold text-[#44514c] transition hover:border-[#317d6e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              ייצוא Word
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onImportFile(file)
            }}
          />
          {fileStatus ? (
            <p className="rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-bold leading-5 text-[#59665f]">
              {fileStatus}
            </p>
          ) : null}

          <label className="relative block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f7b75]" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="חיפוש בכותרת, תוכן או תגית"
              className="h-11 w-full rounded-md border border-[#d8d8cf] bg-white pr-10 pl-3 text-sm font-medium outline-none transition placeholder:text-[#8c958f] focus:border-[#317d6e] focus:ring-2 focus:ring-[#317d6e]/15"
            />
          </label>

          <nav className="space-y-1">
            {filters.map((filter) => {
              const Icon = filter.icon
              const selected = activeFilter === filter.id

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onSelectFilter(filter.id)}
                  className={`flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-bold transition ${
                    selected ? 'bg-[#e5efe9] text-[#183c35]' : 'text-[#51605a] hover:bg-[#eeeeE7]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {filter.label}
                  </span>
                  <span className="text-xs text-[#7d8882]">
                    {filter.id === 'archive'
                      ? notes.filter((note) => note.archived).length
                      : notes.filter((note) => !note.archived).length}
                  </span>
                </button>
              )
            })}
          </nav>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#7a837e]">
              <Folder className="h-3.5 w-3.5" />
              נושאים
            </div>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => onSelectFolder(activeFolder === folder ? null : folder)}
                  className={`flex h-9 w-full items-center justify-between rounded-md px-3 text-sm font-semibold ${
                    activeFolder === folder ? 'bg-[#f0e6cf] text-[#5c3f0f]' : 'text-[#53625c] hover:bg-[#eeeeE7]'
                  }`}
                >
                  {folder}
                  <span className="text-xs">{notes.filter((note) => note.folder === folder).length}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-[#7a837e]">
              <Tag className="h-3.5 w-3.5" />
              תגיות
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(activeTag === tag ? null : tag)}
                  className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-bold transition ${
                    activeTag === tag
                      ? 'border-[#317d6e] bg-[#e5efe9] text-[#183c35]'
                      : 'border-[#d8d8cf] bg-white text-[#56635d] hover:border-[#b9c2bc]'
                  }`}
                >
                  <Hash className="h-3 w-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
