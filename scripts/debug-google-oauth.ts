/**
 * Debug script to check Google OAuth configuration
 */

console.log('=== Google OAuth Configuration Debug ===\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('   GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '✗ Missing');
console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');

// Show actual values (first/last 4 chars only for security)
if (process.env.GOOGLE_CLIENT_ID) {
  const id = process.env.GOOGLE_CLIENT_ID;
  console.log(`\n2. Client ID (partial): ${id.substring(0, 10)}...${id.substring(id.length - 10)}`);
  console.log(`   Length: ${id.length} characters`);
  console.log(`   Has quotes: ${id.includes('"') ? '✗ YES (PROBLEM!)' : '✓ No'}`);
  console.log(`   Has newlines: ${id.includes('\n') ? '✗ YES (PROBLEM!)' : '✓ No'}`);
  console.log(`   Has spaces: ${id.includes(' ') ? '✗ YES (PROBLEM!)' : '✓ No'}`);
}

// Show what the redirect URI should be
console.log('\n3. Expected Redirect URIs:');
const baseUrl = process.env.NEXTAUTH_URL || 'https://your-app.vercel.app';
console.log(`   NextAuth: ${baseUrl}/api/auth/callback/google`);
console.log(`   Google Calendar: ${baseUrl}/api/integrations/google-calendar/callback`);

console.log('\n4. Steps to Fix:');
console.log('   a) Go to: https://console.cloud.google.com/apis/credentials');
console.log('   b) Find your OAuth 2.0 Client ID');
console.log('   c) Add these Authorized redirect URIs:');
console.log(`      - ${baseUrl}/api/auth/callback/google`);
console.log(`      - ${baseUrl}/api/integrations/google-calendar/callback`);
console.log('   d) Make sure Authorized JavaScript origins includes:');
console.log(`      - ${baseUrl}`);
console.log('\n5. If still not working, create a NEW OAuth 2.0 Client ID');
console.log('   - Application type: Web application');
console.log('   - Add the redirect URIs above');
console.log('   - Update your .env with the new credentials');
