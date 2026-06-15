import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters')
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    return null
  }
}

export async function getAuthToken() {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('admin_token')?.value || null
  } catch {
    return null
  }
}

export async function isAuthenticated() {
  const token = await getAuthToken()
  if (!token) return false
  return verifyToken(token) !== null
}
