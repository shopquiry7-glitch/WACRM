import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * High-fidelity Natural Indian Female Voice Audio Streamer
 * Generates clear, smooth, natural audio speaking Urdu and English.
 * Returns native MP3 audio buffer directly playable by HTML5 Audio.
 */

// Helper to chunk text for natural human cadence (max ~180 chars per phrase)
function chunkText(text: string, maxLen = 180): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  // Match sentences or clauses ending in punctuation
  const sentenceMatches = clean.match(/[^.!?,\n]+[.!?,\n]*/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const part of sentenceMatches) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);

      if (trimmed.length > maxLen) {
        // Fallback: split long clauses by words
        const words = trimmed.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + ' ' + word).trim().length <= maxLen) {
            wordChunk = (wordChunk + ' ' + word).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        if (wordChunk) chunks.push(wordChunk);
        current = '';
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [clean.slice(0, maxLen)];
}

// Auto-detect Urdu / Hindi or Indian English for maximum smoothness and natural pronunciation
function detectBestVoiceLang(text: string, requestedLang?: string | null): string {
  if (requestedLang && ['hi', 'ur', 'en-IN', 'hi-IN'].includes(requestedLang)) {
    return requestedLang === 'hi-IN' ? 'hi' : requestedLang;
  }

  const lower = text.toLowerCase();
  // Common Roman Urdu / Hindi markers spoken by Indian/Pakistani receptionists
  const urduHindiKeywords = [
    'mein', 'aap', 'aapka', 'aapki', 'madad', 'bol', 'rahi', 'hoon', 'hai', 'hain',
    'shukriya', 'bilkul', 'theek', 'ji', 'kripya', 'swagat', 'khushamdeed', 'namaste',
    'salam', 'assalam', 'kaise', 'bataiye', 'sakti', 'sakta', 'services', 'karna',
    'bhej', 'kal', 'subah', 'dopahar', 'waqt', 'samajh', 'tarah', 'chahiye'
  ];

  const hasUrduHindiWords = urduHindiKeywords.some((w) => {
    const regex = new RegExp(`\\b${w}\\b`, 'i');
    return regex.test(lower);
  });

  // Google 'hi' (Hindi/Urdu female) produces extremely clear and smooth pronunciation of romanized Hindustani/Urdu
  if (hasUrduHindiWords) {
    return 'hi';
  }

  // Pure English defaults to en-IN for natural Indian English female cadence
  return 'en-IN';
}

async function fetchAudioChunk(textChunk: string, targetLang: string): Promise<Uint8Array | null> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    textChunk
  )}&tl=${encodeURIComponent(targetLang)}&client=tw-ob`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
        Referer: 'https://translate.google.com/',
      },
      // Cache-friendly
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`TTS fetch chunk failed with status ${res.status}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.error('TTS chunk fetch error:', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text')?.trim();
    const langParam = searchParams.get('lang');

    if (!text) {
      return NextResponse.json({ error: 'Text query parameter is required' }, { status: 400 });
    }

    // If custom real voice file exists on server, serve it directly
    try {
      const customPath = path.join(process.cwd(), 'public', 'sounds', 'custom-maya-voice.mp3');
      if (fs.existsSync(customPath)) {
        const stats = fs.statSync(customPath);
        if (stats.size > 1000) {
          const fileBuffer = fs.readFileSync(customPath);
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': fileBuffer.length.toString(),
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
    } catch {
      // proceed with dynamic stream
    }

    // Determine optimal voice language
    const lang = detectBestVoiceLang(text, langParam);

    // Break into human conversational chunks
    const chunks = chunkText(text, 180);

    // Fetch chunks sequentially or in small parallel batches
    const audioBuffers: Uint8Array[] = [];
    for (const chunk of chunks) {
      const audio = await fetchAudioChunk(chunk, lang);
      if (audio && audio.length > 0) {
        audioBuffers.push(audio);
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'Failed to generate voice audio' }, { status: 502 });
    }

    // Concatenate MP3 frames
    const totalBytes = audioBuffers.reduce((sum, b) => sum + b.length, 0);
    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    for (const buf of audioBuffers) {
      merged.set(buf, offset);
      offset += buf.length;
    }

    return new Response(merged, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(totalBytes),
        'Cache-Control': 'public, max-age=604800, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error in /api/voice/tts:', error);
    return NextResponse.json({ error: 'Internal TTS error' }, { status: 500 });
  }
}
