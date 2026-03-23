import { NextRequest, NextResponse } from 'next/server';
import { exchangeForLongLivedToken, getUserPages } from '@/lib/facebook';
import { getInstagramAccountId } from '@/lib/instagram';
import { saveFacebookToken } from '@/lib/storage';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

/**
 * GET /api/auth/facebook/callback
 * Handles the OAuth callback from Facebook.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const message = errorDescription ?? error;
    return NextResponse.redirect(
      `${baseUrl}/connect?error=${encodeURIComponent(message)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/connect?error=No+authorization+code+received`);
  }

  if (!appId || !appSecret) {
    return NextResponse.redirect(
      `${baseUrl}/connect?error=Missing+Facebook+app+credentials+in+environment`
    );
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

    // Exchange code for short-lived access token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${tokenParams.toString()}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message ?? 'Failed to obtain access token');
    }

    const shortLivedToken = tokenData.access_token as string;

    // Exchange for long-lived token
    const longLived = await exchangeForLongLivedToken(shortLivedToken, appId, appSecret);
    const accessToken = longLived.access_token;
    const expiresAt = longLived.expires_in
      ? Date.now() + longLived.expires_in * 1000
      : undefined;

    // Fetch managed pages to get a page access token
    const pages = await getUserPages(accessToken);

    let pageId: string | undefined;
    let pageName: string | undefined;
    let instagramAccountId: string | undefined;
    let instagramUsername: string | undefined;
    let pageAccessToken = accessToken;

    if (pages.length > 0) {
      const page = pages[0]; // Use the first page
      pageId = page.id;
      pageName = page.name;
      pageAccessToken = page.access_token;

      // Fetch linked Instagram account
      const igAccount = await getInstagramAccountId(page.id, page.access_token);
      if (igAccount) {
        instagramAccountId = igAccount.id;
        instagramUsername = igAccount.username;
      }
    }

    // Store tokens
    saveFacebookToken({
      accessToken: pageAccessToken,
      pageId,
      pageName,
      instagramAccountId,
      instagramUsername,
      expiresAt,
    });

    return NextResponse.redirect(`${baseUrl}/connect?success=1`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(
      `${baseUrl}/connect?error=${encodeURIComponent(message)}`
    );
  }
}
