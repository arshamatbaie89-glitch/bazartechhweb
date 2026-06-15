const stores = new Map()

function getStore(name) {
  if (!stores.has(name)) stores.set(name, new Map())
  return stores.get(name)
}

export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now()
  const store = getStore('default')
  const record = store.get(key) || { count: 0, resetAt: now + windowMs }
  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + windowMs
  }
  record.count++
  store.set(key, record)
  return record.count <= maxAttempts
}

export function getRemainingAttempts(key, maxAttempts = 5) {
  const store = getStore('default')
  const record = store.get(key)
  if (!record) return maxAttempts
  if (Date.now() > record.resetAt) return maxAttempts
  return Math.max(0, maxAttempts - record.count)
}

setInterval(() => {
  const now = Date.now()
  for (const [, store] of stores) {
    for (const [key, record] of store) {
      if (now > record.resetAt) store.delete(key)
    }
  }
}, 60000)
