'use client'

import { CheckSquare, FileText, Plus, Trash2, X } from 'lucide-react'
import type { ArticleNote } from '../../lib/types'

type Props = {
  open: boolean
  articleNotes: ArticleNote[]
  activeCount: number
  draft: string
  onClose: () => void
  onDraftChange: (value: string) => void
  onAdd: () => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function ArticleNotebook({
  open,
  articleNotes,
  activeCount,
  draft,
  onClose,
  onDraftChange,
  onAdd,
  onToggle,
  onDelete,
}: Props) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="סגירת פנקס מאמר"
        className="fixed inset-0 z-30 bg-black/10"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[calc(100%-1.25rem)] max-w-[390px] flex-col border-r border-[#deded4] bg-[#fbfbf6] shadow-2xl sm:w-[380px]">
        <div className="flex h-16 items-center justify-between border-b border-[#deded4] px-4">
          <div>
            <p className="text-lg font-black text-[#17211b]">פנקס מאמר</p>
            <p className="text-xs font-bold text-[#6b7771]">{activeCount} הערות פעילות</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-[#58655f] hover:bg-[#ecece4]"
            aria-label="סגירת פנקס מאמר"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-[#deded4] p-4">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#27352f]">הערה חדשה</span>
            <textarea
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') onAdd()
              }}
              rows={4}
              className="w-full resize-none rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm leading-6 text-[#24302a] outline-none transition placeholder:text-[#929d97] focus:border-[#317d6e] focus:ring-2 focus:ring-[#317d6e]/15"
              placeholder="שאלה, רעיון, מקור לבדיקה..."
            />
          </label>
          <button
            type="button"
            onClick={onAdd}
            disabled={!draft.trim()}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white transition hover:bg-[#225246] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus className="h-4 w-4" />
            הוספת הערה
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {articleNotes.length === 0 ? (
            <div className="mt-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-[#87918b]" />
              <p className="font-black text-[#27352f]">אין הערות בפנקס</p>
              <p className="mt-2 text-sm leading-6 text-[#68756f]">הערות שתוסיף כאן יישמרו רק עם המאמר הזה.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {articleNotes.map((articleNote) => (
                <div
                  key={articleNote.id}
                  className={`rounded-md border bg-white p-3 transition ${
                    articleNote.done ? 'border-[#d8d8cf] opacity-70' : 'border-[#c7d8d0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggle(articleNote.id)}
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border transition ${
                        articleNote.done
                          ? 'border-[#317d6e] bg-[#e5efe9] text-[#183c35]'
                          : 'border-[#d8d8cf] text-[#6b7771] hover:border-[#317d6e]'
                      }`}
                      aria-label={articleNote.done ? 'סימון כהערה פעילה' : 'סימון כבוצע'}
                      title={articleNote.done ? 'החזרה לפעיל' : 'בוצע'}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                    <p
                      className={`min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-[#27352f] ${
                        articleNote.done ? 'line-through decoration-[#7f8a84]' : ''
                      }`}
                    >
                      {articleNote.text}
                    </p>
                    <button
                      type="button"
                      onClick={() => onDelete(articleNote.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#a34334] transition hover:bg-[#fff0ed]"
                      aria-label="מחיקת הערה"
                      title="מחיקה"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
