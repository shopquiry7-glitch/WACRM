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
    let buffer: Buffer | null = null;
    let filename = 'custom-maya-voice.mp3';
    let mimeType = 'audio/mpeg';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (body.base64Audio) {
        const matches = body.base64Audio.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(body.base64Audio, 'base64');
        }
        filename = body.filename || filename;
      }
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);
        filename = file.name;
        mimeType = file.type || 'audio/mpeg';
      }
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'No audio data received' }, { status: 400 });
    }

    let publicUrl = `/sounds/custom-maya-voice.mp3?t=${Date.now()}`;
    const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Attempt to write to public/sounds directory if filesystem is writable
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'sounds');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, 'custom-maya-voice.mp3');
      fs.writeFileSync(filePath, buffer);
    } catch (fsErr) {
      // On Vercel / serverless read-only environments, fallback to Base64 Data URL
      console.warn('Filesystem read-only (serverless mode), using Base64 Data URL:', fsErr);
      publicUrl = base64DataUrl;
    }

    return NextResponse.json({
      success: true,
      message: "Custom real voice audio saved successfully as Maya's voice!",
      url: publicUrl,
      dataUrl: base64DataUrl,
      size: buffer.length,
      filename,
    });
  } catch (error) {
    console.error('Custom voice upload failed:', error);
    return NextResponse.json({ error: 'Failed to process custom voice audio' }, { status: 500 });
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
