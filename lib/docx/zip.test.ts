import { describe, expect, it } from 'vitest'
import { createZip, readZipEntry, toArrayBuffer } from './zip'

describe('createZip + readZipEntry roundtrip', () => {
  it('reads back stored entries by name', async () => {
    const zip = createZip([
      { name: 'word/document.xml', content: '<doc>hello</doc>' },
      { name: 'meta.txt', content: 'meta value' },
    ])
    const buffer = toArrayBuffer(zip)

    await expect(readZipEntry(buffer, 'word/document.xml')).resolves.toBe('<doc>hello</doc>')
    await expect(readZipEntry(buffer, 'meta.txt')).resolves.toBe('meta value')
  })

  it('throws on missing entry', async () => {
    const zip = createZip([{ name: 'a.txt', content: 'x' }])
    await expect(readZipEntry(toArrayBuffer(zip), 'b.txt')).rejects.toThrow()
  })

  it('throws on invalid zip', async () => {
    const garbage = new Uint8Array([1, 2, 3, 4])
    await expect(readZipEntry(toArrayBuffer(garbage), 'x')).rejects.toThrow()
  })
})
