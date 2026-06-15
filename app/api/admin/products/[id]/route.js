import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sanitizeObject, validateLength, validatePrice, validateInt, allowlist, validateUrls, safeParse } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

const ALLOWED_UPDATE_FIELDS = ['name', 'description', 'price', 'salePrice', 'images', 'videoUrls', 'category', 'stock', 'featured']

export async function GET(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId) || numId < 1) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    const product = await prisma.product.findUnique({ where: { id: numId } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images || '[]'),
      videoUrls: JSON.parse(product.videoUrls || '[]'),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId) || numId < 1) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await request.json()
    const allowed = allowlist(body, ALLOWED_UPDATE_FIELDS)

    const existing = await prisma.product.findUnique({ where: { id: numId } })
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const sanitized = sanitizeObject(allowed, ['name', 'description', 'category'])
    if (sanitized.name || sanitized.description || sanitized.category) {
      const lenErr = validateLength({ name: sanitized.name, description: sanitized.description, category: sanitized.category })
      if (lenErr) return NextResponse.json({ error: lenErr }, { status: 400 })
    }

    const data = {}
    if (sanitized.name !== undefined) data.name = sanitized.name
    if (sanitized.description !== undefined) data.description = sanitized.description
    if (allowed.price !== undefined) data.price = validatePrice(allowed.price)
    if (allowed.salePrice !== undefined) data.salePrice = allowed.salePrice ? validatePrice(allowed.salePrice) : null
    if (allowed.images !== undefined) data.images = JSON.stringify(validateUrls(allowed.images))
    if (allowed.videoUrls !== undefined) data.videoUrls = JSON.stringify(validateUrls(allowed.videoUrls).slice(0, 5))
    if (sanitized.category !== undefined) data.category = sanitized.category
    if (allowed.stock !== undefined) data.stock = validateInt(allowed.stock, 0, 999999)
    if (allowed.featured !== undefined) data.featured = !!allowed.featured

    const product = await prisma.product.update({ where: { id: numId }, data })
    return NextResponse.json({ ...product, images: JSON.parse(product.images), videoUrls: JSON.parse(product.videoUrls) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId) || numId < 1) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    const existing = await prisma.product.findUnique({ where: { id: numId } })
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    await prisma.product.delete({ where: { id: numId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
