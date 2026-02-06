import { NextResponse } from 'next/server';

// Pinterest OAuth 2.0 Login - initiates the OAuth flow
export async function GET() {
  const clientId = process.env.PINTEREST_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/pinterest/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Pinterest App ID not configured' }, { status: 500 });
  }

  // Pinterest OAuth scopes needed for creating pins
  const scopes = [
    'boards:read',
    'boards:write',
    'pins:read',
    'pins:write',
    'user_accounts:read'
  ].join(',');

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = new URL('https://www.pinterest.com/oauth/');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('state', state);

  // Redirect to Pinterest OAuth page
  return NextResponse.redirect(authUrl.toString());
}
