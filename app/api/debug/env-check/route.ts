import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables
 * IMPORTANT: Remove or protect this endpoint in production!
 */
export async function GET() {
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV,
    
    // Show partial values for debugging (not full secrets)
    NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID_PREFIX: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
  };

  return NextResponse.json(envCheck);
}
