import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/storage';

/**
 * GET /api/history
 * Returns all upload/post history records.
 */
export async function GET() {
  const records = getHistory();
  return NextResponse.json({ success: true, data: records });
}
