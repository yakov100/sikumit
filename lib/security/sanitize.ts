import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'a',
  'b',
  'br',
  'blockquote',
  'div',
  'em',
  'font',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'mark',
  'ol',
  'p',
  's',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'u',
  'ul',
]

const ALLOWED_ATTR = ['href', 'rel', 'target', 'style', 'class', 'face', 'size', 'color', 'data-search-highlight']

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    USE_PROFILES: { html: true },
  })
}
