import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join('/tmp', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/bmp', 'image/tiff', 'image/avif', 'image/heic', 'image/heif',
]
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'avif', 'heic', 'heif']

const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
  bmp: [0x42, 0x4d],
  tiff: [0x49, 0x49, 0x2a, 0x00],
  tif: [0x49, 0x49, 0x2a, 0x00],
  avif: [0x00, 0x00, 0x00, 0x1c],
  heic: [0x00, 0x00, 0x00, 0x18],
  heif: [0x00, 0x00, 0x00, 0x18],
}

function verifyMagicBytes(buffer, ext) {
  const signatures = MAGIC_BYTES[ext]
  if (!signatures) return true
  if (buffer.length < signatures.length) return false
  return signatures.every((byte, i) => buffer[i] === byte)
}

export async function saveFile(file) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (buffer.length > MAX_SIZE) {
    throw new Error(`File too large (max ${MAX_SIZE / 1024 / 1024}MB)`)
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file extension')
  }

  const normalizedExt = ext === 'jpg' ? 'jpeg' : ext === 'tif' ? 'tiff' : ext
  if (!verifyMagicBytes(buffer, normalizedExt)) {
    throw new Error('File content does not match extension')
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${uuidv4()}.${ext}`
  const filepath = join(UPLOAD_DIR, filename)

  await writeFile(filepath, buffer)

  return filename
}

export { UPLOAD_DIR }
