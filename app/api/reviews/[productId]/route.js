import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sanitize, validateInt, validateLength, safeError, getClientIp } from '@/lib/validation'

export async function GET(request, { params }) {
  try {
    const { productId } = await params
    const pid = typeof productId === 'string' ? productId.trim().slice(0, 50) : ''
    if (!pid) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })

    const reviews = await prisma.review.findMany({
      where: { productId: pid },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json({ reviews })
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { productId } = await params
    const pid = typeof productId === 'string' ? productId.trim().slice(0, 50) : ''
    if (!pid) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })

    const body = await request.json()
    const { rating, comment, author } = body

    const numRating = validateInt(rating, 1, 5)
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    const sanitizedComment = sanitize(comment.trim()).slice(0, 1000)
    const sanitizedAuthor = sanitize(typeof author === 'string' ? author.trim() : 'Anonymous').slice(0, 50) || 'Anonymous'

    const lenErr = validateLength({ comment: sanitizedComment, author: sanitizedAuthor })
    if (lenErr) return NextResponse.json({ error: lenErr }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { productId: pid } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const review = await prisma.review.create({
      data: {
        productId: pid,
        rating: numRating,
        comment: sanitizedComment,
        author: sanitizedAuthor,
      },
    })

    const agg = await prisma.review.aggregate({
      where: { productId: pid },
      _avg: { rating: true },
      _count: true,
    })

    await prisma.product.update({
      where: { productId: pid },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}
