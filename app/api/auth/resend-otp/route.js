import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rateLimit'
import { generateOtp, hashOtp, getOtpExpiry, canResendOtp, getResendCooldownSeconds } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    if (!checkRateLimit(`resend-otp:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('otp_session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'No active OTP session' }, { status: 400 })
    }

    const record = await prisma.otpVerification.findUnique({ where: { sessionId } })
    if (!record) {
      return NextResponse.json({ error: 'OTP session not found' }, { status: 400 })
    }

    if (!canResendOtp(record.cooldownAt)) {
      const seconds = getResendCooldownSeconds(record.cooldownAt)
      return NextResponse.json({ error: `Please wait ${seconds} seconds before resending.`, cooldown: seconds }, { status: 429 })
    }

    if (record.attempts >= 3) {
      await prisma.otpVerification.delete({ where: { id: record.id } })
      cookieStore.delete('otp_session')
      return NextResponse.json({ error: 'Too many failed attempts. Please login again.' }, { status: 429 })
    }

    const otp = generateOtp()
    const otpHash = await hashOtp(otp)

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: {
        otpHash,
        expiresAt: getOtpExpiry(),
        cooldownAt: new Date(),
        attempts: 0,
      },
    })

    const admin = await prisma.admin.findUnique({ where: { id: record.adminId } })
    const recipient = admin?.email || admin?.username || 'unknown'
    await sendOtpEmail(recipient, otp)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json({ error: 'Failed to resend OTP' }, { status: 500 })
  }
}
