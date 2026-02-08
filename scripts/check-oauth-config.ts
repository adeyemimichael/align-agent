#!/usr/bin/env tsx

/**
 * Check OAuth Configuration
 * Verifies that all required OAuth environment variables are set
 */

console.log('🔍 Checking OAuth Configuration...\n');

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'DATABASE_URL'
];

let allSet = true;

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'NEXTAUTH_URL' ? value : '***set***'}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allSet = false;
  }
}

console.log('\n📋 Next Steps:');
if (!allSet) {
  console.log('1. Set missing environment variables in Vercel dashboard');
  console.log('2. Update Google OAuth redirect URIs to include production URL');
  console.log('3. Redeploy your application');
} else {
  console.log('✅ All required variables are set!');
  console.log('\nMake sure your Google OAuth redirect URIs include:');
  console.log(`   ${process.env.NEXTAUTH_URL}/api/auth/callback/google`);
}
