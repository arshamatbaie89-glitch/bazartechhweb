import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.admin.findUnique({ where: { username: 'admin' } })
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    await prisma.admin.create({
      data: { username: 'admin', passwordHash },
    })
    console.log('Default admin created')
    console.log('IMPORTANT: Change the default password immediately after first login')
  } else {
    console.log('Admin already exists')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
