import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Custom Real Voice Audio Handler
 * Serves and manages the user's uploaded real human voice audio file (.webm / .mp3)
 * used for Maya's live outbound and inbound call greetings.
 */

export async function POST(req: NextRequest) {
  try {
    let buffer: Buffer | null = null;
    let filename = 'custom-maya-voice.webm';
    let mimeType = 'audio/webm';

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
        mimeType = file.type || 'audio/webm';
      }
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'No audio data received' }, { status: 400 });
    }

    const ext = filename.endsWith('.mp3') ? 'mp3' : 'webm';
    let publicUrl = `/sounds/custom-maya-voice.${ext}?t=${Date.now()}`;
    const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Attempt to write to public/sounds directory
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'sounds');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, `custom-maya-voice.${ext}`), buffer);
      // Also write MP3 alias for compatibility
      fs.writeFileSync(path.join(uploadsDir, 'custom-maya-voice.mp3'), buffer);
    } catch (fsErr) {
      console.warn('Filesystem write notice (serverless mode):', fsErr);
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
    const filePathWebm = path.join(process.cwd(), 'public', 'sounds', 'custom-maya-voice.webm');
    const filePathMp3 = path.join(process.cwd(), 'public', 'sounds', 'custom-maya-voice.mp3');

    const existsWebm = fs.existsSync(filePathWebm);
    const existsMp3 = fs.existsSync(filePathMp3);

    let chosenPath = '';
    let publicUrl = '';

    if (existsWebm) {
      chosenPath = filePathWebm;
      publicUrl = '/sounds/custom-maya-voice.webm';
    } else if (existsMp3) {
      chosenPath = filePathMp3;
      publicUrl = '/sounds/custom-maya-voice.mp3';
    }

    if (chosenPath) {
      const stat = fs.statSync(chosenPath);
      if (stat.size > 1000) {
        return NextResponse.json({
          hasCustomVoice: true,
          url: publicUrl,
          size: stat.size,
          name: 'Real Human Voice Recording (AED 299 Pitch)',
        });
      }
    }

    return NextResponse.json({ hasCustomVoice: false, url: null });
  } catch {
    return NextResponse.json({ hasCustomVoice: false, url: null });
  }
}
