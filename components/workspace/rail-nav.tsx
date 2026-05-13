'use client'

import { Download, Menu, PenLine, Plus, Search, Upload } from 'lucide-react'
import { filters } from '../../lib/editor-constants'
import type { Filter } from '../../lib/types'

type Props = {
  activeFilter: Filter
  hasActiveNote: boolean
  onSetActiveFilter: (filter: Filter) => void
  onToggleSidebar: () => void
  onOpenSidebar: () => void
  onCreate: () => void
  onImportClick: () => void
  onExport: () => void
}

export function RailNav({
  activeFilter,
  hasActiveNote,
  onSetActiveFilter,
  onToggleSidebar,
  onOpenSidebar,
  onCreate,
  onImportClick,
  onExport,
}: Props) {
  return (
    <nav className="fixed inset-y-0 right-0 z-50 flex w-16 flex-col items-center gap-2 border-l border-[#deded4] bg-[#fbfbf6] px-2 py-3 shadow-sm">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="grid h-11 w-11 place-items-center rounded-md bg-[#183c35] text-white transition hover:bg-[#225246]"
        aria-label="פתיחת סיידבר"
        title="סיידבר"
      >
        <PenLine className="h-5 w-5" />
      </button>

      <div className="my-2 h-px w-9 bg-[#deded4]" />

      <button
        type="button"
        onClick={onCreate}
        className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
        aria-label="פתק חדש"
        title="פתק חדש"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onImportClick}
        className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
        aria-label="ייבוא Word"
        title="ייבוא Word"
      >
        <Upload className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={!hasActiveNote}
        className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="ייצוא Word"
        title="ייצוא Word"
      >
        <Download className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onOpenSidebar}
        className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
        aria-label="חיפוש וסינון"
        title="חיפוש וסינון"
      >
        <Search className="h-5 w-5" />
      </button>

      <div className="my-2 h-px w-9 bg-[#deded4]" />

      {filters.map((filter) => {
        const Icon = filter.icon
        const selected = activeFilter === filter.id

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onSetActiveFilter(filter.id)}
            className={`grid h-10 w-10 place-items-center rounded-md transition ${
              selected ? 'bg-[#e5efe9] text-[#183c35]' : 'text-[#44514c] hover:bg-[#e5efe9] hover:text-[#183c35]'
            }`}
            aria-label={filter.label}
            title={filter.label}
          >
            <Icon className="h-5 w-5" />
          </button>
        )
      })}

      <div className="mt-auto">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
          aria-label="פתיחה וסגירה"
          title="פתיחה וסגירה"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}
