/**
 * Verification script to check that the database setup is complete
 * Run with: npx tsx scripts/verify-setup.ts
 */

import { PrismaClient } from '@prisma/client'

async function verifySetup() {
  console.log('🔍 Verifying database setup...\n')

  const prisma = new PrismaClient()

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Check if tables exist by querying each model
    const userCount = await prisma.user.count()
    console.log(`✅ User table exists (${userCount} records)`)

    const checkInCount = await prisma.checkIn.count()
    console.log(`✅ CheckIn table exists (${checkInCount} records)`)

    const planCount = await prisma.dailyPlan.count()
    console.log(`✅ DailyPlan table exists (${planCount} records)`)

    const taskCount = await prisma.planTask.count()
    console.log(`✅ PlanTask table exists (${taskCount} records)`)

    const goalCount = await prisma.goal.count()
    console.log(`✅ Goal table exists (${goalCount} records)`)

    const integrationCount = await prisma.integration.count()
    console.log(`✅ Integration table exists (${integrationCount} records)`)

    console.log('\n🎉 All database tables are set up correctly!')
    console.log('You can now start building the application.')

  } catch (error) {
    console.error('\n❌ Database verification failed:')
    console.error(error)
    console.log('\nPlease ensure:')
    console.log('1. PostgreSQL is running')
    console.log('2. DATABASE_URL in .env is correct')
    console.log('3. You have run: npm run db:migrate')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifySetup()
