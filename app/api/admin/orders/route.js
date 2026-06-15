import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 200 })
    return NextResponse.json(orders)
  } catch (error) {
    return handleApiError(error)
  }
}
