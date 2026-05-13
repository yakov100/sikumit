import { sanitizeHtml } from '../security/sanitize'
import type { ImportedBlock, Note } from '../types'

export function uniqueValues(notes: Note[], key: 'folder' | 'tags') {
  if (key === 'folder') return Array.from(new Set(notes.map((note) => note.folder))).sort()
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort()
}

export function parseTagInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function sanitizeFileName(value: string) {
  return (value || 'note').replace(/[\\/:*?"<>|]/g, '-').trim() || 'note'
}

export function plainTextToHtml(value: string) {
  const paragraphs = value.split(/\n{2,}/).map((paragraph) => paragraph.trim())
  return (
    paragraphs
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeXml(paragraph).replaceAll('\n', '<br>')}</p>`)
      .join('') || '<p><br></p>'
  )
}

export function htmlToPlainText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.innerText || element.textContent || '').trim()
}

export function blocksToPlainText(blocks: ImportedBlock[]) {
  return blocks
    .map((block) => (block.type === 'list' ? `- ${block.text}` : block.text))
    .join('\n\n')
    .trim()
}

export function blocksToHtml(blocks: ImportedBlock[]) {
  const htmlParts: string[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return
    htmlParts.push(`<ul>${listItems.map((item) => `<li>${escapeXml(item)}</li>`).join('')}</ul>`)
    listItems = []
  }

  for (const block of blocks) {
    if (block.type === 'list') {
      listItems.push(block.text)
      continue
    }

    flushList()
    if (block.type === 'heading') {
      htmlParts.push(`<h2>${escapeXml(block.text)}</h2>`)
    } else {
      htmlParts.push(`<p>${escapeXml(block.text)}</p>`)
    }
  }

  flushList()
  return htmlParts.join('') || '<p><br></p>'
}

export function noteHtml(note: Note) {
  return sanitizeHtml(note.bodyHtml || plainTextToHtml(note.body))
}

export function maxUpdatedAt(notes: Note[]): number {
  return notes.reduce((max, note) => Math.max(max, new Date(note.updatedAt).getTime()), 0)
}
