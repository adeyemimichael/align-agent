/**
 * Diagnose and fix login configuration issues
 */

console.log('🔍 Checking Login Configuration...\n');

// Check all required environment variables
const required = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'DATABASE_URL': process.env.DATABASE_URL,
};

let allGood = true;

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    console.log(`❌ ${key}: Missing`);
    allGood = false;
  } else {
    console.log(`✅ ${key}: Set`);
  }
}

if (!allGood) {
  console.log('\n⚠️  Some environment variables are missing!');
  console.log('\nMake sure your .env file has all required variables.');
  process.exit(1);
}

console.log('\n✅ All environment variables are set!');
console.log('\n📋 Next Steps:');
console.log('1. Restart your dev server: npm run dev');
console.log('2. Clear your browser cache and cookies for localhost:3000');
console.log('3. Try signing in again');
console.log('\n💡 If still not working:');
console.log('   - Check Google Cloud Console: https://console.cloud.google.com/apis/credentials');
console.log('   - Verify redirect URI is: http://localhost:3000/api/auth/callback/google');
console.log('   - Make sure OAuth consent screen is configured');
