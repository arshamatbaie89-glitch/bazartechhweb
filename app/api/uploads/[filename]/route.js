import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

const UPLOAD_DIR = join('/tmp', 'uploads')
const EXT_MAP = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
  tiff: 'image/tiff', tif: 'image/tiff', avif: 'image/avif',
  heic: 'image/heic', heif: 'image/heif',
}

export async function GET(request, { params }) {
  try {
    const { filename } = await params
    const sanitized = String(filename).replace(/[^a-zA-Z0-9._-]/g, '')
    if (!sanitized) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const ext = sanitized.split('.').pop()?.toLowerCase()
    const contentType = EXT_MAP[ext] || 'application/octet-stream'

    const buffer = await readFile(join(UPLOAD_DIR, sanitized))
    return new NextResponse(buffer, {
      status: 200,
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
