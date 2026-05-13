import { describe, expect, it } from 'vitest'
import { noteRowSchema } from './schemas'

const validRow = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: '22222222-2222-2222-2222-222222222222',
  client_id: 'n-abc',
  title: 'hello',
  body_text: 'body',
  body_html: '<p>body</p>',
  folder: 'general',
  tags: ['a', 'b'],
  favorite: false,
  archived: false,
  version: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  deleted_at: null,
}

describe('noteRowSchema', () => {
  it('accepts a valid row', () => {
    const parsed = noteRowSchema.parse(validRow)
    expect(parsed.client_id).toBe('n-abc')
    expect(parsed.tags).toEqual(['a', 'b'])
  })

  it('normalises null tags to an empty array', () => {
    const parsed = noteRowSchema.parse({ ...validRow, tags: null })
    expect(parsed.tags).toEqual([])
  })

  it('rejects missing required fields', () => {
    const { title: _omit, ...partial } = validRow
    void _omit
    expect(() => noteRowSchema.parse(partial)).toThrow()
  })
})
