import { NextResponse } from 'next/server';

// GET /api/ai/status - Check if AI services are configured
export async function GET() {
  try {
    const geminiConfigured = !!process.env.GEMINI_API_KEY;
    const opikConfigured = !!process.env.OPIK_API_KEY;

    return NextResponse.json({
      gemini: {
        configured: geminiConfigured,
        status: geminiConfigured ? 'active' : 'not_configured',
      },
      opik: {
        configured: opikConfigured,
        status: opikConfigured ? 'active' : 'not_configured',
      },
    });
  } catch (error) {
    console.error('AI status check error:', error);
    return NextResponse.json(
      {
        gemini: { configured: false, status: 'error' },
        opik: { configured: false, status: 'error' },
      },
      { status: 500 }
    );
  }
}
