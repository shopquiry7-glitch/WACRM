import { NextRequest, NextResponse } from 'next/server';

/**
 * High-fidelity Dynamic Text-To-Speech (TTS) Engine
 * Synthesizes dynamic text into human speech using:
 * 1. ElevenLabs Cloned Voice (when cloned voice ID and API key are available)
 * 2. Natural Neural Multilingual TTS (Urdu, Hindi, Indian English)
 * 
 * NOTE: Never returns static audio files. Always generates speech for the given text!
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
  // Common Roman Urdu / Hindi markers spoken by Pakistani/Indian receptionists
  const urduHindiKeywords = [
    'mein', 'aap', 'aapka', 'aapki', 'madad', 'bol', 'rahi', 'hoon', 'hai', 'hain',
    'shukriya', 'bilkul', 'theek', 'ji', 'kripya', 'swagat', 'khushamdeed', 'namaste',
    'salam', 'assalam', 'kaise', 'bataiye', 'sakti', 'sakta', 'services', 'karna',
    'bhej', 'kal', 'subah', 'dopahar', 'waqt', 'samajh', 'tarah', 'chahiye', 'sirf'
  ];

  const hasUrduHindiWords = urduHindiKeywords.some((w) => {
    const regex = new RegExp(`\\b${w}\\b`, 'i');
    return regex.test(lower);
  });

  if (hasUrduHindiWords) {
    return 'hi';
  }

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

async function handleSynthesize(
  text: string,
  voiceId?: string | null,
  langParam?: string | null,
  apiKeyParam?: string | null
): Promise<Response> {
  const trimmed = text.trim();
  if (!trimmed) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  const effectiveApiKey =
    apiKeyParam ||
    process.env.ELEVENLABS_API_KEY ||
    '';

  // 1. If voiceId is provided and we have an ElevenLabs API key, synthesize via ElevenLabs
  if (
    voiceId &&
    voiceId !== 'neural_custom_clone' &&
    voiceId !== 'default' &&
    effectiveApiKey &&
    !effectiveApiKey.includes('••••')
  ) {
    try {
      const elUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
      const elRes = await fetch(elUrl, {
        method: 'POST',
        headers: {
          'xi-api-key': effectiveApiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.85,
            style: 0.1,
            use_speaker_boost: true,
          },
        }),
      });

      if (elRes.ok) {
        const audioBuffer = await elRes.arrayBuffer();
        return new Response(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
            'Cache-Control': 'no-cache',
            'X-Voice-Engine': 'ElevenLabs-Clone',
          },
        });
      } else {
        const errJson = await elRes.text();
        console.warn('ElevenLabs TTS failed, falling back to neural:', errJson);
      }
    } catch (elErr) {
      console.warn('ElevenLabs fetch failed, falling back to neural:', elErr);
    }
  }

  // 2. High-fidelity Neural Multilingual Speech Synthesizer fallback
  const lang = detectBestVoiceLang(trimmed, langParam);
  const chunks = chunkText(trimmed, 180);

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
      'X-Voice-Engine': 'Neural-Multilingual',
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    const voiceId = searchParams.get('voiceId');
    const lang = searchParams.get('lang');
    const apiKey = searchParams.get('apiKey') || req.headers.get('x-elevenlabs-key');

    if (!text) {
      return NextResponse.json({ error: 'Text query parameter is required' }, { status: 400 });
    }

    return await handleSynthesize(text, voiceId, lang, apiKey);
  } catch (error) {
    console.error('Error in GET /api/voice/tts:', error);
    return NextResponse.json({ error: 'Internal TTS error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, lang, apiKey } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required in body' }, { status: 400 });
    }

    return await handleSynthesize(text, voiceId, lang, apiKey);
  } catch (error) {
    console.error('Error in POST /api/voice/tts:', error);
    return NextResponse.json({ error: 'Internal TTS error' }, { status: 500 });
  }
}
