import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sanitize, sanitizeObject, validateLength, validatePrice, validateInt, isSafeUrl, safeError } from "@/lib/validation"

export async function POST(request) {
  try {
    const body = await request.json()
    const { items, customerName, customerPhone, customerAddress } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing items" }, { status: 400 })
    }

    if (items.length > 50) {
      return NextResponse.json({ error: "Too many items (max 50)" }, { status: 400 })
    }

    const sanitized = sanitizeObject({ customerName, customerPhone, customerAddress }, ['customerName', 'customerPhone', 'customerAddress'])
    const lenErr = validateLength(sanitized)
    if (lenErr) return NextResponse.json({ error: lenErr }, { status: 400 })

    const safeItems = items.map(i => ({
      productId: typeof i.productId === 'string' ? i.productId.trim().slice(0, 50) : '',
      productName: sanitize(typeof i.productName === 'string' ? i.productName.trim().slice(0, 200) : ''),
      price: validatePrice(i.price),
      quantity: validateInt(i.quantity, 1, 100),
      image: typeof i.image === 'string' && isSafeUrl(i.image) ? i.image.slice(0, 500) : "",
    })).filter(i => i.productId && i.productName)

    if (safeItems.length === 0) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 })
    }

    const first = safeItems[0]
    const order = await prisma.order.create({
      data: {
        productId: first.productId,
        productName: first.productName,
        price: first.price,
        customerName: sanitized.customerName || "",
        customerPhone: sanitized.customerPhone || "",
        customerAddress: sanitized.customerAddress || "",
        quantity: safeItems.reduce((s, i) => s + i.quantity, 0),
        items: JSON.stringify(safeItems),
        status: "requested",
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}
