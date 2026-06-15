import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signToken } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'
import { createCsrfToken } from '@/lib/csrf'
import { verifyOtpHash, isOtpExpired, isOtpBlocked } from '@/lib/otp'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    if (!checkRateLimit(`verify-otp:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('otp_session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'No active OTP session' }, { status: 400 })
    }

    const body = await request.json()
    const otp = typeof body.otp === 'string' ? body.otp.trim() : ''

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 })
    }

    const record = await prisma.otpVerification.findUnique({ where: { sessionId } })
    if (!record) {
      return NextResponse.json({ error: 'OTP session not found' }, { status: 400 })
    }

    if (isOtpExpired(record.expiresAt)) {
      await prisma.otpVerification.delete({ where: { id: record.id } })
      cookieStore.delete('otp_session')
      return NextResponse.json({ error: 'OTP has expired. Please login again.' }, { status: 410 })
    }

    if (isOtpBlocked(record.attempts)) {
      await prisma.otpVerification.delete({ where: { id: record.id } })
      cookieStore.delete('otp_session')
      return NextResponse.json({ error: 'Too many failed attempts. Please login again.' }, { status: 429 })
    }

    const valid = await verifyOtpHash(otp, record.otpHash)
    if (!valid) {
      const attempts = record.attempts + 1
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts },
      })
      const remaining = 3 - attempts
      if (remaining <= 0) {
        await prisma.otpVerification.delete({ where: { id: record.id } })
        cookieStore.delete('otp_session')
        return NextResponse.json({ error: 'Too many failed attempts. Please login again.' }, { status: 429 })
      }
      return NextResponse.json({ error: `Invalid OTP. ${remaining} attempt(s) remaining.` }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({ where: { id: record.adminId } })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    await prisma.otpVerification.delete({ where: { id: record.id } })

    const token = signToken({ id: admin.id, username: admin.username })
    const csrfToken = createCsrfToken()

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

    cookieStore.delete('otp_session')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
