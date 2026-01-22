import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET /api/integrations/todoist/connect - Initiate Todoist OAuth flow
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.TODOIST_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/todoist/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Todoist client ID not configured' },
        { status: 500 }
      );
    }

    // Build Todoist OAuth URL
    const scope = 'data:read_write';
    const state = Buffer.from(session.user.email).toString('base64');
    
    const authUrl = new URL('https://todoist.com/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() }, { status: 200 });
  } catch (error) {
    console.error('Todoist connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
