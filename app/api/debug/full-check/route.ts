import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Comprehensive debug endpoint
 * IMPORTANT: Remove this in production after debugging!
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    // Environment Variables Check
    envVars: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : '❌ NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set (' + process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...)' : '❌ NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ NOT SET',
    },
    
    // Database Connection Check
    database: {
      status: 'checking...',
      error: null as string | null,
    },
    
    // NextAuth Configuration
    nextAuth: {
      expectedCallbackUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'NEXTAUTH_URL not set',
      googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = '✅ Connected';
  } catch (error) {
    checks.database.status = '❌ Failed';
    checks.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Determine overall status
  const allEnvVarsSet = Object.values(checks.envVars).every(v => v.includes('✅'));
  const dbConnected = checks.database.status.includes('✅');
  
  const overallStatus = allEnvVarsSet && dbConnected ? '✅ READY' : '❌ NOT READY';

  return NextResponse.json({
    overallStatus,
    ...checks,
    instructions: {
      ifNotReady: [
        '1. Go to Vercel Dashboard → Settings → Environment Variables',
        '2. Ensure all variables are set for Production environment',
        '3. Redeploy after setting variables',
        '4. Wait 2-3 minutes for deployment to complete',
        '5. Refresh this page to check again',
      ],
      ifReady: [
        '1. Visit /login',
        '2. Click "Continue with Google"',
        '3. Should redirect to Google OAuth',
        '4. After consent, should redirect back to dashboard',
      ],
    },
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
