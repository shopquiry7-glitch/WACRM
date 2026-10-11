import { NextRequest, NextResponse } from 'next/server';

/**
 * Diagnostic & Permission Verification Endpoint for ElevenLabs Integration
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyParam = searchParams.get('apiKey');
    const effectiveKey = keyParam || process.env.ELEVENLABS_API_KEY || '';

    if (!effectiveKey) {
      return NextResponse.json({
        configured: false,
        message: 'No ElevenLabs API key provided or configured in .env.local',
      });
    }

    // Probe 1: Text-to-speech permission
    let canSynthesize = false;
    let canClone = false;
    const missingPermissions: string[] = [];

    try {
      const ttsTest = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'xi-api-key': effectiveKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'test',
          model_id: 'eleven_multilingual_v2',
        }),
      });

      if (ttsTest.ok) {
        canSynthesize = true;
      } else {
        const ttsData = await ttsTest.json().catch(() => ({}));
        const msg = ttsData?.detail?.message || '';
        if (msg.includes('missing the permission')) {
          missingPermissions.push('text_to_speech');
        }
      }
    } catch {
      // network failure
    }

    // Probe 2: Voices permissions (voices_read)
    try {
      const voicesTest = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': effectiveKey },
      });

      if (voicesTest.ok) {
        canClone = true;
      } else {
        const vData = await voicesTest.json().catch(() => ({}));
        const msg = vData?.detail?.message || '';
        if (msg.includes('missing the permission')) {
          missingPermissions.push('voices_read');
          missingPermissions.push('voices_write');
        }
      }
    } catch {
      // network failure
    }

    const isFullyFunctional = canSynthesize && canClone;

    return NextResponse.json({
      configured: true,
      isFullyFunctional,
      canSynthesize,
      canClone,
      missingPermissions,
      message: isFullyFunctional
        ? 'ElevenLabs API Key is fully active and ready for Instant Voice Cloning & Dynamic Speech!'
        : `API Key detected, but missing permissions: ${missingPermissions.join(', ')}. Please edit key in ElevenLabs dashboard and grant "Full Access".`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
