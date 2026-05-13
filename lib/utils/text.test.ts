import { describe, expect, it } from 'vitest'
import {
  blocksToHtml,
  blocksToPlainText,
  escapeXml,
  maxUpdatedAt,
  parseTagInput,
  plainTextToHtml,
  sanitizeFileName,
  uniqueValues,
} from './text'
import type { Note } from '../types'

const sampleNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'n-1',
  title: 't',
  body: '',
  tags: ['a', 'b'],
  folder: 'general',
  favorite: false,
  archived: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...overrides,
})

describe('parseTagInput', () => {
  it('splits comma-separated tags and trims', () => {
    expect(parseTagInput('  one ,two,   three  ')).toEqual(['one', 'two', 'three'])
  })

  it('drops empty entries', () => {
    expect(parseTagInput(',,a,,b,,')).toEqual(['a', 'b'])
  })
})

describe('escapeXml', () => {
  it('escapes the five entities', () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&apos;f')
  })
})

describe('sanitizeFileName', () => {
  it('removes path separators and invalid chars', () => {
    expect(sanitizeFileName('a/b\\c:d*e?f"g<h>i|j')).toBe('a-b-c-d-e-f-g-h-i-j')
  })

  it('falls back to "note" for empty strings', () => {
    expect(sanitizeFileName('')).toBe('note')
    expect(sanitizeFileName('   ')).toBe('note')
  })
})

describe('plainTextToHtml', () => {
  it('wraps paragraphs and turns newlines into <br>', () => {
    const result = plainTextToHtml('line 1\nline 2\n\nparagraph 2')
    expect(result).toContain('<p>line 1<br>line 2</p>')
    expect(result).toContain('<p>paragraph 2</p>')
  })

  it('returns <p><br></p> for empty input', () => {
    expect(plainTextToHtml('')).toBe('<p><br></p>')
  })
})

describe('blocksToHtml & blocksToPlainText', () => {
  it('groups consecutive list items into a <ul>', () => {
    const html = blocksToHtml([
      { type: 'heading', text: 'Title' },
      { type: 'list', text: 'item 1' },
      { type: 'list', text: 'item 2' },
      { type: 'paragraph', text: 'after' },
    ])
    expect(html).toBe('<h2>Title</h2><ul><li>item 1</li><li>item 2</li></ul><p>after</p>')
  })

  it('flattens to plain text with bullets', () => {
    const text = blocksToPlainText([
      { type: 'heading', text: 'Title' },
      { type: 'list', text: 'item 1' },
      { type: 'paragraph', text: 'after' },
    ])
    expect(text).toBe('Title\n\n- item 1\n\nafter')
  })
})

describe('uniqueValues', () => {
  it('returns sorted unique folders', () => {
    const notes = [
      sampleNote({ folder: 'b', tags: ['x'] }),
      sampleNote({ folder: 'a', tags: ['y', 'x'] }),
      sampleNote({ folder: 'b', tags: ['z'] }),
    ]
    expect(uniqueValues(notes, 'folder')).toEqual(['a', 'b'])
  })

  it('returns sorted unique tags', () => {
    const notes = [sampleNote({ tags: ['b', 'a'] }), sampleNote({ tags: ['a', 'c'] })]
    expect(uniqueValues(notes, 'tags')).toEqual(['a', 'b', 'c'])
  })
})

describe('maxUpdatedAt', () => {
  it('returns the most recent updatedAt as ms', () => {
    const notes = [
      sampleNote({ updatedAt: '2026-01-01T00:00:00.000Z' }),
      sampleNote({ updatedAt: '2026-03-01T00:00:00.000Z' }),
      sampleNote({ updatedAt: '2026-02-01T00:00:00.000Z' }),
    ]
    expect(maxUpdatedAt(notes)).toBe(new Date('2026-03-01T00:00:00.000Z').getTime())
  })

  it('returns 0 for empty list', () => {
    expect(maxUpdatedAt([])).toBe(0)
  })
})
