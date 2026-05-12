'use client'

import { type ClipboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Archive,
  Bold,
  CalendarDays,
  CheckSquare,
  Clock3,
  Download,
  FileText,
  Folder,
  Hash,
  Highlighter,
  Heart,
  Italic,
  List,
  ListOrdered,
  Menu,
  Minus,
  MoreHorizontal,
  Palette,
  PenLine,
  Plus,
  Quote,
  Redo2,
  Save,
  Search,
  Star,
  Strikethrough,
  Tag,
  Trash2,
  Underline,
  Undo2,
  Upload,
  X,
} from 'lucide-react'

type Note = {
  id: string
  title: string
  body: string
  bodyHtml?: string
  articleNotes?: ArticleNote[]
  tags: string[]
  folder: string
  favorite: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

type ArticleNote = {
  id: string
  text: string
  done: boolean
  createdAt: string
  updatedAt: string
}

type Filter = 'all' | 'recent' | 'favorites' | 'archive'
type ImportedBlock = { type: 'heading' | 'list' | 'paragraph'; text: string }
type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyRight'
  | 'justifyCenter'
  | 'justifyLeft'
  | 'formatBlock'
  | 'insertCheckbox'
  | 'insertHorizontalRule'
  | 'undo'
  | 'redo'

const storageKey = 'quiet-notes-workspace'
const dbName = 'sikumit-db'
const dbStore = 'notes'
const dbRecordKey = 'workspace'
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const textFormatActions: { icon: typeof Bold; label: string; command: EditorCommand }[] = [
  { icon: Bold, label: 'מודגש', command: 'bold' },
  { icon: Italic, label: 'נטוי', command: 'italic' },
  { icon: Underline, label: 'קו תחתון', command: 'underline' },
  { icon: Strikethrough, label: 'קו חוצה', command: 'strikeThrough' },
]

const paragraphActions: { icon: typeof List; label: string; command: EditorCommand }[] = [
  { icon: AlignRight, label: 'יישור לימין', command: 'justifyRight' },
  { icon: AlignCenter, label: 'יישור למרכז', command: 'justifyCenter' },
  { icon: AlignLeft, label: 'יישור לשמאל', command: 'justifyLeft' },
  { icon: List, label: 'רשימת תבליטים', command: 'insertUnorderedList' },
  { icon: ListOrdered, label: 'רשימה ממוספרת', command: 'insertOrderedList' },
  { icon: CheckSquare, label: 'צ׳קבוקס', command: 'insertCheckbox' },
]

const historyActions: { icon: typeof Undo2; label: string; command: EditorCommand }[] = [
  { icon: Undo2, label: 'ביטול', command: 'undo' },
  { icon: Redo2, label: 'ביצוע מחדש', command: 'redo' },
]

const styleOptions = [
  { label: 'טקסט רגיל', value: 'p' },
  { label: 'כותרת 1', value: 'h1' },
  { label: 'כותרת 2', value: 'h2' },
  { label: 'כותרת 3', value: 'h3' },
  { label: 'ציטוט', value: 'blockquote' },
]

const fontSizeOptions = [
  { label: '10', value: '1' },
  { label: '12', value: '2' },
  { label: '14', value: '3' },
  { label: '16', value: '4' },
  { label: '18', value: '5' },
  { label: '24', value: '6' },
  { label: '32', value: '7' },
]

const fontFamilyOptions = [
  { label: 'Heebo', value: 'Heebo, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'David', value: 'David, serif' },
  { label: 'Miriam', value: 'Miriam, sans-serif' },
  { label: 'Noto Sans Hebrew', value: '"Noto Sans Hebrew", Arial, sans-serif' },
]

const colorOptions = ['#17211b', '#1d4ed8', '#047857', '#b45309', '#be123c', '#6d28d9']
const highlightOptions = ['#fff7ad', '#dbeafe', '#dcfce7', '#ffedd5', '#fce7f3', '#ffffff']

const initialNotes: Note[] = [
  {
    id: 'n-1',
    title: 'סיכום שיעור: ארכיטקטורת מערכות',
    body:
      'שכבת הממשק אחראית על חוויה מהירה וברורה. שכבת השירות מרכזת לוגיקה עסקית, ושכבת הנתונים שומרת עקביות. נקודות פתוחות: לבדוק caching, הרשאות, וגבולות API.',
    tags: ['לימודים', 'מערכות'],
    folder: 'לימודים',
    favorite: true,
    archived: false,
    createdAt: '2026-05-08T09:30:00.000Z',
    updatedAt: '2026-05-11T08:45:00.000Z',
  },
  {
    id: 'n-2',
    title: 'רעיונות לפגישה עם הצוות',
    body:
      'להתחיל בסקירת סטטוס קצרה, לעבור לחסמים, ואז להחליט מי לוקח כל פעולה. לשמור מקום לשאלות ולסיים בהחלטות ברורות.',
    tags: ['עבודה', 'פגישות'],
    folder: 'עבודה',
    favorite: false,
    archived: false,
    createdAt: '2026-05-09T13:15:00.000Z',
    updatedAt: '2026-05-10T16:20:00.000Z',
  },
  {
    id: 'n-3',
    title: 'טיוטת סיכום קריאה',
    body:
      'המאמר מדגיש שכתיבה טובה מתחילה בשאלה טובה. כדאי לסמן טענות מרכזיות, דוגמאות, ונקודות שלא הסכמתי איתן.',
    tags: ['קריאה', 'סיכומים'],
    folder: 'אישי',
    favorite: false,
    archived: false,
    createdAt: '2026-05-07T18:00:00.000Z',
    updatedAt: '2026-05-09T19:10:00.000Z',
  },
]

const filters: { id: Filter; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'כל הפתקים', icon: FileText },
  { id: 'recent', label: 'אחרונים', icon: Clock3 },
  { id: 'favorites', label: 'מועדפים', icon: Star },
  { id: 'archive', label: 'ארכיון', icon: Archive },
]

function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))

  if (minutes < 60) return `עודכן לפני ${minutes} דק׳`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `עודכן לפני ${hours} שעות`
  const days = Math.round(hours / 24)
  if (days === 1) return 'עודכן אתמול'
  if (days < 7) return `עודכן לפני ${days} ימים`

  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(date)
}

function uniqueValues(notes: Note[], key: 'folder' | 'tags') {
  if (key === 'folder') return Array.from(new Set(notes.map((note) => note.folder))).sort()
  return Array.from(new Set(notes.flatMap((note) => note.tags))).sort()
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const normalizedQuery = query.trim()
  const index = text.toLowerCase().indexOf(normalizedQuery.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-[#dbeafe] px-0.5 text-[#0f172a]">{text.slice(index, index + normalizedQuery.length)}</mark>
      {text.slice(index + normalizedQuery.length)}
    </>
  )
}

function parseTagInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function plainTextToHtml(value: string) {
  const paragraphs = value.split(/\n{2,}/).map((paragraph) => paragraph.trim())
  return paragraphs
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeXml(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('') || '<p><br></p>'
}

function htmlToPlainText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.innerText || element.textContent || '').trim()
}

function cleanSearchHighlights(root: HTMLElement) {
  const highlights = Array.from(root.querySelectorAll('mark[data-search-highlight="true"]'))
  highlights.forEach((highlight) => {
    const text = document.createTextNode(highlight.textContent ?? '')
    highlight.replaceWith(text)
  })
  root.normalize()
}

function getCleanHtml(root: HTMLElement) {
  const clone = root.cloneNode(true) as HTMLElement
  cleanSearchHighlights(clone)
  return clone.innerHTML
}

function highlightFirstEditorMatch(root: HTMLElement, query: string) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return false

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()

  while (node) {
    const text = node.textContent ?? ''
    const index = text.toLowerCase().indexOf(normalizedQuery.toLowerCase())

    if (index !== -1) {
      const range = document.createRange()
      range.setStart(node, index)
      range.setEnd(node, index + normalizedQuery.length)

      const mark = document.createElement('mark')
      mark.dataset.searchHighlight = 'true'
      mark.className = 'sikumit-search-highlight'
      range.surroundContents(mark)
      window.setTimeout(() => mark.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80)
      return true
    }

    node = walker.nextNode()
  }

  return false
}

function blocksToPlainText(blocks: ImportedBlock[]) {
  return blocks
    .map((block) => (block.type === 'list' ? `- ${block.text}` : block.text))
    .join('\n\n')
    .trim()
}

function blocksToHtml(blocks: ImportedBlock[]) {
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

function noteHtml(note: Note) {
  return note.bodyHtml || plainTextToHtml(note.body)
}

function openNotesDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = () => {
      request.result.createObjectStore(dbStore)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function loadNotesFromDb() {
  const db = await openNotesDb()

  return new Promise<Note[] | null>((resolve, reject) => {
    const transaction = db.transaction(dbStore, 'readonly')
    const request = transaction.objectStore(dbStore).get(dbRecordKey)

    request.onsuccess = () => resolve((request.result as Note[] | undefined) ?? null)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => db.close()
  })
}

async function saveNotesToDb(notes: Note[]) {
  const db = await openNotesDb()

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(dbStore, 'readwrite')
    transaction.objectStore(dbStore).put(notes, dbRecordKey)
    transaction.oncomplete = () => {
      db.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function sanitizeFileName(value: string) {
  return (value || 'note').replace(/[\\/:*?"<>|]/g, '-').trim() || 'note'
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  }
  return crc >>> 0
})

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeUint16(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
}

function writeUint32(target: Uint8Array, offset: number, value: number) {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
  target[offset + 2] = (value >>> 16) & 0xff
  target[offset + 3] = (value >>> 24) & 0xff
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

function createZip(entries: { name: string; content: string }[]) {
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const name = textEncoder.encode(entry.name)
    const content = textEncoder.encode(entry.content)
    const crc = crc32(content)
    const local = new Uint8Array(30 + name.length + content.length)

    writeUint32(local, 0, 0x04034b50)
    writeUint16(local, 4, 20)
    writeUint16(local, 6, 0x0800)
    writeUint16(local, 8, 0)
    writeUint16(local, 10, 0)
    writeUint16(local, 12, 0)
    writeUint32(local, 14, crc)
    writeUint32(local, 18, content.length)
    writeUint32(local, 22, content.length)
    writeUint16(local, 26, name.length)
    writeUint16(local, 28, 0)
    local.set(name, 30)
    local.set(content, 30 + name.length)
    localParts.push(local)

    const central = new Uint8Array(46 + name.length)
    writeUint32(central, 0, 0x02014b50)
    writeUint16(central, 4, 20)
    writeUint16(central, 6, 20)
    writeUint16(central, 8, 0x0800)
    writeUint16(central, 10, 0)
    writeUint16(central, 12, 0)
    writeUint16(central, 14, 0)
    writeUint32(central, 16, crc)
    writeUint32(central, 20, content.length)
    writeUint32(central, 24, content.length)
    writeUint16(central, 28, name.length)
    writeUint16(central, 30, 0)
    writeUint16(central, 32, 0)
    writeUint16(central, 34, 0)
    writeUint16(central, 36, 0)
    writeUint32(central, 38, 0)
    writeUint32(central, 42, offset)
    central.set(name, 46)
    centralParts.push(central)

    offset += local.length
  }

  const centralDirectory = concatBytes(centralParts)
  const end = new Uint8Array(22)
  writeUint32(end, 0, 0x06054b50)
  writeUint16(end, 8, entries.length)
  writeUint16(end, 10, entries.length)
  writeUint32(end, 12, centralDirectory.length)
  writeUint32(end, 16, offset)

  return concatBytes([...localParts, centralDirectory, end])
}

function createDocxParagraph(text: string, style?: string) {
  const styleXml = style ? `<w:pStyle w:val="${style}"/>` : ''
  const paragraphProps = [
    styleXml,
    '<w:bidi/>',
    '<w:jc w:val="right"/>',
    '<w:spacing w:before="0" w:after="80" w:line="252" w:lineRule="auto"/>',
  ].join('')
  const runProps = [
    '<w:rFonts w:ascii="Heebo" w:hAnsi="Heebo" w:cs="Heebo"/>',
    '<w:sz w:val="22"/>',
    '<w:szCs w:val="22"/>',
    '<w:rtl/>',
    '<w:lang w:val="he-IL" w:bidi="he-IL"/>',
    '<w:noProof/>',
  ].join('')

  return `<w:p><w:pPr>${paragraphProps}</w:pPr><w:r><w:rPr>${runProps}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function htmlToDocxParagraphs(html: string) {
  const root = document.createElement('div')
  root.innerHTML = html
  const paragraphs: string[] = []

  const visit = (node: Element) => {
    const tag = node.tagName.toLowerCase()
    const text = (node.textContent || '').trim()
    if (!text) return

    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      paragraphs.push(createDocxParagraph(text, 'Heading1'))
      return
    }
    if (tag === 'li') {
      paragraphs.push(createDocxParagraph(`• ${text}`, 'ListParagraph'))
      return
    }
    if (tag === 'p' || tag === 'div') {
      paragraphs.push(createDocxParagraph(text))
      return
    }

    Array.from(node.children).forEach(visit)
  }

  Array.from(root.children).forEach(visit)
  return paragraphs.length > 0 ? paragraphs.join('') : createDocxParagraph(htmlToPlainText(html))
}

function createDocumentXml(note: Note) {
  const paragraphs = htmlToDocxParagraphs(noteHtml(note))

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:xml="http://www.w3.org/XML/1998/namespace">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Title"/><w:bidi/><w:jc w:val="right"/><w:spacing w:before="0" w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Heebo" w:hAnsi="Heebo" w:cs="Heebo"/><w:sz w:val="32"/><w:szCs w:val="32"/><w:b/><w:bCs/><w:rtl/><w:lang w:val="he-IL" w:bidi="he-IL"/><w:noProof/></w:rPr><w:t xml:space="preserve">${escapeXml(note.title)}</w:t></w:r></w:p>
    ${paragraphs}
    <w:sectPr><w:bidi/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr>
  </w:body>
</w:document>`
}

function createSettingsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  <w:displayBackgroundShape/>
  <w:proofState w:spelling="clean" w:grammar="clean"/>
  <w:hideSpellingErrors/>
  <w:hideGrammaticalErrors/>
  <w:themeFontLang w:val="he-IL" w:bidi="he-IL"/>
</w:settings>`
}

function createDocxBlob(note: Note) {
  const now = new Date().toISOString()
  const entries = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: 'word/_rels/document.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`,
    },
    {
      name: 'docProps/core.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(note.title)}</dc:title>
  <dc:creator>סיכומית</dc:creator>
  <cp:lastModifiedBy>סיכומית</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: 'docProps/app.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>סיכומית</Application></Properties>`,
    },
    {
      name: 'word/document.xml',
      content: createDocumentXml(note),
    },
    {
      name: 'word/settings.xml',
      content: createSettingsXml(),
    },
  ]

  return new Blob([toArrayBuffer(createZip(entries))], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

function getUint16(view: DataView, offset: number) {
  return view.getUint16(offset, true)
}

function getUint32(view: DataView, offset: number) {
  return view.getUint32(offset, true)
}

async function inflateRaw(bytes: Uint8Array) {
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function readZipEntry(buffer: ArrayBuffer, targetName: string) {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  let endOffset = -1

  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 66000); index -= 1) {
    if (getUint32(view, index) === 0x06054b50) {
      endOffset = index
      break
    }
  }

  if (endOffset === -1) throw new Error('לא נמצא מבנה DOCX תקין')

  const entryCount = getUint16(view, endOffset + 10)
  const centralOffset = getUint32(view, endOffset + 16)
  let cursor = centralOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (getUint32(view, cursor) !== 0x02014b50) throw new Error('קובץ DOCX לא תקין')

    const method = getUint16(view, cursor + 10)
    const compressedSize = getUint32(view, cursor + 20)
    const fileNameLength = getUint16(view, cursor + 28)
    const extraLength = getUint16(view, cursor + 30)
    const commentLength = getUint16(view, cursor + 32)
    const localOffset = getUint32(view, cursor + 42)
    const name = textDecoder.decode(bytes.slice(cursor + 46, cursor + 46 + fileNameLength))

    if (name === targetName) {
      const localNameLength = getUint16(view, localOffset + 26)
      const localExtraLength = getUint16(view, localOffset + 28)
      const dataOffset = localOffset + 30 + localNameLength + localExtraLength
      const compressed = bytes.slice(dataOffset, dataOffset + compressedSize)

      if (method === 0) return textDecoder.decode(compressed)
      if (method === 8) return textDecoder.decode(await inflateRaw(compressed))
      throw new Error('סוג דחיסה לא נתמך בקובץ Word')
    }

    cursor += 46 + fileNameLength + extraLength + commentLength
  }

  throw new Error('לא נמצא תוכן Word בקובץ')
}

function extractBlocksFromDocumentXml(xmlText: string) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml')
  const paragraphs = Array.from(xml.getElementsByTagNameNS('*', 'p'))

  return paragraphs
    .map((paragraph): ImportedBlock | null => {
      const text = Array.from(paragraph.getElementsByTagNameNS('*', 't'))
        .map((node) => node.textContent ?? '')
        .join('')
        .trim()

      if (!text) return null

      const style = paragraph.getElementsByTagNameNS('*', 'pStyle')[0]?.getAttribute('w:val') ?? ''
      const hasNumbering = paragraph.getElementsByTagNameNS('*', 'numPr').length > 0
      const isHeading = /heading|title|כותר/i.test(style)
      const isList = hasNumbering || /list|bullet/i.test(style)

      return {
        type: isHeading ? 'heading' : isList ? 'list' : 'paragraph',
        text,
      }
    })
    .filter((block): block is ImportedBlock => Boolean(block))
}

export function NotesWorkspace() {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [activeId, setActiveId] = useState(initialNotes[0].id)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [articleNotebookOpen, setArticleNotebookOpen] = useState(false)
  const [articleNoteDraft, setArticleNoteDraft] = useState('')
  const [saveState, setSaveState] = useState<'ready' | 'saving' | 'saved'>('ready')
  const [fileStatus, setFileStatus] = useState('')
  const [formatToolbarOpen, setFormatToolbarOpen] = useState(true)
  const [offlineStatus, setOfflineStatus] = useState('מכין מצב אופליין...')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const loadedEditorId = useRef<string | null>(null)
  const renderedSearchQuery = useRef('')

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const indexedNotes = await loadNotesFromDb()
        if (indexedNotes?.length) {
          window.setTimeout(() => {
            setNotes(indexedNotes)
            setActiveId(indexedNotes[0].id)
          }, 0)
          return
        }

        const saved = window.localStorage.getItem(storageKey)
        if (!saved) return

        const parsed = JSON.parse(saved) as Note[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveNotesToDb(parsed)
          window.localStorage.removeItem(storageKey)
          window.setTimeout(() => {
            setNotes(parsed)
            setActiveId(parsed[0].id)
          }, 0)
        }
      } catch {
        window.localStorage.removeItem(storageKey)
      }
    }

    void loadNotes()
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveNotesToDb(notes)
        .then(() => {
          window.localStorage.removeItem(storageKey)
          setSaveState('saved')
        })
        .catch(() => setSaveState('ready'))
    }, 280)

    return () => window.clearTimeout(timeout)
  }, [notes])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      window.setTimeout(() => setOfflineStatus('מצב אופליין לא נתמך בדפדפן הזה'), 0)
      return
    }

    const registerOfflineMode = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sikumit/sw.js', {
          scope: '/sikumit/',
          updateViaCache: 'none',
        })
        await navigator.serviceWorker.ready
        registration.update().catch(() => undefined)
        setOfflineStatus('זמין אופליין אחרי ביקור ראשון')
      } catch {
        setOfflineStatus('לא הצלחתי להכין מצב אופליין')
      }
    }

    void registerOfflineMode()
  }, [])

  const activeNote = notes.find((note) => note.id === activeId) ?? notes[0]
  const activeArticleNotes = activeNote?.articleNotes ?? []
  const activeArticleNotesCount = activeArticleNotes.filter((articleNote) => !articleNote.done).length
  const folders = useMemo(() => uniqueValues(notes, 'folder'), [notes])
  const tags = useMemo(() => uniqueValues(notes, 'tags'), [notes])

  useEffect(() => {
    if (!editorRef.current || !activeNote) return
    const normalizedQuery = query.trim()
    const shouldRender = loadedEditorId.current !== activeNote.id || renderedSearchQuery.current !== normalizedQuery
    if (!shouldRender) return

    editorRef.current.innerHTML = noteHtml(activeNote)
    if (normalizedQuery) highlightFirstEditorMatch(editorRef.current, normalizedQuery)
    loadedEditorId.current = activeNote.id
    renderedSearchQuery.current = normalizedQuery
  }, [activeId, activeNote, notes, query])

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return notes
      .filter((note) => {
        if (activeFilter === 'archive' && !note.archived) return false
        if (activeFilter !== 'archive' && note.archived) return false
        if (activeFilter === 'favorites' && !note.favorite) return false
        if (activeTag && !note.tags.includes(activeTag)) return false
        if (activeFolder && note.folder !== activeFolder) return false

        if (!normalizedQuery) return true
        const searchable = [
          note.title,
          note.body,
          note.folder,
          ...note.tags,
          ...(note.articleNotes ?? []).map((articleNote) => articleNote.text),
        ]
          .join(' ')
          .toLowerCase()
        return searchable.includes(normalizedQuery)
      })
      .sort((a, b) => {
        if (activeFilter === 'recent') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [activeFilter, activeFolder, activeTag, notes, query])

  function updateNote(patch: Partial<Note>) {
    if (!activeNote) return

    setSaveState('saving')
    setNotes((current) =>
      current.map((note) =>
        note.id === activeNote.id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note,
      ),
    )
  }

  function updateEditorContent() {
    if (!editorRef.current) return
    const bodyHtml = getCleanHtml(editorRef.current)
    updateNote({ bodyHtml, body: htmlToPlainText(bodyHtml) })
  }

  function updateArticleNotes(articleNotes: ArticleNote[]) {
    updateNote({ articleNotes })
  }

  function addArticleNote() {
    const text = articleNoteDraft.trim()
    if (!text) return

    const now = new Date().toISOString()
    const articleNote: ArticleNote = {
      id: `an-${crypto.randomUUID()}`,
      text,
      done: false,
      createdAt: now,
      updatedAt: now,
    }

    updateArticleNotes([articleNote, ...activeArticleNotes])
    setArticleNoteDraft('')
  }

  function toggleArticleNote(id: string) {
    const now = new Date().toISOString()
    updateArticleNotes(
      activeArticleNotes.map((articleNote) =>
        articleNote.id === id ? { ...articleNote, done: !articleNote.done, updatedAt: now } : articleNote,
      ),
    )
  }

  function deleteArticleNote(id: string) {
    if (!window.confirm('למחוק את ההערה הזו?')) return

    updateArticleNotes(activeArticleNotes.filter((articleNote) => articleNote.id !== id))
  }

  function runEditorCommand(command: EditorCommand) {
    editorRef.current?.focus()

    if (command === 'insertCheckbox') {
      document.execCommand('insertHTML', false, '<p>☐ </p>')
    } else if (command === 'insertHorizontalRule') {
      document.execCommand('insertHorizontalRule')
    } else {
      document.execCommand(command)
    }

    updateEditorContent()
  }

  function applyBlockStyle(value: string) {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, value)
    updateEditorContent()
  }

  function applyFontSize(value: string) {
    editorRef.current?.focus()
    document.execCommand('fontSize', false, value)
    updateEditorContent()
  }

  function applyFontFamily(value: string) {
    editorRef.current?.focus()
    document.execCommand('fontName', false, value)
    updateEditorContent()
  }

  function applyColor(command: 'foreColor' | 'hiliteColor' | 'backColor', value: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    updateEditorContent()
  }

  function insertQuote() {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, 'blockquote')
    updateEditorContent()
  }

  function handleEditorPaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    if (!text) return

    editorRef.current?.focus()
    document.execCommand('insertText', false, text)
    updateEditorContent()
  }

  function createNote() {
    const now = new Date().toISOString()
    const note: Note = {
      id: `n-${crypto.randomUUID()}`,
      title: query.trim() || 'פתק חדש',
      body: '',
      bodyHtml: '<p><br></p>',
      articleNotes: [],
      tags: activeTag ? [activeTag] : ['כללי'],
      folder: activeFolder || 'כללי',
      favorite: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }

    setSaveState('saving')
    setNotes((current) => [note, ...current])
    setActiveId(note.id)
    setArticleNoteDraft('')
    setActiveFilter('all')
    setSidebarOpen(false)
  }

  function deleteNote(id: string) {
    if (!window.confirm('למחוק את הפתק הזה?')) return

    setSaveState('saving')
    setNotes((current) => {
      const next = current.filter((note) => note.id !== id)
      if (activeId === id) setActiveId(next[0]?.id ?? '')
      return next
    })
  }

  async function importWordFile(file: File) {
    setFileStatus('מייבא קובץ Word...')

    try {
      const xml = await readZipEntry(await file.arrayBuffer(), 'word/document.xml')
      const blocks = extractBlocksFromDocumentXml(xml)
      const [firstLine, ...rest] = blocks
      const now = new Date().toISOString()
      const title = firstLine?.text.trim() || file.name.replace(/\.docx$/i, '')
      const bodyBlocks = rest.length > 0 ? rest : blocks
      const bodyHtml = blocksToHtml(bodyBlocks)
      const note: Note = {
        id: `n-${crypto.randomUUID()}`,
        title,
        body: blocksToPlainText(bodyBlocks),
        bodyHtml,
        articleNotes: [],
        tags: ['Word'],
        folder: 'מיובאים',
        favorite: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      }

      setSaveState('saving')
      setNotes((current) => [note, ...current])
      setActiveId(note.id)
      setArticleNoteDraft('')
      setActiveFilter('all')
      setFileStatus('קובץ Word יובא לפתק חדש')
    } catch (error) {
      setFileStatus(error instanceof Error ? error.message : 'לא הצלחתי לייבא את הקובץ')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function exportActiveNote() {
    if (!activeNote) return

    const blob = createDocxBlob(activeNote)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizeFileName(activeNote.title)}.docx`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setFileStatus('הפתק יוצא לקובץ Word')
  }

  const wordCount = activeNote?.body.split(/\s+/).filter(Boolean).length ?? 0
  const emptySearch = query.trim() && filteredNotes.length === 0

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#17211b]">
      <div className="min-h-screen pr-16">
        <nav className="fixed inset-y-0 right-0 z-50 flex w-16 flex-col items-center gap-2 border-l border-[#deded4] bg-[#fbfbf6] px-2 py-3 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-md bg-[#183c35] text-white transition hover:bg-[#225246]"
            aria-label="פתיחת סיידבר"
            title="סיידבר"
          >
            <PenLine className="h-5 w-5" />
          </button>

          <div className="my-2 h-px w-9 bg-[#deded4]" />

          <button
            type="button"
            onClick={createNote}
            className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
            aria-label="פתק חדש"
            title="פתק חדש"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
            aria-label="ייבוא Word"
            title="ייבוא Word"
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={exportActiveNote}
            disabled={!activeNote}
            className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="ייצוא Word"
            title="ייצוא Word"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
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
                onClick={() => setActiveFilter(filter.id)}
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
              onClick={() => setSidebarOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-md text-[#44514c] transition hover:bg-[#e5efe9] hover:text-[#183c35]"
              aria-label="פתיחה וסגירה"
              title="פתיחה וסגירה"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>

        <aside
          className={`fixed inset-y-0 right-16 z-40 w-[292px] border-l border-[#deded4] bg-[#fbfbf6] shadow-xl transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
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
                onClick={() => setSidebarOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md text-[#58655f] hover:bg-[#ecece4]"
                aria-label="סגירת תפריט"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto px-4 py-4">
              <button
                type="button"
                onClick={createNote}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#225246]"
              >
                <Plus className="h-4 w-4" />
                פתק חדש
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 text-sm font-bold text-[#44514c] transition hover:border-[#317d6e]"
                >
                  <Upload className="h-4 w-4" />
                  ייבוא Word
                </button>
                <button
                  type="button"
                  onClick={exportActiveNote}
                  disabled={!activeNote}
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
                  if (file) void importWordFile(file)
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
                  onChange={(event) => setQuery(event.target.value)}
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
                      onClick={() => {
                        setActiveFilter(filter.id)
                        setSidebarOpen(false)
                      }}
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
                      onClick={() => setActiveFolder(activeFolder === folder ? null : folder)}
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
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
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

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="סגירת תפריט"
            className="fixed inset-0 z-30 bg-black/10"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <section className="flex min-w-0 flex-1 flex-col lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
          <header className="flex h-16 items-center justify-between border-b border-[#deded4] bg-[#f7f7f2]/92 px-4 backdrop-blur lg:col-span-2 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
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

            <div className="flex items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm font-bold text-[#53625c]">
              <Save className="h-4 w-4 text-[#317d6e]" />
              {saveState === 'saving' ? 'שומר...' : 'נשמר'}
            </div>
            <div className="hidden items-center rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-xs font-bold text-[#53625c] md:flex">
              {offlineStatus}
            </div>
          </header>

          <div className="min-h-0 border-l border-[#deded4] bg-[#f1f1ea] lg:h-[calc(100vh-4rem)]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#deded4] px-4 py-3">
                <div>
                  <p className="text-sm font-black text-[#27352f]">{filteredNotes.length} פתקים</p>
                  <p className="text-xs font-semibold text-[#738078]">
                    {activeTag ? `תגית: ${activeTag}` : activeFolder ? `נושא: ${activeFolder}` : 'תצוגת עבודה'}
                  </p>
                </div>
                {(activeTag || activeFolder || query) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTag(null)
                      setActiveFolder(null)
                      setQuery('')
                    }}
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
                      onClick={createNote}
                      className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      יצירת פתק
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotes.map((note) => {
                      const selected = note.id === activeNote?.id
                      const preview = note.body || 'אין תוכן עדיין'

                      return (
                        <button
                          key={note.id}
                          type="button"
                          onClick={() => {
                            setActiveId(note.id)
                            setArticleNoteDraft('')
                            setSidebarOpen(false)
                          }}
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

          <article className="relative min-h-0 bg-[#fcfcf8] lg:h-[calc(100vh-4rem)]">
            {activeNote ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-[#deded4] px-5 py-4 lg:px-8">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormatToolbarOpen((open) => !open)}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 text-sm font-bold text-[#44514c] transition hover:border-[#317d6e] hover:text-[#183c35]"
                        aria-expanded={formatToolbarOpen}
                        aria-label={formatToolbarOpen ? 'הסתרת סרגל עריכה' : 'הצגת סרגל עריכה'}
                        title={formatToolbarOpen ? 'הסתרת סרגל עריכה' : 'הצגת סרגל עריכה'}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        {formatToolbarOpen ? 'הסתר סרגל' : 'הצג סרגל'}
                      </button>

                      {formatToolbarOpen ? (
                        <div className="sikumit-ribbon flex flex-wrap items-center gap-2 rounded-md border border-[#deded4] bg-[#f6f6ef] p-2">
                      <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
                        {historyActions.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => runEditorCommand(item.command)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#4e5b55] transition hover:border-[#317d6e] hover:text-[#183c35]"
                              aria-label={item.label}
                              title={item.label}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-2 border-l border-[#d8d8cf] pl-2">
                        <select
                          aria-label="סגנון פסקה"
                          onChange={(event) => applyBlockStyle(event.target.value)}
                          className="h-9 rounded-md border border-[#d8d8cf] bg-white px-2 text-sm font-bold text-[#44514c] outline-none"
                          defaultValue="p"
                        >
                          {styleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="גודל טקסט"
                          onChange={(event) => applyFontSize(event.target.value)}
                          className="h-9 w-16 rounded-md border border-[#d8d8cf] bg-white px-2 text-sm font-bold text-[#44514c] outline-none"
                          defaultValue="4"
                        >
                          {fontSizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="גופן"
                          onChange={(event) => applyFontFamily(event.target.value)}
                          className="h-9 rounded-md border border-[#d8d8cf] bg-white px-2 text-sm font-bold text-[#44514c] outline-none"
                          defaultValue={fontFamilyOptions[0].value}
                        >
                          {fontFamilyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
                        {textFormatActions.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => runEditorCommand(item.command)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#4e5b55] transition hover:border-[#317d6e] hover:text-[#183c35]"
                              aria-label={item.label}
                              title={item.label}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
                        {paragraphActions.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => runEditorCommand(item.command)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#4e5b55] transition hover:border-[#317d6e] hover:text-[#183c35]"
                              aria-label={item.label}
                              title={item.label}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-1 border-l border-[#d8d8cf] pl-2">
                        <div className="flex items-center gap-1 rounded-md border border-[#d8d8cf] bg-white px-2 py-1" title="צבע טקסט">
                          <Palette className="h-4 w-4 text-[#4e5b55]" />
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => applyColor('foreColor', color)}
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
                              onClick={() => applyColor('hiliteColor', color)}
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
                          onClick={insertQuote}
                          className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#4e5b55] transition hover:border-[#317d6e] hover:text-[#183c35]"
                          aria-label="ציטוט"
                          title="ציטוט"
                        >
                          <Quote className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => runEditorCommand('insertHorizontalRule')}
                          className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#4e5b55] transition hover:border-[#317d6e] hover:text-[#183c35]"
                          aria-label="קו מפריד"
                          title="קו מפריד"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateNote({ favorite: !activeNote.favorite })}
                        className={`grid h-9 w-9 place-items-center rounded-md border transition ${
                          activeNote.favorite
                            ? 'border-[#e2bd62] bg-[#fff4d6] text-[#9f690b]'
                            : 'border-[#d8d8cf] bg-white text-[#59665f] hover:border-[#c7a44b]'
                        }`}
                        aria-label="סימון מועדף"
                        title="מועדף"
                      >
                        <Heart className={`h-4 w-4 ${activeNote.favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateNote({ archived: !activeNote.archived })}
                        className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#59665f] transition hover:border-[#317d6e]"
                        aria-label="ארכוב"
                        title="ארכוב"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNote(activeNote.id)}
                        className="grid h-9 w-9 place-items-center rounded-md border border-[#e5c7c2] bg-white text-[#a34334] transition hover:bg-[#fff0ed]"
                        aria-label="מחיקה"
                        title="מחיקה"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8cf] bg-white text-[#59665f]"
                        aria-label="עוד"
                        title="עוד"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <input
                    value={activeNote.title}
                    onChange={(event) => updateNote({ title: event.target.value })}
                    className="w-full bg-transparent text-3xl font-black leading-tight text-[#17211b] outline-none placeholder:text-[#a2aaa5] sm:text-4xl"
                    placeholder="כותרת הפתק"
                  />

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
                    <label className="flex items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm font-semibold text-[#53625c]">
                      <Folder className="h-4 w-4 text-[#317d6e]" />
                      <input
                        value={activeNote.folder}
                        onChange={(event) => updateNote({ folder: event.target.value || 'כללי' })}
                        className="min-w-0 flex-1 bg-transparent outline-none"
                        placeholder="נושא"
                      />
                    </label>
                    <label className="flex items-center gap-2 rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm font-semibold text-[#53625c]">
                      <Tag className="h-4 w-4 text-[#317d6e]" />
                      <input
                        value={activeNote.tags.join(', ')}
                        onChange={(event) => updateNote({ tags: parseTagInput(event.target.value) })}
                        className="min-w-0 flex-1 bg-transparent outline-none"
                        placeholder="תגיות"
                      />
                    </label>
                  </div>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  spellCheck={false}
                  suppressContentEditableWarning
                  role="textbox"
                  aria-label="תוכן הפתק"
                  onInput={updateEditorContent}
                  onBlur={updateEditorContent}
                  onPaste={handleEditorPaste}
                  className="sikumit-editor min-h-[420px] flex-1 overflow-y-auto bg-[#fcfcf8] px-5 py-6 text-lg leading-9 text-[#24302a] outline-none empty:before:text-[#9ba49f] empty:before:content-['להתחיל_לכתוב...'] lg:px-8"
                />

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#deded4] px-5 py-3 text-xs font-bold text-[#6a766f] lg:px-8">
                  <span>{wordCount} מילים</span>
                  <span>{activeNote.tags.length} תגיות</span>
                  <span>{formatRelativeDate(activeNote.updatedAt)}</span>
                </footer>

                <button
                  type="button"
                  onClick={() => setArticleNotebookOpen(true)}
                  className="fixed bottom-6 left-5 z-20 grid h-14 w-14 place-items-center rounded-full border border-[#c7d8d0] bg-[#183c35] text-white shadow-lg shadow-black/15 transition hover:bg-[#225246] sm:left-6"
                  aria-label="פתיחת פנקס מאמר"
                  title="פנקס מאמר"
                >
                  <FileText className="h-5 w-5" />
                  {activeArticleNotesCount > 0 ? (
                    <span className="absolute -right-1 -top-1 grid min-h-6 min-w-6 place-items-center rounded-full border border-[#183c35] bg-white px-1.5 text-xs font-black text-[#183c35]">
                      {activeArticleNotesCount}
                    </span>
                  ) : null}
                </button>

                {articleNotebookOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="סגירת פנקס מאמר"
                      className="fixed inset-0 z-30 bg-black/10"
                      onClick={() => setArticleNotebookOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-40 flex w-[calc(100%-1.25rem)] max-w-[390px] flex-col border-r border-[#deded4] bg-[#fbfbf6] shadow-2xl sm:w-[380px]">
                      <div className="flex h-16 items-center justify-between border-b border-[#deded4] px-4">
                        <div>
                          <p className="text-lg font-black text-[#17211b]">פנקס מאמר</p>
                          <p className="text-xs font-bold text-[#6b7771]">{activeArticleNotesCount} הערות פעילות</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setArticleNotebookOpen(false)}
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
                            value={articleNoteDraft}
                            onChange={(event) => setArticleNoteDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') addArticleNote()
                            }}
                            rows={4}
                            className="w-full resize-none rounded-md border border-[#d8d8cf] bg-white px-3 py-2 text-sm leading-6 text-[#24302a] outline-none transition placeholder:text-[#929d97] focus:border-[#317d6e] focus:ring-2 focus:ring-[#317d6e]/15"
                            placeholder="שאלה, רעיון, מקור לבדיקה..."
                          />
                        </label>
                        <button
                          type="button"
                          onClick={addArticleNote}
                          disabled={!articleNoteDraft.trim()}
                          className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white transition hover:bg-[#225246] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Plus className="h-4 w-4" />
                          הוספת הערה
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4">
                        {activeArticleNotes.length === 0 ? (
                          <div className="mt-8 text-center">
                            <FileText className="mx-auto mb-3 h-8 w-8 text-[#87918b]" />
                            <p className="font-black text-[#27352f]">אין הערות בפנקס</p>
                            <p className="mt-2 text-sm leading-6 text-[#68756f]">
                              הערות שתוסיף כאן יישמרו רק עם המאמר הזה.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {activeArticleNotes.map((articleNote) => (
                              <div
                                key={articleNote.id}
                                className={`rounded-md border bg-white p-3 transition ${
                                  articleNote.done ? 'border-[#d8d8cf] opacity-70' : 'border-[#c7d8d0]'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleArticleNote(articleNote.id)}
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
                                    onClick={() => deleteArticleNote(articleNote.id)}
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
                ) : null}
              </div>
            ) : (
              <div className="grid h-full min-h-[520px] place-items-center px-5 text-center">
                <div>
                  <FileText className="mx-auto mb-4 h-10 w-10 text-[#87918b]" />
                  <p className="text-xl font-black">אין פתק פתוח</p>
                  <button
                    type="button"
                    onClick={createNote}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#183c35] px-4 text-sm font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    פתק חדש
                  </button>
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}
