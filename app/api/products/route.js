import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/errors'

function safeParse(str) {
  try { return JSON.parse(str) } catch { return [] }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '12') || 12), 100)
  const skip = (page - 1) * limit
  const sort = searchParams.get('sort') || 'newest'
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  try {
    const where = {}
    if (category && category !== 'all') where.category = String(category).slice(0, 50)
    if (search) {
      const q = String(search).slice(0, 200)
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ]
    }

    const orderBy = sort === 'price-asc' ? { price: 'asc' } :
      sort === 'price-desc' ? { price: 'desc' } :
      sort === 'popular' ? { views: 'desc' } :
      sort === 'rating' ? { rating: 'desc' } :
      { createdAt: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true, productId: true, name: true, price: true, salePrice: true,
          images: true, views: true, rating: true, reviewCount: true,
          stock: true, featured: true, category: true, createdAt: true,
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map((p) => ({ ...p, images: safeParse(p.images) })),
      total, page, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
