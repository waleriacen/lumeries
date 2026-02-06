import { NextRequest, NextResponse } from 'next/server';

// Pinterest OAuth Callback - exchanges code for access token
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Pinterest OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}?pinterest_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}?pinterest_error=no_code`
    );
  }

  const clientId = process.env.PINTEREST_APP_ID;
  const clientSecret = process.env.PINTEREST_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/pinterest/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}?pinterest_error=missing_config`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Pinterest token error:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}?pinterest_error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info to confirm connection
    const userResponse = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let username = 'Pinterest User';
    if (userResponse.ok) {
      const userData = await userResponse.json();
      username = userData.username || userData.business_name || 'Pinterest User';
    }

    // Redirect back to the app with the token
    // In production, you'd store this in a database or session
    // For trial/demo, we pass it as a URL parameter (short-lived)
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL!);
    redirectUrl.searchParams.set('pinterest_connected', 'true');
    redirectUrl.searchParams.set('pinterest_user', username);
    redirectUrl.searchParams.set('pinterest_token', accessToken);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Pinterest OAuth error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}?pinterest_error=unknown`
    );
  }
}
