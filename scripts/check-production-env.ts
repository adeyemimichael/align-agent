/**
 * Quick script to check which environment variables are set
 * Run this locally to see what should be in production
 */

console.log('=== Environment Variables Check ===\n');

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'OPIK_API_KEY',
  'TODOIST_CLIENT_ID',
  'TODOIST_CLIENT_SECRET',
];

const optionalVars = [
  'OPIK_WORKSPACE',
  'OPIK_PROJECT_NAME',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'ENCRYPTION_KEY',
];

console.log('REQUIRED Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓ SET' : '✗ MISSING';
  const preview = value ? `(${value.substring(0, 20)}...)` : '';
  console.log(`  ${status} ${varName} ${preview}`);
});

console.log('\nOPTIONAL Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓ SET' : '✗ MISSING';
  const preview = value ? `(${value.substring(0, 20)}...)` : '';
  console.log(`  ${status} ${varName} ${preview}`);
});

console.log('\n=== Todoist OAuth Configuration ===');
console.log('Redirect URI should be:');
console.log(`  ${process.env.NEXTAUTH_URL}/api/integrations/todoist/callback`);
console.log('\nMake sure this is added to your Todoist App settings at:');
console.log('  https://developer.todoist.com/appconsole.html');
