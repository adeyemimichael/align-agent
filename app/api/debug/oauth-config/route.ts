import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check OAuth configuration
 * This helps verify what environment variables are actually loaded in production
 * 
 * IMPORTANT: Remove this endpoint after debugging!
 */
export async function GET() {
  return NextResponse.json({
    nextauthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'NOT SET',
    googleClientIdSuffix: process.env.GOOGLE_CLIENT_ID?.substring(process.env.GOOGLE_CLIENT_ID.length - 20) || 'NOT SET',
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  });
}
