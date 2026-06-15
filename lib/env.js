export function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getEnv(name, defaultValue = '') {
  return process.env[name] || defaultValue
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment() {
  return !isProduction()
}

export function validateRequiredEnv(...vars) {
  const missing = vars.filter(v => !process.env[v])
  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`
    if (isProduction()) {
      throw new Error(msg)
    } else {
      console.warn(`[WARN] ${msg}`)
    }
  }
}
