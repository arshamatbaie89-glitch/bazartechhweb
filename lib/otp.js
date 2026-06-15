const OTP_LENGTH = 6
const OTP_EXPIRY_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 3
const RESEND_COOLDOWN_MS = 60 * 1000

export function generateOtp() {
  const array = new Uint32Array(OTP_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, (n) => n % 10).join('')
}

export async function hashOtp(otp) {
  const data = new TextEncoder().encode(otp)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyOtpHash(otp, hash) {
  const computed = await hashOtp(otp)
  if (computed.length !== hash.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return diff === 0
}

export function getOtpExpiry() {
  return new Date(Date.now() + OTP_EXPIRY_MS)
}

export function isOtpExpired(expiresAt) {
  return new Date() > new Date(expiresAt)
}

export function isOtpBlocked(attempts) {
  return attempts >= MAX_ATTEMPTS
}

export function canResendOtp(cooldownAt) {
  if (!cooldownAt) return true
  return Date.now() >= new Date(cooldownAt).getTime() + RESEND_COOLDOWN_MS
}

export function getResendCooldownSeconds(cooldownAt) {
  if (!cooldownAt) return 0
  const remaining = new Date(cooldownAt).getTime() + RESEND_COOLDOWN_MS - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000))
}

export { OTP_LENGTH, OTP_EXPIRY_MS, MAX_ATTEMPTS, RESEND_COOLDOWN_MS }
