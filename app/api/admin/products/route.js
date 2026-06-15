import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sanitizeObject, validateLength, validatePrice, validateInt, allowlist, validateUrls, safeParse, safeError } from '@/lib/validation'

const ALLOWED_CREATE_FIELDS = ['name', 'description', 'price', 'salePrice', 'images', 'videoUrls', 'category', 'stock', 'featured']

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(
      products.map((p) => ({ ...p, images: safeParse(p.images), videoUrls: safeParse(p.videoUrls) }))
    )
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const allowed = allowlist(body, ALLOWED_CREATE_FIELDS)

    const name = typeof allowed.name === 'string' ? allowed.name.trim() : ''
    const description = typeof allowed.description === 'string' ? allowed.description.trim() : ''
    const price = allowed.price

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Valid price required' }, { status: 400 })
    }

    const sanitized = sanitizeObject({ name, description, category: allowed.category }, ['name', 'description', 'category'])
    const lenErr = validateLength({ name: sanitized.name, description: sanitized.description, category: sanitized.category })
    if (lenErr) return NextResponse.json({ error: lenErr }, { status: 400 })

    const safeImages = validateUrls(allowed.images)
    const safeVideoUrls = validateUrls(allowed.videoUrls).slice(0, 5)

    const prdNumber = String(Date.now()).slice(-6) + String(Math.random()).slice(2, 5)
    const productId = `PRD-${prdNumber}`

    const product = await prisma.product.create({
      data: {
        productId,
        name: sanitized.name,
        description: sanitized.description,
        price: validatePrice(price),
        salePrice: allowed.salePrice ? validatePrice(allowed.salePrice) : null,
        images: JSON.stringify(safeImages),
        videoUrls: JSON.stringify(safeVideoUrls),
        category: sanitized.category || 'general',
        stock: validateInt(allowed.stock, 0, 999999),
        featured: !!allowed.featured,
      },
    })

    return NextResponse.json({ ...product, images: JSON.parse(product.images), videoUrls: JSON.parse(product.videoUrls) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}
