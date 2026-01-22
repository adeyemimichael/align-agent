import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/encryption';

// GET /api/integrations/google-calendar/callback - Handle Google Calendar OAuth callback
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
      console.error('Google Calendar OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard?error=google_calendar_auth_failed', request.url)
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/dashboard?error=google_not_configured', request.url)
      );
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(
        new URL('/dashboard?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in; // seconds

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

    // Encrypt the tokens
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store integration in database
    await prisma.integration.upsert({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'google_calendar',
        },
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        platform: 'google_calendar',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: expiresAt,
      },
    });

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?success=google_calendar_connected', request.url)
    );
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=callback_failed', request.url)
    );
  }
}
