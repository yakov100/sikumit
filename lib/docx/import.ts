import type { ImportedBlock } from '../types'
import { readZipEntry } from './zip'

export function extractBlocksFromDocumentXml(xmlText: string): ImportedBlock[] {
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

export async function readDocxBlocks(file: File): Promise<ImportedBlock[]> {
  const xml = await readZipEntry(await file.arrayBuffer(), 'word/document.xml')
  return extractBlocksFromDocumentXml(xml)
}
