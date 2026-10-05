'use client';

/**
 * Loud Audio Notification Engine for Jeose CRM
 * Supports Apple iPhone Tri-tone (Default), iPhone Note, iPhone Ding, and WhatsApp tones.
 * Uses Web Audio API with gain amplification (up to 2.2x volume boost)
 * for loud, clear PC alert playback.
 */

export type SoundTheme = 'iphone_tritone' | 'iphone_note' | 'iphone_ding' | 'whatsapp';

export const SOUND_STORAGE_KEY = 'wacrm:notification-sound-enabled';
export const SOUND_VOLUME_STORAGE_KEY = 'wacrm:notification-sound-volume';
export const SOUND_THEME_STORAGE_KEY = 'wacrm:notification-sound-theme';
export const SOUND_CHANGE_EVENT = 'wacrm:sound-pref-change';

let sharedAudioCtx: AudioContext | null = null;
let audioUnlocked = false;

// Audio buffer cache for loaded audio files
const audioBufferCache = new Map<string, AudioBuffer>();

/**
 * Get or create the shared AudioContext.
 * Automatically unlocks on first user interaction.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }

  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume();
  }

  return sharedAudioCtx;
}

/**
 * Attach global listener to unlock AudioContext on user's first click/keypress.
 */
export function initAudioUnlock(): void {
  if (typeof window === 'undefined' || audioUnlocked) return;

  const unlock = () => {
    if (audioUnlocked) return;
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      audioUnlocked = true;
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { passive: true, once: true });
  window.addEventListener('keydown', unlock, { passive: true, once: true });
  window.addEventListener('touchstart', unlock, { passive: true, once: true });
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = window.localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== '0';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? '1' : '0');
  } catch {}
  window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
}

export function getSoundVolume(): number {
  if (typeof window === 'undefined') return 1.8; // Default 1.8 for proper loud volume
  try {
    const val = window.localStorage.getItem(SOUND_VOLUME_STORAGE_KEY);
    if (!val) return 1.8;
    const num = parseFloat(val);
    return isNaN(num) ? 1.8 : Math.max(0.2, Math.min(2.5, num));
  } catch {
    return 1.8;
  }
}

export function setSoundVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_VOLUME_STORAGE_KEY, String(volume));
  } catch {}
  window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
}

export function getSoundTheme(): SoundTheme {
  if (typeof window === 'undefined') return 'iphone_note';
  try {
    const val = window.localStorage.getItem(SOUND_THEME_STORAGE_KEY) as SoundTheme | null;
    if (val && ['iphone_note', 'iphone_tritone', 'iphone_ding', 'whatsapp'].includes(val)) {
      return val;
    }
    return 'iphone_note'; // Default to iPhone Note!
  } catch {
    return 'iphone_note';
  }
}

export function setSoundTheme(theme: SoundTheme): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SOUND_THEME_STORAGE_KEY, theme);
  } catch {}
  window.dispatchEvent(new Event(SOUND_CHANGE_EVENT));
}

/**
 * Preloads audio file into AudioBuffer
 */
async function loadAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  if (audioBufferCache.has(url)) {
    return audioBufferCache.get(url)!;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferCache.set(url, audioBuffer);
    return audioBuffer;
  } catch {
    return null;
  }
}

/**
 * Play a synthesized Marimba bar note
 */
function playMarimbaNote(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number,
  relativeGain: number
) {
  const oscSine = ctx.createOscillator();
  oscSine.type = 'sine';
  oscSine.frequency.setValueAtTime(frequency, startTime);

  // Marimba bar tuned overtone at ~3.98x
  const oscOvertone = ctx.createOscillator();
  oscOvertone.type = 'triangle';
  oscOvertone.frequency.setValueAtTime(frequency * 3.98, startTime);

  // Main gain envelope
  const toneGain = ctx.createGain();
  toneGain.gain.setValueAtTime(0.0001, startTime);
  // Crisp mallet strike attack (3ms)
  toneGain.gain.exponentialRampToValueAtTime(relativeGain, startTime + 0.006);
  // Natural exponential decay
  toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  // Overtone gain envelope (decays rapidly in ~80ms)
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.35 * relativeGain, startTime);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

  oscSine.connect(toneGain);
  oscOvertone.connect(overtoneGain);
  overtoneGain.connect(toneGain);
  toneGain.connect(destination);

  oscSine.start(startTime);
  oscOvertone.start(startTime);
  oscSine.stop(startTime + duration + 0.05);
  oscOvertone.stop(startTime + duration + 0.05);
}

/**
 * Play iPhone Tri-tone (Kelly Jacklin 158-Marimba)
 * 3 ascending notes: G5 (784Hz) -> B5 (988Hz) -> D6 (1175Hz)
 */
function playIPhoneTriTone(ctx: AudioContext, masterGain: GainNode, now: number) {
  // Note 1: G5
  playMarimbaNote(ctx, masterGain, 783.99, now + 0.01, 0.22, 0.85);
  // Note 2: B5
  playMarimbaNote(ctx, masterGain, 987.77, now + 0.14, 0.24, 0.90);
  // Note 3: D6 (rings out)
  playMarimbaNote(ctx, masterGain, 1174.66, now + 0.28, 0.55, 1.00);
}

/**
 * Play modern iPhone "Note" tone
 * Iconic 2-tone crisp marimba chime: B5 (988Hz) -> E6 (1318.5Hz)
 */
function playIPhoneNote(ctx: AudioContext, masterGain: GainNode, now: number) {
  // Prep tap at B5
  playMarimbaNote(ctx, masterGain, 987.77, now + 0.01, 0.18, 0.75);
  // Main chime at E6
  playMarimbaNote(ctx, masterGain, 1318.51, now + 0.11, 0.65, 1.00);
}

/**
 * Play iPhone "Ding" (Glass alert)
 */
function playIPhoneDing(ctx: AudioContext, masterGain: GainNode, now: number) {
  playMarimbaNote(ctx, masterGain, 1567.98, now + 0.01, 0.65, 1.00);
}

/**
 * Play WhatsApp Web chime (G5 -> C6)
 */
function playWhatsAppChime(ctx: AudioContext, masterGain: GainNode, now: number) {
  playMarimbaNote(ctx, masterGain, 784, now + 0.02, 0.14, 0.9);
  playMarimbaNote(ctx, masterGain, 1046.5, now + 0.14, 0.36, 1.0);
}

/**
 * Plays the loud notification chime with the selected theme.
 * Checks for audio files first, with instant mathematical Web Audio synthesizer fallback.
 */
export async function playLoudNotificationSound(
  themeOverride?: SoundTheme,
  volumeMultiplier?: number
): Promise<void> {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const theme = themeOverride ?? getSoundTheme();
  const volume = volumeMultiplier ?? getSoundVolume();
  const now = ctx.currentTime;

  // Master gain node for loud amplification
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  // Try playing pre-rendered WAV file with Web Audio API for 100% exact fidelity
  const wavPath =
    theme === 'iphone_tritone'
      ? '/sounds/iphone_tritone.wav'
      : theme === 'iphone_note'
      ? '/sounds/iphone_note.wav'
      : theme === 'iphone_ding'
      ? '/sounds/iphone_ding.wav'
      : null;

  let playedFromBuffer = false;
  if (wavPath) {
    try {
      const buffer = await loadAudioBuffer(ctx, wavPath);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(masterGain);
        source.start(now);
        playedFromBuffer = true;
      }
    } catch {}
  }

  // If buffer was not available, use mathematical synthesizer immediately
  if (!playedFromBuffer) {
    switch (theme) {
      case 'iphone_tritone':
        playIPhoneTriTone(ctx, masterGain, now);
        break;
      case 'iphone_ding':
        playIPhoneDing(ctx, masterGain, now);
        break;
      case 'whatsapp':
        playWhatsAppChime(ctx, masterGain, now);
        break;
      case 'iphone_note':
      default:
        playIPhoneNote(ctx, masterGain, now);
        break;
    }
  }

  // Device vibration if supported
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 200]);
    } catch {}
  }
}

/**
 * Tab title flasher when window is not focused.
 * Toggles between "🔔 New WhatsApp Message!" and original title.
 */
let flasherInterval: ReturnType<typeof setInterval> | null = null;
let originalTitle = '';

export function startTitleFlash(senderName?: string): void {
  if (typeof document === 'undefined') return;

  if (!originalTitle) {
    originalTitle = document.title;
  }

  if (flasherInterval) {
    clearInterval(flasherInterval);
  }

  const alertTitle = senderName
    ? `🔔 Message from ${senderName}!`
    : '🔔 New WhatsApp Message!';

  let isAlert = true;
  document.title = alertTitle;

  flasherInterval = setInterval(() => {
    isAlert = !isAlert;
    document.title = isAlert ? alertTitle : originalTitle;
  }, 1000);

  const stopFlash = () => {
    if (flasherInterval) {
      clearInterval(flasherInterval);
      flasherInterval = null;
    }
    if (originalTitle) {
      document.title = originalTitle;
      originalTitle = '';
    }
    window.removeEventListener('focus', stopFlash);
    document.removeEventListener('click', stopFlash);
  };

  window.addEventListener('focus', stopFlash, { once: true });
  document.addEventListener('click', stopFlash, { once: true });
}
