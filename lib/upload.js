import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

const MAGIC_BYTES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
}

function verifyMagicBytes(buffer, ext) {
  const signatures = MAGIC_BYTES[ext]
  if (!signatures) return false
  return signatures.every((byte, i) => buffer[i] === byte)
}

export async function saveFile(file) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (buffer.length > MAX_SIZE) {
    throw new Error('File too large (max 5MB)')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type (JPEG, PNG, GIF, WebP only)')
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file extension')
  }

  if (!verifyMagicBytes(buffer, ext === 'jpg' ? 'jpeg' : ext)) {
    throw new Error('File content does not match extension')
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${uuidv4()}.${ext}`
  const filepath = join(UPLOAD_DIR, filename)

  await writeFile(filepath, buffer)

  return filename
}
