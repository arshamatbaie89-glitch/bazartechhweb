import { isAuthenticated } from '@/lib/auth'
import { saveFile } from '@/lib/upload'
import { NextResponse } from 'next/server'
import { safeError } from '@/lib/validation'

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files' }, { status: 400 })
    }

    const urls = []
    for (const file of files) {
      if (!(file instanceof File)) continue
      const filename = await saveFile(file)
      urls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 400 })
  }
}
