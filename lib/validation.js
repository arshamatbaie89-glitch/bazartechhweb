export function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

export function sanitizeObject(obj, fields) {
  if (!obj || typeof obj !== 'object') return {}
  const sanitized = {}
  for (const field of fields) {
    if (obj[field] !== undefined && obj[field] !== null) {
      sanitized[field] = typeof obj[field] === 'string' ? sanitize(obj[field]) : obj[field]
    }
  }
  return sanitized
}

export function allowlist(obj, allowedFields) {
  if (!obj || typeof obj !== 'object') return {}
  const result = {}
  for (const key of allowedFields) {
    if (obj[key] !== undefined) result[key] = obj[key]
  }
  return result
}

export function safeParse(str) {
  try { return JSON.parse(str) } catch { return [] }
}

export function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
}

function isPrivateIp(hostname) {
  if (!hostname) return true
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1') return true
  if (/^127\./.test(h)) return true
  if (/^10\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (/^192\.168\./.test(h)) return true
  if (/^169\.254\./.test(h)) return true
  if (/^0\./.test(h)) return true
  if (/^fc00:/i.test(h)) return true
  if (/^fe80:/i.test(h)) return true
  return false
}

export function isSafeUrl(urlStr) {
  if (typeof urlStr !== 'string') return false
  const trimmed = urlStr.trim()
  if (!trimmed) return true

  if (/^data:/i.test(trimmed)) return false
  if (/^javascript:/i.test(trimmed)) return false
  if (/^vbscript:/i.test(trimmed)) return false
  if (/^file:\/\//i.test(trimmed)) return false

  if (/^\/(api\/uploads|uploads)\//.test(trimmed)) return true
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed)
      if (!['http:', 'https:'].includes(parsed.protocol)) return false
      if (isPrivateIp(parsed.hostname)) return false
      if (parsed.port && !['80', '443', ''].includes(parsed.port)) return false
      return true
    } catch {
      return false
    }
  }

  return false
}

export function validateUrls(urls) {
  if (!Array.isArray(urls)) return []
  return urls.filter(u => isSafeUrl(String(u))).map(String).slice(0, 20)
}

const LIMITS = {
  name: 200,
  description: 5000,
  comment: 1000,
  customerName: 100,
  customerPhone: 20,
  customerAddress: 300,
  author: 50,
  category: 50,
  username: 50,
  password: 128,
}

export function validateLength(data) {
  for (const [field, max] of Object.entries(LIMITS)) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] === 'string') {
      if (data[field].length > max) return `${field} must be at most ${max} characters`
      if (data[field].length === 0 && field !== 'author') return `${field} is required`
    }
  }
  return null
}

export function validatePrice(price) {
  const p = parseFloat(price)
  if (isNaN(p) || p < 0) return 0
  return Math.round(p * 100) / 100
}

export function validateInt(value, min = 0, max = 999999) {
  const n = parseInt(value)
  if (isNaN(n)) return min
  return Math.min(Math.max(n, min), max)
}

export function validateStatus(status) {
  const allowed = ['requested', 'accepted', 'rejected']
  return allowed.includes(status) ? status : null
}

const TRANSITIONS = {
  requested: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
}

export function isValidTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function safeError(error) {
  console.error('[API Error]', new Date().toISOString(), error?.message || error)
  return 'Internal server error'
}
