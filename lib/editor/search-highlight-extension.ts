import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const searchKey = new PluginKey<string>('searchHighlight')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchHighlight: {
      setSearchQuery: (query: string) => ReturnType
    }
  }
}

function buildDecorations(doc: import('@tiptap/pm/model').Node, query: string) {
  if (!query) return DecorationSet.empty
  const normalized = query.trim().toLowerCase()
  if (!normalized) return DecorationSet.empty

  const decorations: Decoration[] = []
  doc.descendants((node, position) => {
    if (!node.isText || !node.text) return
    const text = node.text.toLowerCase()
    let from = 0
    while (true) {
      const index = text.indexOf(normalized, from)
      if (index === -1) break
      decorations.push(
        Decoration.inline(position + index, position + index + normalized.length, {
          class: 'sikumit-search-highlight',
        }),
      )
      from = index + normalized.length
    }
  })

  return DecorationSet.create(doc, decorations)
}

export const SearchHighlight = Extension.create({
  name: 'searchHighlight',

  addCommands() {
    return {
      setSearchQuery:
        (query: string) =>
        ({ view, dispatch }) => {
          if (dispatch) {
            const tr = view.state.tr.setMeta(searchKey, query)
            dispatch(tr)
          }
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: searchKey,
        state: {
          init: () => ({ query: '', decorations: DecorationSet.empty }),
          apply(tr, value) {
            const meta = tr.getMeta(searchKey)
            if (typeof meta === 'string') {
              return { query: meta, decorations: buildDecorations(tr.doc, meta) }
            }
            if (tr.docChanged) {
              return { query: value.query, decorations: buildDecorations(tr.doc, value.query) }
            }
            return value
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations
          },
        },
      }),
    ]
  },
})
