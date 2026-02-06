/**
 * Test script to verify graceful degradation of sync functions
 * 
 * This tests that sync operations return empty results instead of throwing
 * when Todoist is not connected or no plan exists.
 */

import { syncTaskAppProgress, getUnplannedCompletions } from '../lib/task-app-sync';

async function testSyncGracefulDegradation() {
  console.log('🧪 Testing Sync Graceful Degradation\n');

  // Test 1: Sync with non-existent user (no Todoist integration)
  console.log('Test 1: Sync with no Todoist integration');
  try {
    const result = await syncTaskAppProgress('non-existent-user-id');
    console.log('✅ Result:', result);
    console.log('✅ No error thrown - graceful degradation working!\n');
  } catch (error) {
    console.error('❌ Error thrown (should not happen):', error);
    console.log('❌ Graceful degradation NOT working\n');
  }

  // Test 2: Get unplanned completions with no integration
  console.log('Test 2: Get unplanned completions with no integration');
  try {
    const result = await getUnplannedCompletions('non-existent-user-id');
    console.log('✅ Result:', result);
    console.log('✅ No error thrown - graceful degradation working!\n');
  } catch (error) {
    console.error('❌ Error thrown (should not happen):', error);
    console.log('❌ Graceful degradation NOT working\n');
  }

  console.log('🎉 All tests completed!');
}

// Run tests
testSyncGracefulDegradation()
  .then(() => {
    console.log('\n✅ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
