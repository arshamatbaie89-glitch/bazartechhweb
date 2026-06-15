import { createRequire } from 'module'
import 'dotenv/config'

const require = createRequire(import.meta.url)
const globalForPrisma = globalThis

function getPrisma() {
  if (!globalForPrisma.prisma) {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) throw new Error('DATABASE_URL not set')

    if (!dbUrl.startsWith('file:')) {
      throw new Error('Only file:// database URLs are allowed')
    }

    const { PrismaClient } = require('@prisma/client')
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const adapter = new PrismaBetterSqlite3({ url: dbUrl })

    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    })
  }
  return globalForPrisma.prisma
}

export const prisma = new Proxy({}, {
  get(_, prop) {
    return getPrisma()[prop]
  },
})
