'use client'

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Mic,
  MicOff,
  Minus,
  MoreHorizontal,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react'
import { type Editor } from '@tiptap/react'
import {
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  highlightOptions,
  styleOptions,
} from '../../lib/editor-constants'
import type { DictationState } from '../../lib/types'

type Props = {
  editor: Editor | null
  open: boolean
  dictationState: DictationState
  dictationMessage: string
  onToggleOpen: () => void
  onToggleDictation: () => void
}

export function TiptapToolbar({
  editor,
  open,
  dictationState,
  dictationMessage,
  onToggleOpen,
  onToggleDictation,
}: Props) {
  const can = (action: () => boolean) => Boolean(editor) && action()
  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    Boolean(editor?.isActive(name, attrs))

  const buttonClass = (active: boolean) =>
    `grid h-9 w-9 place-items-center rounded-md border transition ${
      active
        ? 'border-[#317d6e] bg-[#e5efe9] text-[#183c35]'
        : 'border-[#d8d8cf] bg-white text-[#4e5b55] hover:border-[#317d6e] hover:text-[#183c35]'
    }`

  function applyBlockStyle(value: string) {
    if (!editor) return
    const chain = editor.chain().focus()
    if (value === 'p') chain.setParagraph().run()
    else if (value === 'h1') chain.toggleHeading({ level: 1 }).run()
    else if (value === 'h2') chain.toggleHeading({ level: 2 }).run()
    else if (value === 'h3') chain.toggleHeading({ level: 3 }).run()
    else if (value === 'blockquote') chain.toggleBlockquote().run()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggleOpen}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 text-sm font-bold text-[#44514c] transition hover:border-[#317d6e] hover:text-[#183c35]"
        aria-expanded={open}
        aria-label={open ? 'הסתרת סרגל עריכה' : 'הצגת סרגל עריכה'}
        title={open ? 'הסתרת סרגל עריכה' : 'הצגת סרגל עריכה'}
      >
        <MoreHorizontal className="h-4 w-4" />
        {open ? 'הסתר סרגל' : 'הצג סרגל'}
      </button>

      {open ? (
        <div className="sikumit-ribbon flex flex-wrap items-center gap-2 rounded-md border border-[#deded4] bg-[#f6f6ef] p-2">
          <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!can(() => editor!.can().undo())}
              className={buttonClass(false)}
              aria-label="ביטול"
              title="ביטול"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!can(() => editor!.can().redo())}
              className={buttonClass(false)}
              aria-label="ביצוע מחדש"
              title="ביצוע מחדש"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-l border-[#d8d8cf] pl-2">
            <select
              aria-label="סגנון פסקה"
              onChange={(event) => applyBlockStyle(event.target.value)}
              className="h-9 rounded-md border border-[#d8d8cf] bg-white px-2 text-sm font-bold text-[#44514c] outline-none"
              value={
                editor?.isActive('heading', { level: 1 })
                  ? 'h1'
                  : editor?.isActive('heading', { level: 2 })
                    ? 'h2'
                    : editor?.isActive('heading', { level: 3 })
                      ? 'h3'
                      : editor?.isActive('blockquote')
                        ? 'blockquote'
                        : 'p'
              }
            >
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="גודל טקסט"
              onChange={(event) => editor?.chain().focus().setFontSize(event.target.value).run()}
              className="h-9 w-20 rounded-md border border-[#d8d8cf] bg-white px-2 text-sm font-bold text-[#44514c] outline-none"
              value={(editor?.getAttributes('textStyle').fontSize as string) ?? ''}
            >
              <option value="">גודל</option>
              {fontSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              aria-label="גופן"
              onChange={(event) =>
                event.target.value
                  ? editor?.chain().focus().setFontFamily(event.target.value).run()
                  : editor?.chain().focus().unsetFontFamily().run()
              }
              className="h-9 rounded-md border border-[#d8d8cf] bg-white px-2 text-sm font-bold text-[#44514c] outline-none"
              value={(editor?.getAttributes('textStyle').fontFamily as string) ?? ''}
            >
              <option value="">גופן</option>
              {fontFamilyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onToggleDictation}
              disabled={dictationState === 'unsupported'}
              className={`grid h-9 w-9 place-items-center rounded-md border transition ${
                dictationState === 'listening'
                  ? 'border-[#317d6e] bg-[#dff0e8] text-[#183c35]'
                  : dictationState === 'error'
                    ? 'border-[#e5c7c2] bg-white text-[#a34334]'
                    : 'border-[#d8d8cf] bg-white text-[#4e5b55] hover:border-[#317d6e] hover:text-[#183c35]'
              } disabled:cursor-not-allowed disabled:opacity-45`}
              aria-label={dictationState === 'listening' ? 'עצירת הכתבה קולית' : 'התחלת הכתבה קולית'}
              title={dictationMessage}
            >
              {dictationState === 'listening' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            {dictationState === 'listening' || dictationState === 'error' ? (
              <span className="max-w-28 truncate text-xs font-bold text-[#59665f]" title={dictationMessage}>
                {dictationMessage}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={buttonClass(isActive('bold'))}
              aria-label="מודגש"
              title="מודגש"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={buttonClass(isActive('italic'))}
              aria-label="נטוי"
              title="נטוי"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={buttonClass(isActive('underline'))}
              aria-label="קו תחתון"
              title="קו תחתון"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={buttonClass(isActive('strike'))}
              aria-label="קו חוצה"
              title="קו חוצה"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={buttonClass(false)}
              aria-label="יישור לימין"
              title="יישור לימין"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={buttonClass(false)}
              aria-label="יישור למרכז"
              title="יישור למרכז"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={buttonClass(false)}
              aria-label="יישור לשמאל"
              title="יישור לשמאל"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={buttonClass(isActive('bulletList'))}
              aria-label="רשימת תבליטים"
              title="רשימת תבליטים"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={buttonClass(isActive('orderedList'))}
              aria-label="רשימה ממוספרת"
              title="רשימה ממוספרת"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
              className={buttonClass(isActive('taskList'))}
              aria-label="רשימת משימות"
              title="רשימת משימות"
            >
              <CheckSquare className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
            <div className="flex items-center gap-1 rounded-md border border-[#d8d8cf] bg-white px-2 py-1" title="צבע טקסט">
              <Palette className="h-4 w-4 text-[#4e5b55]" />
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor?.chain().focus().setColor(color).run()}
                  className="h-5 w-5 rounded border border-black/10"
                  style={{ backgroundColor: color }}
                  aria-label={`צבע טקסט ${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-md border border-[#d8d8cf] bg-white px-2 py-1" title="צבע סימון">
              <Highlighter className="h-4 w-4 text-[#4e5b55]" />
              {highlightOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleHighlight({ color }).run()}
                  className="h-5 w-5 rounded border border-black/10"
                  style={{ backgroundColor: color }}
                  aria-label={`צבע סימון ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={buttonClass(isActive('blockquote'))}
              aria-label="ציטוט"
              title="ציטוט"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              className={buttonClass(false)}
              aria-label="קו מפריד"
              title="קו מפריד"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
