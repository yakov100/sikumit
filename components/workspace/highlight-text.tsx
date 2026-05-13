import type { ReactNode } from 'react'

export function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text

  const normalizedQuery = query.trim()
  const index = text.toLowerCase().indexOf(normalizedQuery.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-[#dbeafe] px-0.5 text-[#0f172a]">
        {text.slice(index, index + normalizedQuery.length)}
      </mark>
      {text.slice(index + normalizedQuery.length)}
    </>
  )
}
