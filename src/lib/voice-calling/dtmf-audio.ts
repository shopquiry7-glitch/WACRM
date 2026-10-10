// DTMF Dual-Tone Multi-Frequency & Phone Ringback Sound Generator via Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

/**
 * Plays authentic DTMF tone for a telephone keypad button
 */
export function playDtmfTone(char: string, durationMs = 120): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = DTMF_FREQUENCIES[char];
  if (!freqs) return;

  try {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freqs[0], ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freqs[1], ctx.currentTime);

    // Smooth attack and release to avoid audio click
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

    osc1.stop(ctx.currentTime + durationMs / 1000);
    osc2.stop(ctx.currentTime + durationMs / 1000);
  } catch (err) {
    console.warn('DTMF audio playback error:', err);
  }
}

/**
 * Plays international telephone ringback tone (ring... ring...)
 */
export function playRingbackTone(): { stop: () => void } {
  const ctx = getAudioContext();
  if (!ctx) return { stop: () => {} };

  let isPlaying = true;
  let osc1: OscillatorNode | null = null;
  let osc2: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const triggerRingBurst = () => {
    if (!isPlaying || !ctx) return;

    try {
      osc1 = ctx.createOscillator();
      osc2 = ctx.createOscillator();
      gainNode = ctx.createGain();

      // Standard telecom ringback frequencies: 440Hz + 480Hz
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime + 1.8);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);

      // Repeat after 4 seconds total interval
      timeoutId = setTimeout(() => {
        if (isPlaying) {
          triggerRingBurst();
        }
      }, 4000);
    } catch {
      // ignore
    }
  };

  triggerRingBurst();

  return {
    stop: () => {
      isPlaying = false;
      if (timeoutId) clearTimeout(timeoutId);
      try {
        osc1?.stop();
        osc2?.stop();
      } catch {
        // ignore
      }
    },
  };
}
