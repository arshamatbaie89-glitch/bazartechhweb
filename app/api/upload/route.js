import { isAuthenticated } from '@/lib/auth'
import { saveFile } from '@/lib/upload'
import { handleApiError } from '@/lib/errors'
import { NextResponse } from 'next/server'

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
      urls.push(`/api/uploads/${filename}`)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    return handleApiError(error)
  }
}
