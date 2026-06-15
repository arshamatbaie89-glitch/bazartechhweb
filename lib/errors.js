import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

function formatPrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': return { error: 'A record with this value already exists', status: 409 }
      case 'P2025': return { error: 'Record not found', status: 404 }
      case 'P2003': return { error: 'Referenced record does not exist', status: 400 }
      case 'P2014': return { error: 'Constraint violation', status: 400 }
      default: return null
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return { error: 'Invalid data provided', status: 400 }
  }
  return null
}

export function handleApiError(error) {
  console.error('[API Error]', new Date().toISOString(), error?.message || error)

  const prismaError = formatPrismaError(error)
  if (prismaError) {
    return NextResponse.json(
      { error: prismaError.error },
      { status: prismaError.status }
    )
  }

  const status =
    error?.status || error?.statusCode ||
    (error?.message?.includes('not found') ? 404 :
     error?.message?.includes('required') || error?.message?.includes('Invalid') ? 400 :
     500)

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(
      { error: error?.message || 'Internal server error', details: error?.stack },
      { status }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function apiSuccess(data, status = 200) {
  return NextResponse.json(data, { status })
}

export function apiError(message, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
