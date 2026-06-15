import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
  migrate: {
    seed: 'node prisma/seed.js',
  },
})
