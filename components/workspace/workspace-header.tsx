'use client'

import { Menu, Save, X } from 'lucide-react'
import type { SaveState } from '../../lib/types'

type Props = {
  saveState: SaveState
  offlineStatus: string
  userEmail: string | null
  onOpenSidebar: () => void
  onSignOut: () => void
}

export function WorkspaceHeader({ saveState, offlineStatus, userEmail, onOpenSidebar, onSignOut }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#deded4] bg-[#f7f7f2]/92 px-4 backdrop-blur lg:col-span-2 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="grid h-10 w-10 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#44514c] lg:hidden"
          aria-label="פתיחת תפריט"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-black sm:text-xl">פתקים וסיכומים</h1>
          <p className="hidden text-sm text-[#68756f] sm:block">כתיבה, ארגון וחיפוש במקום אחד</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm font-bold text-[#53625c]">
          <Save className="h-4 w-4 text-[#317d6e]" />
          {saveState === 'saving' ? 'שומר בענן...' : 'נשמר בענן'}
        </div>
        <div className="hidden items-center rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-bold text-[#53625c] md:flex">
          {offlineStatus}
        </div>
        {userEmail ? (
          <button
            type="button"
            onClick={onSignOut}
            className="hidden items-center gap-1.5 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-bold text-[#53625c] transition hover:border-[#317d6e] hover:text-[#183c35] md:flex"
            title={userEmail}
          >
            <span className="max-w-28 truncate">{userEmail}</span>
            <X className="h-3.5 w-3.5 shrink-0" />
          </button>
        ) : null}
      </div>
    </header>
  )
}
