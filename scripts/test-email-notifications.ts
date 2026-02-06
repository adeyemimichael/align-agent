/**
 * Test Email Notifications
 * Verifies that email notifications are configured correctly
 */

import { testEmailConfiguration } from '../lib/email';

async function main() {
  console.log('🧪 Testing Email Notification Configuration...\n');

  // Check if RESEND_API_KEY is set
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set in .env file');
    console.log('\nTo enable email notifications:');
    console.log('1. Sign up at https://resend.com');
    console.log('2. Get your API key');
    console.log('3. Add to .env: RESEND_API_KEY="your-api-key"');
    console.log('4. Optionally set EMAIL_FROM="Your Name <email@yourdomain.com>"');
    process.exit(1);
  }

  console.log('✅ RESEND_API_KEY is set');
  console.log(`📧 Email from: ${process.env.EMAIL_FROM || 'Adaptive Productivity Agent <notifications@adaptiveproductivity.app>'}\n`);

  // Prompt for test email
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('❌ Please provide a test email address');
    console.log('\nUsage: npm run test:email your-email@example.com');
    process.exit(1);
  }

  console.log(`📨 Sending test email to: ${testEmail}...\n`);

  // Send test email
  const success = await testEmailConfiguration(testEmail);

  if (success) {
    console.log('\n✅ Test email sent successfully!');
    console.log('Check your inbox (and spam folder) for the test email.');
  } else {
    console.log('\n❌ Failed to send test email');
    console.log('Check the error messages above for details.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
