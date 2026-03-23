import { NextResponse } from 'next/server';

/**
 * GET /api/auth/facebook
 * Initiates the Facebook OAuth flow by redirecting to the Facebook login dialog.
 */
export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!appId || !baseUrl) {
    return NextResponse.json(
      { error: 'Missing FACEBOOK_APP_ID or NEXT_PUBLIC_BASE_URL environment variables' },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
  ].join(',');

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state,
  });

  const facebookOAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;

  return NextResponse.redirect(facebookOAuthUrl);
}
