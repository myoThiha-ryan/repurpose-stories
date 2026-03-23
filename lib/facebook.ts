/**
 * Facebook Graph API helpers
 *
 * Prerequisites:
 * - A Facebook Page Access Token with pages_show_list, pages_read_engagement permissions
 * - The page must have video stories capability enabled
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

export interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

/**
 * Exchange a user access token for a long-lived token.
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
): Promise<{ access_token: string; expires_in?: number }> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? 'Failed to exchange for long-lived token');
  }

  return data as { access_token: string; expires_in?: number };
}

/**
 * Get all Facebook Pages the user manages, with their page access tokens.
 */
export async function getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
  const res = await fetch(
    `${GRAPH_API_BASE}/me/accounts?fields=id,name,access_token&access_token=${userAccessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? 'Failed to fetch user pages');
  }

  return (data.data ?? []) as FacebookPage[];
}

/**
 * Post a video story to a Facebook Page using the video_stories endpoint.
 *
 * The Facebook Stories API uses a two-phase upload:
 *   Phase 1 (start): obtain an upload session ID
 *   Phase 2 (finish): provide the publicly accessible video URL
 */
export async function postFacebookStory(
  pageId: string,
  pageAccessToken: string,
  videoUrl: string
): Promise<FacebookPostResult> {
  try {
    // Phase 1: Start the upload session
    const startParams = new URLSearchParams({
      upload_phase: 'start',
      access_token: pageAccessToken,
    });

    const startRes = await fetch(`${GRAPH_API_BASE}/${pageId}/video_stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: startParams.toString(),
    });

    const startData = await startRes.json();

    if (!startRes.ok || startData.error) {
      throw new Error(
        startData.error?.message ??
          `Failed to start Facebook video story upload (HTTP ${startRes.status})`
      );
    }

    const uploadSessionId = startData.video_id as string;

    // Phase 2: Finish the upload with the video URL
    const finishParams = new URLSearchParams({
      upload_phase: 'finish',
      video_id: uploadSessionId,
      video_url: videoUrl,
      access_token: pageAccessToken,
    });

    const finishRes = await fetch(`${GRAPH_API_BASE}/${pageId}/video_stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: finishParams.toString(),
    });

    const finishData = await finishRes.json();

    if (!finishRes.ok || finishData.error) {
      throw new Error(
        finishData.error?.message ??
          `Failed to finish Facebook video story upload (HTTP ${finishRes.status})`
      );
    }

    return { success: true, postId: uploadSessionId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error posting to Facebook';
    return { success: false, error: message };
  }
}

/**
 * Verify a Facebook access token and return basic user info.
 */
export async function verifyToken(accessToken: string): Promise<{ id: string; name: string } | null> {
  try {
    const res = await fetch(`${GRAPH_API_BASE}/me?fields=id,name&access_token=${accessToken}`);
    const data = await res.json();
    if (data.error) return null;
    return { id: data.id as string, name: data.name as string };
  } catch {
    return null;
  }
}
