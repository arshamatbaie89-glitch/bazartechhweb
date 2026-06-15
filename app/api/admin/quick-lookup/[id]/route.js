import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { safeParse } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

export async function GET(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const pid = String(id).trim().slice(0, 50)
    if (!pid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { productId: pid } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({
      ...product,
      images: safeParse(product.images),
      videoUrls: safeParse(product.videoUrls),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
