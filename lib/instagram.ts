/**
 * Instagram Graph API helpers
 *
 * Prerequisites:
 * - A Facebook Page linked to an Instagram Business or Creator account
 * - A Page Access Token with the following permissions:
 *   instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

export interface InstagramPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Step 1: Create a media container for the video story.
 * Returns the container (creation) ID.
 */
export async function createInstagramMediaContainer(
  igUserId: string,
  accessToken: string,
  videoUrl: string
): Promise<string> {
  const params = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    is_stories_compatible: 'true',
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message ?? `Failed to create Instagram media container (HTTP ${res.status})`
    );
  }

  return data.id as string;
}

/**
 * Step 2: Poll until the media container is ready (status_code === 'FINISHED').
 * Retries up to maxAttempts times with intervalMs delay between attempts.
 */
export async function waitForInstagramMediaReady(
  containerId: string,
  accessToken: string,
  maxAttempts = 30,
  intervalMs = 5000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message ?? 'Error checking Instagram media status');
    }

    if (data.status_code === 'FINISHED') {
      return;
    }

    if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
      throw new Error(`Instagram media processing failed: ${data.status_code}`);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Instagram media processing timed out');
}

/**
 * Step 3: Publish the media container as a story/reel.
 * Returns the published media ID.
 */
export async function publishInstagramMedia(
  igUserId: string,
  accessToken: string,
  creationId: string
): Promise<string> {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message ?? `Failed to publish Instagram media (HTTP ${res.status})`
    );
  }

  return data.id as string;
}

/**
 * Full flow: create container → wait → publish.
 */
export async function postInstagramStory(
  igUserId: string,
  accessToken: string,
  videoUrl: string
): Promise<InstagramPostResult> {
  try {
    const containerId = await createInstagramMediaContainer(igUserId, accessToken, videoUrl);
    await waitForInstagramMediaReady(containerId, accessToken);
    const postId = await publishInstagramMedia(igUserId, accessToken, containerId);
    return { success: true, postId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error posting to Instagram';
    return { success: false, error: message };
  }
}

/**
 * Fetch the Instagram Business Account ID linked to a Facebook Page.
 */
export async function getInstagramAccountId(
  pageId: string,
  pageAccessToken: string
): Promise<{ id: string; username?: string } | null> {
  const res = await fetch(
    `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );
  const data = await res.json();

  if (data.error || !data.instagram_business_account) {
    return null;
  }

  const igAccountId = data.instagram_business_account.id as string;

  // Fetch username
  const igRes = await fetch(
    `${GRAPH_API_BASE}/${igAccountId}?fields=username&access_token=${pageAccessToken}`
  );
  const igData = await igRes.json();

  return {
    id: igAccountId,
    username: igData.username as string | undefined,
  };
}
