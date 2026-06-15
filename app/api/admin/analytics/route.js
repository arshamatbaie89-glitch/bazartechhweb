import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await Promise.allSettled([
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { views: true } }),
      prisma.product.findMany({ orderBy: { views: 'desc' }, take: 10, select: { productId: true, name: true, views: true, price: true } }),
      prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { productId: true, name: true, createdAt: true, price: true, views: true } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.order.count().catch(() => 0),
    ])

    return NextResponse.json({
      totalProducts: results[0].status === 'fulfilled' ? results[0].value : 0,
      totalViews: results[1].status === 'fulfilled' ? (results[1].value._sum.views || 0) : 0,
      mostViewed: results[2].status === 'fulfilled' ? results[2].value : [],
      recentProducts: results[3].status === 'fulfilled' ? results[3].value : [],
      outOfStock: results[4].status === 'fulfilled' ? results[4].value : 0,
      totalOrders: results[5].status === 'fulfilled' ? results[5].value : 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
