const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

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

export function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export function createZip(entries: { name: string; content: string }[]) {
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

export async function readZipEntry(buffer: ArrayBuffer, targetName: string) {
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
