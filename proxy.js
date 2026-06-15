import { NextResponse } from 'next/server'

const RATE_LIMIT = new Map()

function getIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
}

function rateLimit(key, limit, windowMs) {
  const now = Date.now()
  const record = RATE_LIMIT.get(key)
  if (!record || now > record.resetAt) {
    RATE_LIMIT.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  record.count++
  return record.count <= limit
}

function parseCookies(header) {
  if (!header) return {}
  const out = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = v
  }
  return out
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  let r = 0
  for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i]
  return r === 0
}

function validateCsrf(request) {
  const cookies = parseCookies(request.headers.get('cookie'))
  const cookieToken = cookies['csrf_token']
  const headerToken = request.headers.get('x-csrf-token')
  if (!cookieToken || !headerToken) return false
  if (cookieToken.length !== 64 || headerToken.length !== 64) return false
  return timingSafeEqual(cookieToken, headerToken)
}

export function proxy(request) {
  const url = new URL(request.url)
  const { pathname } = url
  const ip = getIp(request)
  const method = request.method

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  const contentLength = parseInt(request.headers.get('content-length') || '0')
  if (contentLength > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }

  const globalKey = `g:${ip}`
  if (!rateLimit(globalKey, 200, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  if (pathname.startsWith('/api/admin/login') && method === 'POST') {
    if (!rateLimit(`login:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 })
    }
  }

  if (pathname.startsWith('/api/admin/') && method !== 'GET' && method !== 'HEAD') {
    if (!rateLimit(`adm:${ip}`, 60, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
  }

  if (pathname.startsWith('/api/orders') && method === 'POST') {
    if (!rateLimit(`ord:${ip}`, 20, 3600000)) {
      return NextResponse.json({ error: 'Order rate limit exceeded' }, { status: 429 })
    }
  }

  if (pathname.startsWith('/api/reviews') && method === 'POST') {
    if (!rateLimit(`rev:${ip}`, 10, 3600000)) {
      return NextResponse.json({ error: 'Review rate limit exceeded' }, { status: 429 })
    }
  }

  if (pathname.startsWith('/api/upload') && method === 'POST') {
    if (!rateLimit(`upl:${ip}`, 30, 3600000)) {
      return NextResponse.json({ error: 'Upload rate limit exceeded' }, { status: 429 })
    }
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    if (!rateLimit(`auth-login:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 })
    }
  }

  if (pathname === '/api/auth/verify-otp' && method === 'POST') {
    if (!rateLimit(`auth-verify:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many verification attempts' }, { status: 429 })
    }
  }

  if (pathname === '/api/auth/resend-otp' && method === 'POST') {
    if (!rateLimit(`auth-resend:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many resend requests' }, { status: 429 })
    }
  }

  if (pathname.startsWith('/api/admin/') && method !== 'GET' && method !== 'HEAD' && !pathname.startsWith('/api/admin/login')) {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'CSRF token missing or invalid' }, { status: 403 })
    }
  }

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = url.host

    if (origin) {
      try {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (!origin && referer) {
      try {
        const refererHost = new URL(referer).host
        if (refererHost !== host) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '0')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https:; connect-src 'self'; frame-src 'none'; object-src 'none'")
  if (url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  }
  response.headers.set('X-Request-Id', crypto.randomUUID())

  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
