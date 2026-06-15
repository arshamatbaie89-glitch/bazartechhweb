import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters')
  }
  return secret
}

export function signToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256', expiresIn: '8h' })
}

export function verifyToken(token: string): jwt.JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] })
    return decoded as jwt.JwtPayload
  } catch {
    return null
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('admin_token')?.value || null
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken()
  if (!token) return false
  return verifyToken(token) !== null
}
