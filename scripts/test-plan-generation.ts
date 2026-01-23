#!/usr/bin/env tsx
/**
 * Test script to generate a plan and see actual errors
 */

// Load environment variables
import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { getGeminiClient, PlanningContext } from '../lib/gemini';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testPlanGeneration() {
  console.log('🧪 Testing Plan Generation...\n');

  try {
    // Get user
    const user = await prisma.user.findFirst({
      where: { email: 'ayobami732000@gmail.com' },
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.email}`);

    // Get today's check-in
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!checkIn) {
      console.error('❌ No check-in found for today');
      return;
    }

    console.log(`✅ Found check-in: capacity=${checkIn.capacityScore}, mode=${checkIn.mode}`);

    // Get Todoist integration
    const todoistIntegration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'todoist',
        },
      },
    });

    if (!todoistIntegration) {
      console.error('❌ Todoist not connected');
      return;
    }

    console.log('✅ Todoist integration found');

    // For testing, create some mock tasks
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Review pull requests',
        description: 'Review and merge pending PRs',
        priority: 1,
        estimatedMinutes: 45,
      },
      {
        id: 'task-2',
        title: 'Write documentation',
        description: 'Update API documentation',
        priority: 2,
        estimatedMinutes: 60,
      },
      {
        id: 'task-3',
        title: 'Team meeting',
        description: 'Weekly sync with team',
        priority: 2,
        estimatedMinutes: 30,
      },
    ];

    console.log(`✅ Using ${mockTasks.length} mock tasks\n`);

    // Build planning context
    const context: PlanningContext = {
      capacityScore: checkIn.capacityScore,
      mode: checkIn.mode as 'recovery' | 'balanced' | 'deep_work',
      tasks: mockTasks,
      history: [],
      goals: [],
    };

    console.log('🤖 Calling Gemini AI to generate plan...');
    
    // Generate plan using Gemini
    const gemini = getGeminiClient();
    const planningResponse = await gemini.generateDailyPlan(context, new Date(), user.id);

    console.log('\n✅ Plan generated successfully!');
    console.log('\n📋 Plan Details:');
    console.log('Overall Reasoning:', planningResponse.overallReasoning);
    console.log('\nScheduled Tasks:');
    planningResponse.orderedTasks.forEach((task, i) => {
      const taskInfo = mockTasks.find(t => t.id === task.taskId);
      console.log(`${i + 1}. ${taskInfo?.title}`);
      console.log(`   Time: ${task.scheduledStart.toLocaleTimeString()} - ${task.scheduledEnd.toLocaleTimeString()}`);
      console.log(`   Reasoning: ${task.reasoning}`);
    });

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPlanGeneration();
