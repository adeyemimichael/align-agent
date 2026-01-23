// Check if all required environment variables are set
import 'dotenv/config';

const required = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
];

const optional = [
  'ENCRYPTION_KEY',
  'TODOIST_CLIENT_ID',
  'TODOIST_CLIENT_SECRET',
  'OPIK_API_KEY',
];

console.log('🔍 Checking Environment Variables...\n');

let allGood = true;

console.log('Required Variables:');
required.forEach((key) => {
  const value = process.env[key];
  if (value && value !== `your-${key.toLowerCase().replace(/_/g, '-')}`) {
    console.log(`✅ ${key}: Set`);
  } else {
    console.log(`❌ ${key}: Missing or placeholder`);
    allGood = false;
  }
});

console.log('\nOptional Variables:');
optional.forEach((key) => {
  const value = process.env[key];
  if (value && value !== `your-${key.toLowerCase().replace(/_/g, '-')}`) {
    console.log(`✅ ${key}: Set`);
  } else {
    console.log(`⚠️  ${key}: Not set (optional)`);
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('\nDatabase URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('Please check your .env file.');
  process.exit(1);
}
