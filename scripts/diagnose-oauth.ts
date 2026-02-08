#!/usr/bin/env tsx

/**
 * Diagnose OAuth Configuration Issues
 * This script helps identify mismatches between local and production OAuth setup
 */

console.log('🔍 OAuth Configuration Diagnostic\n');
console.log('='.repeat(60));

// Check local environment
console.log('\n📋 LOCAL ENVIRONMENT (.env file):');
console.log('─'.repeat(60));
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ NOT SET'}`);
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '***set***' : '❌ NOT SET'}`);

// Expected production values
console.log('\n📋 EXPECTED PRODUCTION VALUES (Vercel):');
console.log('─'.repeat(60));
console.log('NEXTAUTH_URL: https://align-alpha.vercel.app');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}... (same as local)`);
console.log('GOOGLE_CLIENT_SECRET: ***should match local***');

// OAuth Configuration from screenshot
console.log('\n📋 GOOGLE CLOUD CONSOLE CONFIGURATION:');
console.log('─'.repeat(60));
console.log('Authorized JavaScript origins:');
console.log('  ✅ https://align-alpha.vercel.app');
console.log('  ✅ http://localhost:3000');
console.log('\nAuthorized redirect URIs:');
console.log('  ✅ https://align-alpha.vercel.app/api/auth/callback/google');
console.log('  ✅ https://align-alpha.vercel.app/api/integrations/google-calendar/callback');
console.log('  ✅ http://localhost:3000/api/auth/callback/google');
console.log('  ✅ http://localhost:3000/api/integrations/google-calendar/callback');

console.log('\n🔧 TROUBLESHOOTING STEPS:');
console.log('─'.repeat(60));
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Verify these variables are set for Production:');
console.log('   - NEXTAUTH_URL=https://align-alpha.vercel.app');
console.log(`   - GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}`);
console.log('   - GOOGLE_CLIENT_SECRET=(your secret from Google Console)');
console.log('   - NEXTAUTH_SECRET=(your secret key)');
console.log('   - DATABASE_URL=(your database connection string)');
console.log('\n3. After setting/updating variables, REDEPLOY your application');
console.log('4. The error "OAuth client was not found" means Vercel is using');
console.log('   different credentials than what\'s configured in Google Console');
console.log('\n5. Double-check the Client ID in Vercel matches exactly:');
console.log(`   ${process.env.GOOGLE_CLIENT_ID}`);

console.log('\n💡 COMMON ISSUES:');
console.log('─'.repeat(60));
console.log('❌ NEXTAUTH_URL still set to http://localhost:3000 in Vercel');
console.log('❌ GOOGLE_CLIENT_ID/SECRET not set in Vercel at all');
console.log('❌ Using a different Google OAuth client for production');
console.log('❌ Environment variables set but deployment not redeployed');
console.log('❌ Variables set for Preview/Development but not Production');

console.log('\n✅ VERIFICATION:');
console.log('─'.repeat(60));
console.log('After fixing, test by:');
console.log('1. Visit https://align-alpha.vercel.app/login');
console.log('2. Click "Sign in with Google"');
console.log('3. Should redirect to Google OAuth consent screen');
console.log('4. After consent, should redirect back to your app');
