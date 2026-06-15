import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"
import { NextResponse } from "next/server"
import { validateInt, validateStatus, isValidTransition, safeError } from "@/lib/validation"

export async function PUT(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const numId = validateInt(id, 1)
    if (numId < 1) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const { status } = await request.json()
    const validStatus = validateStatus(status)
    if (!validStatus) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: numId } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    if (!isValidTransition(order.status, validStatus)) {
      return NextResponse.json({
        error: `Cannot transition from "${order.status}" to "${validStatus}"`,
      }, { status: 400 })
    }

    if (validStatus === "accepted") {
      const items = JSON.parse(order.items || "[]")
      const stockResults = await prisma.$transaction(
        items.map((item) =>
          prisma.product.updateMany({
            where: { productId: item.productId, stock: { gte: item.quantity || 1 } },
            data: { stock: { decrement: item.quantity || 1 } },
          })
        )
      )

      const failedItems = items.filter((_, i) => stockResults[i].count === 0)
      if (failedItems.length > 0) {
        return NextResponse.json({
          error: `Insufficient stock for: ${failedItems.map(i => i.productName).join(', ')}`,
        }, { status: 409 })
      }
    }

    const updated = await prisma.order.update({
      where: { id: numId },
      data: { status: validStatus },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 500 })
  }
}
