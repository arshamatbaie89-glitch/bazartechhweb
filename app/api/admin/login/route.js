import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createCsrfToken } from '@/lib/csrf'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const rateKey = `login:${ip}`

    if (!checkRateLimit(rateKey, 5, 60000)) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim().slice(0, 50) : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { username } })
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ id: admin.id, username: admin.username })
    const csrfToken = createCsrfToken()
    const cookieStore = await cookies()

    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    cookieStore.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
