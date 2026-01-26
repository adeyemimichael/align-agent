/**
 * Quick App Test
 * Verifies the app is ready for demo
 */

import { config } from 'dotenv';
config();

console.log('\n🔍 Quick App Readiness Check\n');
console.log('='.repeat(60));

// Check environment variables
const checks = [
  {
    name: 'Database',
    check: !!process.env.DATABASE_URL,
    required: true,
  },
  {
    name: 'NextAuth Secret',
    check: !!process.env.NEXTAUTH_SECRET,
    required: true,
  },
  {
    name: 'Google OAuth',
    check: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    required: true,
  },
  {
    name: 'Gemini AI',
    check: !!process.env.GEMINI_API_KEY,
    required: true,
  },
  {
    name: 'Todoist Integration',
    check: !!process.env.TODOIST_CLIENT_ID && !!process.env.TODOIST_CLIENT_SECRET,
    required: false,
  },
  {
    name: 'Opik Tracking',
    check: !!process.env.OPIK_API_KEY,
    required: false,
  },
];

let allRequired = true;

checks.forEach((item) => {
  const icon = item.check ? '✅' : item.required ? '❌' : '⏭️';
  const status = item.check ? 'Configured' : item.required ? 'MISSING (Required)' : 'Not configured (Optional)';
  console.log(`${icon} ${item.name}: ${status}`);
  
  if (item.required && !item.check) {
    allRequired = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allRequired) {
  console.log('\n✨ App is ready for demo!');
  console.log('\nNext steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Open http://localhost:3000');
  console.log('3. Sign in with Google');
  console.log('4. Complete a check-in');
  console.log('5. View your analytics at /analytics');
  console.log('\n🎉 Have a great demo!\n');
} else {
  console.log('\n⚠️  Some required configurations are missing.');
  console.log('Please check the items marked with ❌ above.\n');
  process.exit(1);
}
