#!/usr/bin/env tsx
/**
 * Diagnostic script to check plan generation requirements
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
config();

// Now import prisma with adapter
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function diagnose() {
  console.log('🔍 Diagnosing Plan Generation Issues...\n');

  try {
    // Check 1: Database connection
    console.log('1️⃣ Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Check 2: User exists
    console.log('2️⃣ Checking for users...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.\n');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s):`);
    users.forEach(u => console.log(`   - ${u.email} (${u.id})`));
    console.log('');

    // Check 3: Check-ins
    console.log('3️⃣ Checking for check-ins...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const user of users) {
      const todayCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (todayCheckIn) {
        console.log(`✅ ${user.email} has check-in for today:`);
        console.log(`   - Capacity Score: ${todayCheckIn.capacityScore}`);
        console.log(`   - Mode: ${todayCheckIn.mode}`);
        console.log(`   - Available Hours: ${todayCheckIn.availableHours}`);
      } else {
        console.log(`❌ ${user.email} has NO check-in for today`);
        console.log(`   → Go to /checkin to complete one`);
      }
    }
    console.log('');

    // Check 4: Integrations
    console.log('4️⃣ Checking integrations...');
    for (const user of users) {
      const integrations = await prisma.integration.findMany({
        where: { userId: user.id },
        select: { platform: true, expiresAt: true },
      });

      if (integrations.length === 0) {
        console.log(`⚠️  ${user.email} has NO integrations connected`);
        console.log(`   → Connect Todoist at /integrations for tasks`);
      } else {
        console.log(`✅ ${user.email} integrations:`);
        integrations.forEach(i => {
          const isExpired = i.expiresAt && i.expiresAt < new Date();
          console.log(`   - ${i.platform}: ${isExpired ? '⚠️  Expired' : '✅ Connected'}`);
        });
      }
    }
    console.log('');

    // Check 5: Goals
    console.log('5️⃣ Checking goals...');
    for (const user of users) {
      const goals = await prisma.goal.findMany({
        where: { userId: user.id },
        select: { title: true, category: true },
      });

      if (goals.length === 0) {
        console.log(`⚠️  ${user.email} has NO goals`);
        console.log(`   → Add goals at /goals (optional but recommended)`);
      } else {
        console.log(`✅ ${user.email} has ${goals.length} goal(s):`);
        goals.slice(0, 3).forEach(g => {
          console.log(`   - ${g.title} (${g.category})`);
        });
        if (goals.length > 3) {
          console.log(`   ... and ${goals.length - 3} more`);
        }
      }
    }
    console.log('');

    // Check 6: Environment variables
    console.log('6️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GEMINI_API_KEY',
    ];

    let allEnvVarsPresent = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
      } else {
        console.log(`❌ ${envVar} is MISSING`);
        allEnvVarsPresent = false;
      }
    }
    console.log('');

    // Check 7: Existing plans
    console.log('7️⃣ Checking existing plans...');
    for (const user of users) {
      const plans = await prisma.dailyPlan.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 3,
        select: {
          date: true,
          capacityScore: true,
          mode: true,
          _count: {
            select: { tasks: true },
          },
        },
      });

      if (plans.length === 0) {
        console.log(`ℹ️  ${user.email} has NO plans yet`);
      } else {
        console.log(`✅ ${user.email} has ${plans.length} recent plan(s):`);
        plans.forEach(p => {
          console.log(`   - ${p.date.toISOString().split('T')[0]}: ${p._count.tasks} tasks (${p.mode})`);
        });
      }
    }
    console.log('');

    // Summary
    console.log('📋 SUMMARY:');
    console.log('─'.repeat(50));
    
    const hasUsers = users.length > 0;
    const hasCheckIn = users.some(async u => {
      const checkIn = await prisma.checkIn.findFirst({
        where: {
          userId: u.id,
          date: { gte: today, lt: tomorrow },
        },
      });
      return !!checkIn;
    });

    if (!hasUsers) {
      console.log('❌ Create a user account first');
    } else if (!hasCheckIn) {
      console.log('❌ Complete a check-in at /checkin');
    } else if (!allEnvVarsPresent) {
      console.log('❌ Set missing environment variables');
    } else {
      console.log('✅ All requirements met! Try generating a plan.');
      console.log('');
      console.log('💡 If you still get errors:');
      console.log('   1. Check server logs for detailed error messages');
      console.log('   2. Verify Gemini API key is valid');
      console.log('   3. Connect Todoist for tasks (or add manual tasks)');
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
