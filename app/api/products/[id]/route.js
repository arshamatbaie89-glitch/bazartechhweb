import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { safeParse, safeError } from '@/lib/validation'

export async function GET(request, { params }) {
  const { id } = await params

  try {
    const pid = String(id).trim().slice(0, 50)
    if (!pid) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { productId: pid } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({
      ...updated,
      images: safeParse(updated.images),
      videoUrls: safeParse(updated.videoUrls),
    })
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}
