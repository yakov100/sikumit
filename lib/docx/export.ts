import type { Note } from '../types'
import { escapeXml, htmlToPlainText, noteHtml } from '../utils/text'
import { createZip, toArrayBuffer } from './zip'

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

export function createDocxBlob(note: Note) {
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
