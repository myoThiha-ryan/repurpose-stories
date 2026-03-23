import { NextResponse } from 'next/server';
import { getFacebookToken } from '@/lib/storage';

/**
 * GET /api/auth/status
 * Returns whether the user has connected their Facebook/Instagram account.
 */
export async function GET() {
  const token = getFacebookToken();

  if (!token) {
    return NextResponse.json({
      success: true,
      data: { connected: false },
    });
  }

  const isExpired = token.expiresAt ? token.expiresAt < Date.now() : false;

  return NextResponse.json({
    success: true,
    data: {
      connected: !isExpired,
      expired: isExpired,
      pageName: token.pageName,
      pageId: token.pageId,
      instagramUsername: token.instagramUsername,
      instagramAccountId: token.instagramAccountId,
    },
  });
}
