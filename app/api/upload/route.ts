import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { addHistoryRecord } from '@/lib/storage';
import type { Platform } from '@/types';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * POST /api/upload
 * Accepts a multipart/form-data with a "video" file and "platforms" field.
 * Saves the video to public/uploads/ and creates a history record.
 */
export async function POST(request: NextRequest) {
  try {
    ensureUploadsDir();

    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const platformsRaw = formData.get('platforms') as string | null;

    if (!videoFile) {
      return NextResponse.json({ success: false, error: 'No video file provided' }, { status: 400 });
    }

    if (!platformsRaw) {
      return NextResponse.json({ success: false, error: 'No platforms specified' }, { status: 400 });
    }

    let platforms: Platform[];
    try {
      platforms = JSON.parse(platformsRaw) as Platform[];
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid platforms format' }, { status: 400 });
    }

    if (!platforms.length) {
      return NextResponse.json({ success: false, error: 'At least one platform required' }, { status: 400 });
    }

    const ext = path.extname(videoFile.name) || '.mp4';
    const id = uuidv4();
    const filename = `${id}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const bytes = await videoFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const videoUrl = `${baseUrl}/uploads/${filename}`;

    const record = {
      id,
      filename,
      originalName: videoFile.name,
      uploadedAt: new Date().toISOString(),
      platforms,
      status: 'pending' as const,
      videoUrl,
    };

    addHistoryRecord(record);

    return NextResponse.json({ success: true, data: { id, videoUrl, filename } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
