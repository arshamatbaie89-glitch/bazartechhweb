import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { safeParse } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = String(searchParams.get('q') || '').slice(0, 200)
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '10') || 10), 50)

  try {
    if (!q || q.trim().length === 0) return NextResponse.json({ products: [] })

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { productId: { contains: q } },
        ],
      },
      take: limit,
      orderBy: { views: 'desc' },
      select: {
        productId: true, name: true, price: true, salePrice: true,
        images: true, stock: true,
      },
    })

    return NextResponse.json({
      products: products.map((p) => ({ ...p, images: safeParse(p.images) })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
