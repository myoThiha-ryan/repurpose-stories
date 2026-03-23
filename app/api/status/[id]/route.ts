import { NextRequest, NextResponse } from 'next/server';
import { getHistoryRecord } from '@/lib/storage';

/**
 * GET /api/status/[id]
 * Returns the current status of an upload/post record.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = getHistoryRecord(id);

  if (!record) {
    return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: record });
}
