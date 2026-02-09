import { NextResponse } from 'next/server';

// GET /api/debug/ai-env - Debug endpoint to check AI environment variables
export async function GET() {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const opikKey = process.env.OPIK_API_KEY;
    
    return NextResponse.json({
      gemini: {
        exists: !!geminiKey,
        length: geminiKey?.length || 0,
        preview: geminiKey ? `${geminiKey.substring(0, 10)}...` : 'NOT SET',
      },
      opik: {
        exists: !!opikKey,
        length: opikKey?.length || 0,
        preview: opikKey ? `${opikKey.substring(0, 10)}...` : 'NOT SET',
      },
      opikWorkspace: process.env.OPIK_WORKSPACE || 'NOT SET',
      opikProject: process.env.OPIK_PROJECT_NAME || 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });
  } catch (error) {
    console.error('Debug AI env error:', error);
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    );
  }
}
