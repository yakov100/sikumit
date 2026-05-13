'use client'

import { FileText, Plus } from 'lucide-react'

type Props = {
  onCreate: () => void
}

export function EmptyState({ onCreate }: Props) {
  return (
    <div className="grid h-full min-h-[520px] place-items-center px-5 text-center">
      <div>
        <FileText className="mx-auto mb-4 h-10 w-10 text-[#87918b]" />
        <p className="text-xl font-black">אין פתק פתוח</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          פתק חדש
        </button>
      </div>
    </div>
  )
}
