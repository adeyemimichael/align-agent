import { beforeAll, afterAll } from 'vitest'
import { config } from 'dotenv'
import { prisma } from '@/lib/prisma'

// Load environment variables
config()

beforeAll(async () => {
  // Ensure database connection is ready
  await prisma.$connect()
})

afterAll(async () => {
  // Clean up database connection
  await prisma.$disconnect()
})
