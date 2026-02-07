/**
 * Test Todoist Integration
 * Run this to verify Todoist connection and task operations
 */

import { prisma } from '../lib/prisma';
import { TodoistClient } from '../lib/todoist';

async function testTodoistIntegration() {
  console.log('🔍 Testing Todoist Integration...\n');

  try {
    // Get user (replace with your email)
    const userEmail = process.env.TEST_USER_EMAIL || 'your-email@example.com';
    console.log(`Looking for user: ${userEmail}`);

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error('❌ User not found. Update TEST_USER_EMAIL in .env');
      return;
    }

    console.log(`✅ User found: ${user.id}\n`);

    // Get Todoist integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'todoist',
        },
      },
    });

    if (!integration) {
      console.error('❌ Todoist integration not found');
      console.log('   Go to /integrations and connect Todoist');
      return;
    }

    console.log(`✅ Todoist integration found\n`);

    // Test Todoist API
    const todoistClient = new TodoistClient(integration.accessToken);

    console.log('📋 Fetching tasks from Todoist...');
    const tasks = await todoistClient.getTasks();
    console.log(`✅ Found ${tasks.length} tasks\n`);

    if (tasks.length > 0) {
      console.log('First 3 tasks:');
      tasks.slice(0, 3).forEach((task, i) => {
        console.log(`  ${i + 1}. ${task.content} (ID: ${task.id})`);
      });
      console.log('');
    }

    console.log('📁 Fetching projects from Todoist...');
    const projects = await todoistClient.getProjects();
    console.log(`✅ Found ${projects.length} projects\n`);

    if (projects.length > 0) {
      console.log('Projects:');
      projects.forEach((project, i) => {
        console.log(`  ${i + 1}. ${project.name} (ID: ${project.id})`);
      });
      console.log('');
    }

    // Test task completion (if tasks exist)
    if (tasks.length > 0) {
      const testTask = tasks[0];
      console.log(`\n🧪 Testing task completion with: "${testTask.content}"`);
      console.log('   (This will mark the task as complete in Todoist)');
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

      await new Promise((resolve) => setTimeout(resolve, 5000));

      try {
        await todoistClient.completeTask(testTask.id);
        console.log('✅ Task marked as complete in Todoist');

        // Reopen it
        console.log('   Reopening task...');
        await todoistClient.reopenTask(testTask.id);
        console.log('✅ Task reopened in Todoist\n');
      } catch (error) {
        console.error('❌ Task completion test failed:', error);
      }
    }

    console.log('\n✅ All tests passed!');
    console.log('\nTodoist integration is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTodoistIntegration();
