#!/usr/bin/env npx tsx

/**
 * Verify Production Readiness
 * This script checks if all required environment variables are present
 */

console.log('🔍 Production Readiness Check\n');
console.log('='.repeat(70));

const requiredVars = {
  'NEXTAUTH_URL': 'https://align-alpha.vercel.app',
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'DATABASE_URL': process.env.DATABASE_URL,
  'ENCRYPTION_KEY': process.env.ENCRYPTION_KEY,
  'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
};

console.log('\n📋 LOCAL ENVIRONMENT CHECK (.env file):');
console.log('-'.repeat(70));

let allPresent = true;
for (const [key, expectedValue] of Object.entries(requiredVars)) {
  const localValue = process.env[key];
  if (localValue) {
    if (key === 'NEXTAUTH_URL') {
      console.log(`✅ ${key}: ${localValue}`);
      if (localValue !== expectedValue) {
        console.log(`   ⚠️  For production, this should be: ${expectedValue}`);
      }
    } else {
      console.log(`✅ ${key}: ***set***`);
    }
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allPresent = false;
  }
}

console.log('\n📋 PRODUCTION REQUIREMENTS (Vercel):');
console.log('-'.repeat(70));
console.log('You need to set these in Vercel Dashboard:');
console.log('');
console.log('1. NEXTAUTH_URL=https://align-alpha.vercel.app');
console.log('2. NEXTAUTH_SECRET=(your secret from .env)');
console.log('3. GOOGLE_CLIENT_ID=(your client ID from .env)');
console.log('4. GOOGLE_CLIENT_SECRET=(your client secret from .env)');
console.log('5. DATABASE_URL=(your database URL from .env)');
console.log('6. ENCRYPTION_KEY=(your encryption key from .env)');
console.log('7. GEMINI_API_KEY=(your Gemini API key from .env)');

console.log('\n🔧 NEXT STEPS:');
console.log('-'.repeat(70));
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Select your project: align-alpha');
console.log('3. Go to: Settings → Environment Variables');
console.log('4. Add each variable above');
console.log('5. IMPORTANT: Select "Production" environment for each');
console.log('6. Click "Save" for each variable');
console.log('7. Go to Deployments tab and click "Redeploy"');
console.log('8. Wait 2-3 minutes');
console.log('9. Visit: https://align-alpha.vercel.app/api/debug/full-check');
console.log('10. Verify all variables show ✅');
console.log('11. Test login at: https://align-alpha.vercel.app/login');

console.log('\n📖 DETAILED GUIDE:');
console.log('-'.repeat(70));
console.log('See PRODUCTION_LOGIN_FIX.md for step-by-step instructions');

console.log('\n' + '='.repeat(70));
if (allPresent) {
  console.log('✅ Local environment is ready!');
  console.log('Now set these same values in Vercel for production.');
} else {
  console.log('❌ Some local variables are missing.');
  console.log('Fix your .env file first, then set them in Vercel.');
}
