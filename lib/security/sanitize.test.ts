import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitize'

describe('sanitizeHtml', () => {
  it('preserves allowed tags and attributes', () => {
    const input = '<p>שלום <strong>עולם</strong> <a href="https://example.com" target="_blank">קישור</a></p>'
    const output = sanitizeHtml(input)
    expect(output).toContain('<strong>עולם</strong>')
    expect(output).toContain('href="https://example.com"')
  })

  it('strips script tags', () => {
    const input = '<p>hello</p><script>alert("xss")</script>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('script')
    expect(output).toContain('<p>hello</p>')
  })

  it('strips inline event handlers', () => {
    const input = '<p onclick="alert(1)">click me</p>'
    const output = sanitizeHtml(input)
    expect(output).not.toContain('onclick')
    expect(output).toContain('click me')
  })

  it('strips javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">bad</a>'
    const output = sanitizeHtml(input)
    expect(output).not.toMatch(/href="javascript:/i)
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('')
  })
})
