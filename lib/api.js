export function getCsrfToken() {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
  return match ? match[1] : ''
}

export async function apiFetch(url, options = {}) {
  const token = getCsrfToken()
  if (token) {
    options.headers = { ...options.headers, 'x-csrf-token': token }
  }
  const res = await fetch(url, options)
  return res
}
