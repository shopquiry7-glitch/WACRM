import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Custom Real Voice Audio Handler
 * Allows users to upload their own real human audio recording (MP3/WAV/M4A) or recorded voice
 * to be used as Maya's voice for live calls and website package pitches.
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'sounds');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, 'custom-maya-voice.mp3');
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: "Custom real voice audio saved successfully as Maya's voice!",
      url: `/sounds/custom-maya-voice.mp3?t=${Date.now()}`,
      size: buffer.length,
      filename: file.name,
    });
  } catch (error) {
    console.error('Custom voice upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload custom voice' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'sounds', 'custom-maya-voice.mp3');
    const exists = fs.existsSync(filePath);
    let size = 0;
    if (exists) {
      const stat = fs.statSync(filePath);
      size = stat.size;
    }
    return NextResponse.json({
      hasCustomVoice: exists && size > 1000,
      url: exists && size > 1000 ? '/sounds/custom-maya-voice.mp3' : null,
      size,
    });
  } catch {
    return NextResponse.json({ hasCustomVoice: false, url: null });
  }
}
