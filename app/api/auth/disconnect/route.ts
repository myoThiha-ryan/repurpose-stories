import { NextResponse } from 'next/server';
import { clearFacebookToken } from '@/lib/storage';

/**
 * POST /api/auth/disconnect
 * Clears the stored Facebook/Instagram tokens.
 */
export async function POST() {
  clearFacebookToken();
  return NextResponse.json({ success: true });
}
