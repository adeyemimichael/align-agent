/**
 * Test script to verify all fixes are working
 */

console.log('🧪 Testing All Fixes\n');

// Test 1: Notification Cron Job
console.log('1️⃣ Testing Notification Cron Job...');
fetch('http://localhost:3000/api/cron/notifications', { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('   ✅ Cron job working');
      console.log(`   📊 Results: ${data.results.checkInReminders} check-ins, ${data.results.taskReminders} tasks`);
    } else {
      console.log('   ❌ Cron job failed');
    }
  })
  .catch(err => {
    console.log('   ⚠️  Server not running or error:', err.message);
  });

// Test 2: Check README
console.log('\n2️⃣ Checking README...');
const fs = require('fs');
const readme = fs.readFileSync('README.md', 'utf8');

const checks = [
  { name: 'Live link', pattern: /align-adeyemimichaels-projects\.vercel\.app/ },
  { name: 'Discord handle', pattern: /adeyemi12345/ },
  { name: 'No placeholder Twitter', pattern: /your-twitter-handle/, shouldNotExist: true },
  { name: 'No placeholder LinkedIn', pattern: /your-linkedin/, shouldNotExist: true },
];

checks.forEach(check => {
  const found = check.pattern.test(readme);
  if (check.shouldNotExist) {
    if (!found) {
      console.log(`   ✅ ${check.name} removed`);
    } else {
      console.log(`   ❌ ${check.name} still present`);
    }
  } else {
    if (found) {
      console.log(`   ✅ ${check.name} present`);
    } else {
      console.log(`   ❌ ${check.name} missing`);
    }
  }
});

// Test 3: Check vercel.json
console.log('\n3️⃣ Checking vercel.json...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercelConfig.crons && vercelConfig.crons.length > 0) {
  console.log('   ✅ Cron configuration present');
  console.log(`   📅 Schedule: ${vercelConfig.crons[0].schedule}`);
  console.log(`   🔗 Path: ${vercelConfig.crons[0].path}`);
} else {
  console.log('   ❌ Cron configuration missing');
}

// Test 4: Check files exist
console.log('\n4️⃣ Checking new files...');
const filesToCheck = [
  'app/api/cron/notifications/route.ts',
  'app/api/integrations/google-calendar/events/route.ts',
  'IMPLEMENTATION_SUMMARY.md',
  'FINAL_CHECKLIST.md',
  'FIXES_NEEDED.md',
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('\n✨ Test complete!\n');
console.log('📝 Next steps:');
console.log('   1. Review FINAL_CHECKLIST.md');
console.log('   2. Test features manually in browser');
console.log('   3. Commit and push to trigger deployment');
console.log('   4. Verify in production');
