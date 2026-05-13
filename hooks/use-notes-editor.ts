'use client'

import { useEditor, type Editor } from '@tiptap/react'
import CharacterCount from '@tiptap/extension-character-count'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { FontSize } from '../lib/editor/font-size-extension'
import { SearchHighlight } from '../lib/editor/search-highlight-extension'
import { sanitizeHtml } from '../lib/security/sanitize'

export type NotesEditorOptions = {
  initialContent: string
  onUpdateHtml: (html: string) => void
  searchQuery: string
}

export function useNotesEditor({ initialContent, onUpdateHtml, searchQuery }: NotesEditorOptions): Editor | null {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'להתחיל לכתוב...' }),
      CharacterCount,
      SearchHighlight,
    ],
    content: sanitizeHtml(initialContent) || '<p></p>',
    immediatelyRender: false,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'sikumit-editor min-h-[420px] outline-none',
        dir: 'rtl',
      },
      transformPastedHTML: (html) => sanitizeHtml(html),
    },
    onUpdate: ({ editor: instance }) => {
      onUpdateHtml(sanitizeHtml(instance.getHTML()))
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.commands.setSearchQuery(searchQuery)
  }, [editor, searchQuery])

  return editor
}
