import { NextRequest, NextResponse } from 'next/server';
import { postInstagramStory } from '@/lib/instagram';
import { postFacebookStory } from '@/lib/facebook';
import { getFacebookToken, getHistoryRecord, updateHistoryRecord } from '@/lib/storage';
import type { Platform } from '@/types';

/**
 * POST /api/post-story
 * Body: { uploadId: string, platforms: Platform[], videoUrl: string }
 * Posts the video to the selected platforms and updates the history record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { uploadId: string; platforms: Platform[]; videoUrl: string };
    const { uploadId, platforms, videoUrl } = body;

    if (!uploadId || !platforms?.length || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: uploadId, platforms, videoUrl' },
        { status: 400 }
      );
    }

    const record = getHistoryRecord(uploadId);
    if (!record) {
      return NextResponse.json({ success: false, error: 'Upload record not found' }, { status: 404 });
    }

    const tokenData = getFacebookToken();
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Not connected to Facebook. Please connect your account first.' },
        { status: 401 }
      );
    }

    updateHistoryRecord(uploadId, { status: 'publishing' });

    const results: {
      instagram?: { success: boolean; postId?: string; error?: string };
      facebook?: { success: boolean; postId?: string; error?: string };
    } = {};

    if (platforms.includes('instagram')) {
      if (!tokenData.instagramAccountId) {
        results.instagram = { success: false, error: 'No Instagram account linked to your Facebook page' };
      } else {
        results.instagram = await postInstagramStory(
          tokenData.instagramAccountId,
          tokenData.accessToken,
          videoUrl
        );
      }
    }

    if (platforms.includes('facebook')) {
      if (!tokenData.pageId) {
        results.facebook = { success: false, error: 'No Facebook page found' };
      } else {
        results.facebook = await postFacebookStory(
          tokenData.pageId,
          tokenData.accessToken,
          videoUrl
        );
      }
    }

    const allFailed =
      (platforms.includes('instagram') && results.instagram?.success === false) &&
      (platforms.includes('facebook') && results.facebook?.success === false);

    const anySuccess =
      results.instagram?.success === true || results.facebook?.success === true;

    updateHistoryRecord(uploadId, {
      status: anySuccess ? 'success' : 'error',
      instagramPostId: results.instagram?.postId,
      facebookPostId: results.facebook?.postId,
      errorMessage: allFailed
        ? [results.instagram?.error, results.facebook?.error].filter(Boolean).join('; ')
        : undefined,
    });

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to post story';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
