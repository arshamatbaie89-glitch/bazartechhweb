import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sanitizeObject, validateLength, validatePrice, validateInt, isSafeUrl, getClientIp } from "@/lib/validation"
import { handleApiError } from "@/lib/errors"

export async function POST(request) {
  try {
    const ip = getClientIp(request)

    const body = await request.json()

    const productId = typeof body.productId === 'string' ? body.productId.trim().slice(0, 50) : ''
    const productName = typeof body.productName === 'string' ? body.productName.trim() : ''

    if (!productId || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sanitized = sanitizeObject({
      productName,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
    }, ['productName', 'customerName', 'customerPhone', 'customerAddress'])

    const lenErr = validateLength(sanitized)
    if (lenErr) return NextResponse.json({ error: lenErr }, { status: 400 })

    const qty = validateInt(body.quantity, 1, 100)
    const safePrice = validatePrice(body.price)
    const image = typeof body.image === 'string' && isSafeUrl(body.image) ? body.image.slice(0, 500) : ""

    const order = await prisma.order.create({
      data: {
        productId,
        productName: sanitized.productName,
        price: safePrice,
        customerName: sanitized.customerName || "",
        customerPhone: sanitized.customerPhone || "",
        customerAddress: sanitized.customerAddress || "",
        quantity: qty,
        items: JSON.stringify([{ productId, productName: sanitized.productName, price: safePrice, quantity: qty, image }]),
        status: "requested",
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
