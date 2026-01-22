import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';

// GET /api/integrations/todoist/callback - Handle Todoist OAuth callback
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Todoist OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard?error=todoist_auth_failed', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_code', request.url)
      );
    }

    // Verify state matches user email
    const decodedState = Buffer.from(state || '', 'base64').toString('utf8');
    if (decodedState !== session.user.email) {
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      );
    }

    // Exchange code for access token
    const clientId = process.env.TODOIST_CLIENT_ID;
    const clientSecret = process.env.TODOIST_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/dashboard?error=todoist_not_configured', request.url)
      );
    }

    const tokenResponse = await fetch('https://todoist.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Todoist token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(
        new URL('/dashboard?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_access_token', request.url)
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_not_found', request.url)
      );
    }

    // Encrypt the access token
    const encryptedToken = encryptToken(accessToken);

    // Store integration in database
    await prisma.integration.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'todoist',
        },
      },
      update: {
        accessToken: encryptedToken,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: 'todoist',
        accessToken: encryptedToken,
      },
    });

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?success=todoist_connected', request.url)
    );
  } catch (error) {
    console.error('Todoist callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=callback_failed', request.url)
    );
  }
}
