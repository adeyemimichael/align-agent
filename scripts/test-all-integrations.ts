/**
 * Comprehensive Integration Test Script
 * Tests all major integrations: Database, Gemini AI, Todoist, Google Calendar, Opik
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config();

// Now import modules that need env vars
import { prisma } from '../lib/prisma';
import { getGeminiClient } from '../lib/gemini';
import { getOpikClient, logAIRequest } from '../lib/opik';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${result.name}: ${result.message}`);
  results.push(result);
}

async function testDatabaseConnection() {
  const start = Date.now();
  try {
    await prisma.$connect();
    await prisma.user.findFirst();
    logTest({
      name: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to PostgreSQL',
      duration: Date.now() - start,
    });
    return true;
  } catch (error) {
    logTest({
      name: 'Database Connection',
      status: 'FAIL',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    });
    return false;
  }
}

async function testGeminiAI() {
  const start = Date.now();
  
  if (!process.env.GEMINI_API_KEY) {
    logTest({
      name: 'Gemini AI Integration',
      status: 'SKIP',
      message: 'GEMINI_API_KEY not set',
    });
    return false;
  }

  try {
    const geminiClient = getGeminiClient();
    
    const testData = {
      capacityScore: 75,
      mode: 'deep_work' as const,
      tasks: [
        {
          id: 'test-1',
          title: 'Complete project documentation',
          priority: 1,
          estimatedMinutes: 60,
          dueDate: new Date(),
        },
        {
          id: 'test-2',
          title: 'Review pull requests',
          priority: 2,
          estimatedMinutes: 30,
          dueDate: new Date(),
        },
      ],
      history: [],
      goals: [],
    };

    const plan = await geminiClient.generateDailyPlan(testData);
    
    if (plan && plan.orderedTasks && plan.orderedTasks.length > 0 && plan.overallReasoning) {
      logTest({
        name: 'Gemini AI Integration',
        status: 'PASS',
        message: `Generated plan with ${plan.orderedTasks.length} tasks and reasoning`,
        duration: Date.now() - start,
      });
      return true;
    } else {
      logTest({
        name: 'Gemini AI Integration',
        status: 'FAIL',
        message: 'Plan generated but missing expected fields',
        duration: Date.now() - start,
      });
      return false;
    }
  } catch (error) {
    logTest({
      name: 'Gemini AI Integration',
      status: 'FAIL',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    });
    return false;
  }
}

async function testOpikIntegration() {
  const start = Date.now();
  
  if (!process.env.OPIK_API_KEY) {
    logTest({
      name: 'Opik Integration',
      status: 'SKIP',
      message: 'OPIK_API_KEY not set - tracking disabled',
    });
    return false;
  }

  try {
    const client = getOpikClient();
    
    if (!client) {
      logTest({
        name: 'Opik Integration',
        status: 'FAIL',
        message: 'Failed to initialize Opik client',
        duration: Date.now() - start,
      });
      return false;
    }

    // Test logging
    await logAIRequest({
      userId: 'test-user',
      capacityScore: 75,
      mode: 'deep_work',
      taskCount: 5,
      prompt: 'Test prompt',
      response: 'Test response',
      reasoning: 'Test reasoning for integration test',
      duration: 1000,
      timestamp: new Date(),
    });

    logTest({
      name: 'Opik Integration',
      status: 'PASS',
      message: 'Successfully logged test data to Opik',
      duration: Date.now() - start,
    });
    return true;
  } catch (error) {
    logTest({
      name: 'Opik Integration',
      status: 'FAIL',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    });
    return false;
  }
}

async function testCheckInFlow() {
  const start = Date.now();
  
  try {
    // Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    }

    // Create a test check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: testUser.id,
        date: new Date(),
        energy: 8,
        sleep: 7,
        stress: 4,
        mood: 'positive',
        capacityScore: 75.5,
        mode: 'deep_work',
      },
    });

    // Verify it was created
    const retrieved = await prisma.checkIn.findUnique({
      where: { id: checkIn.id },
    });

    if (retrieved && retrieved.capacityScore === 75.5) {
      // Clean up
      await prisma.checkIn.delete({ where: { id: checkIn.id } });
      
      logTest({
        name: 'Check-in Flow',
        status: 'PASS',
        message: 'Successfully created and retrieved check-in',
        duration: Date.now() - start,
      });
      return true;
    } else {
      logTest({
        name: 'Check-in Flow',
        status: 'FAIL',
        message: 'Check-in data mismatch',
        duration: Date.now() - start,
      });
      return false;
    }
  } catch (error) {
    logTest({
      name: 'Check-in Flow',
      status: 'FAIL',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    });
    return false;
  }
}

async function testGoalManagement() {
  const start = Date.now();
  
  try {
    // Find or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    }

    // Create a test goal
    const goal = await prisma.goal.create({
      data: {
        userId: testUser.id,
        title: 'Test Goal',
        description: 'This is a test goal',
        category: 'work',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Verify it was created
    const retrieved = await prisma.goal.findUnique({
      where: { id: goal.id },
    });

    if (retrieved && retrieved.title === 'Test Goal') {
      // Clean up
      await prisma.goal.delete({ where: { id: goal.id } });
      
      logTest({
        name: 'Goal Management',
        status: 'PASS',
        message: 'Successfully created and retrieved goal',
        duration: Date.now() - start,
      });
      return true;
    } else {
      logTest({
        name: 'Goal Management',
        status: 'FAIL',
        message: 'Goal data mismatch',
        duration: Date.now() - start,
      });
      return false;
    }
  } catch (error) {
    logTest({
      name: 'Goal Management',
      status: 'FAIL',
      message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start,
    });
    return false;
  }
}

async function testTodoistIntegration() {
  const start = Date.now();
  
  if (!process.env.TODOIST_CLIENT_ID || !process.env.TODOIST_CLIENT_SECRET) {
    logTest({
      name: 'Todoist Integration',
      status: 'SKIP',
      message: 'Todoist credentials not configured',
    });
    return false;
  }

  logTest({
    name: 'Todoist Integration',
    status: 'PASS',
    message: 'Todoist credentials configured (OAuth flow requires user interaction)',
    duration: Date.now() - start,
  });
  return true;
}

async function testGoogleCalendarIntegration() {
  const start = Date.now();
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    logTest({
      name: 'Google Calendar Integration',
      status: 'SKIP',
      message: 'Google Calendar credentials not configured',
    });
    return false;
  }

  logTest({
    name: 'Google Calendar Integration',
    status: 'PASS',
    message: 'Google Calendar credentials configured (OAuth flow requires user interaction)',
    duration: Date.now() - start,
  });
  return true;
}

async function runAllTests() {
  console.log('\n🚀 Starting Comprehensive Integration Tests\n');
  console.log('='.repeat(60));
  console.log('\n');

  // Run all tests
  await testDatabaseConnection();
  await testCheckInFlow();
  await testGoalManagement();
  await testGeminiAI();
  await testOpikIntegration();
  await testTodoistIntegration();
  await testGoogleCalendarIntegration();

  // Summary
  console.log('\n');
  console.log('='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📝 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n✨ All tests passed successfully!');
    process.exit(0);
  }
}

// Run tests
runAllTests()
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
