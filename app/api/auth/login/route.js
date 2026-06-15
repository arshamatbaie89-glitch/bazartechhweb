import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { createCsrfToken, createSessionId } from '@/lib/csrf'
import { generateOtp, hashOtp, getOtpExpiry } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    if (!checkRateLimit(`login:${ip}`, 5, 60000)) {
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

    const otp = generateOtp()
    const otpHash = await hashOtp(otp)
    const sessionId = createSessionId()

    await prisma.otpVerification.deleteMany({ where: { adminId: admin.id } })

    await prisma.otpVerification.create({
      data: {
        adminId: admin.id,
        sessionId,
        otpHash,
        expiresAt: getOtpExpiry(),
        attempts: 0,
      },
    })

    const recipient = admin.email || admin.username
    await sendOtpEmail(recipient, otp)

    const cookieStore = await cookies()
    cookieStore.set('otp_session', sessionId, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/',
      maxAge: 300,
    })

    return NextResponse.json({ success: true, requires2FA: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
