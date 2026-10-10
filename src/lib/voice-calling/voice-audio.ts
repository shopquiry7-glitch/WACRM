// Voice audio playback and speech synthesis helper tuned for Natural Indian Female Receptionist (Priya / Neerja)
// Provides studio-grade real audio streaming (Urdu + English) with graceful SpeechSynthesis fallback.

// Active audio reference for cancelling / interrupting
let currentAudio: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the most natural, human-sounding Indian female voice available on the client device.
 * Prioritizes Microsoft Neerja (Natural India), Microsoft Swara (Hindi Natural),
 * Google English (India), Veena, Kaveri, or falls back to a gentle female voice tuned with Indian receptionist cadence.
 */
export function getIndianFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Premium Natural Indian Female Voices (Edge / Windows 11 / Chrome / Mac)
  const indianFemaleNames = [
    'neerja', // Microsoft Neerja Online (Natural) - English (India)
    'swara',  // Microsoft Swara Online (Natural) - Hindi (India)
    'heera',  // Microsoft Heera - English (India)
    'veena',  // Apple Veena (India)
    'kaveri', // Kaveri (India)
    'lekha',  // Lekha (Hindi)
    'priya',
    'geeta',
    'sunita',
  ];

  for (const targetName of indianFemaleNames) {
    const matched = voices.find(
      (v) => v.name.toLowerCase().includes(targetName)
    );
    if (matched) return matched;
  }

  // 2. Any voice tagged with en-IN or hi-IN containing "female" or "natural"
  const enInFemale = voices.find(
    (v) =>
      (v.lang === 'en-IN' || v.lang === 'hi-IN' || v.lang === 'en_IN' || v.lang === 'ur-PK' || v.lang === 'ur') &&
      !v.name.toLowerCase().includes('male') &&
      !v.name.toLowerCase().includes('ravi') &&
      !v.name.toLowerCase().includes('madhav')
  );
  if (enInFemale) return enInFemale;

  // 3. Any Indian regional voice
  const anyIndian = voices.find((v) => v.lang.includes('IN') || v.name.includes('India'));
  if (anyIndian) return anyIndian;

  // 4. Natural warm female fallback (tuned to sound polite & human)
  const warmFemale =
    voices.find((v) => v.name.includes('Natural') && (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Female'))) ||
    voices.find((v) => v.name.includes('Google UK English Female') || v.name.includes('Samantha')) ||
    voices.find((v) => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male')) ||
    voices[0];

  return warmFemale || null;
}

/**
 * Fallback to browser SpeechSynthesis if audio stream is unavailable
 */
function fallbackSpeechSynthesis(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const indianVoice = getIndianFemaleVoice();

    if (indianVoice) {
      utterance.voice = indianVoice;
      const isNativeIndian =
        indianVoice.lang.includes('IN') ||
        indianVoice.name.toLowerCase().includes('neerja') ||
        indianVoice.name.toLowerCase().includes('heera');
      utterance.pitch = options?.pitch ?? (isNativeIndian ? 1.05 : 1.1);
      utterance.rate = options?.rate ?? 0.98;
    } else {
      utterance.pitch = options?.pitch ?? 1.1;
      utterance.rate = options?.rate ?? 0.96;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };
    utterance.onend = () => {
      options?.onEnd?.();
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis fallback error:', e);
      options?.onError?.(e);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Fallback synthesis failed:', err);
    options?.onEnd?.();
  }
}

/**
 * High-quality speech player.
 * Uses real, smooth, crystal-clear Indian female audio stream (Urdu + English) via /api/voice/tts.
 * Automatically falls back to local synthesis if offline.
 */
export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): { cancel: () => void } {
  if (typeof window === 'undefined') {
    options?.onEnd?.();
    return { cancel: () => {} };
  }

  // Stop any previous playing audio or synthesis
  stopSpeaking();

  const trimmedText = text.trim();
  if (!trimmedText) {
    options?.onEnd?.();
    return { cancel: () => {} };
  }

  let isCancelled = false;

  try {
    // Stream real, clear human audio from /api/voice/tts
    const url = `/api/voice/tts?text=${encodeURIComponent(trimmedText)}${
      options?.lang ? `&lang=${encodeURIComponent(options.lang)}` : ''
    }`;

    const audio = new Audio(url);
    currentAudio = audio;

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (currentAudio === audio) {
        currentAudio = null;
      }
      options?.onEnd?.();
    };

    audio.onplay = () => {
      if (!isCancelled) {
        options?.onStart?.();
      }
    };

    audio.onended = () => {
      finish();
    };

    audio.onerror = () => {
      if (isCancelled) return;
      console.warn('Audio streaming failed, falling back to local speech synthesis');
      if (currentAudio === audio) {
        currentAudio = null;
      }
      fallbackSpeechSynthesis(trimmedText, options);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (isCancelled) return;
        console.warn('Audio autoplay prevented or error, falling back to speech synthesis:', err);
        fallbackSpeechSynthesis(trimmedText, options);
      });
    }

    return {
      cancel: () => {
        isCancelled = true;
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
        if (currentAudio === audio) {
          currentAudio = null;
        }
        stopSpeaking();
      },
    };
  } catch (err) {
    console.warn('Failed to initialize Audio, using speech synthesis fallback:', err);
    fallbackSpeechSynthesis(trimmedText, options);

    return {
      cancel: () => {
        stopSpeaking();
      },
    };
  }
}

export function stopSpeaking(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

// Browser Microphone Speech Recognition Helper
export function startMicRecognition(
  onTranscript: (text: string) => void,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): { stop: () => void } {
  if (typeof window === 'undefined') {
    return { stop: () => {} };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    console.warn('Speech Recognition not supported in this browser');
    onError?.('Speech recognition not supported in this browser');
    return { stop: () => {} };
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Optimized for Indian English & Hindi/Urdu accent

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text = event.results[0]?.[0]?.transcript;
      if (text) {
        onTranscript(text);
      }
    };

    recognition.onend = () => {
      onEnd?.();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event);
      onError?.(event);
      onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch (err) {
    onError?.(err);
    return { stop: () => {} };
  }
}

// Generate natural, polite Indian receptionist conversational responses in bilingual Urdu + English
export async function generateSimulatedAgentResponse(
  userQuery: string,
  _agentName: string,
  _agentPrompt: string
): Promise<{
  text: string;
  action?: string;
  qualification?: 'hot_lead' | 'booked_appointment' | 'callback_requested' | 'not_interested' | 'unqualified';
}> {
  const query = userQuery.toLowerCase().trim();

  // 1. Appointments & Meetings
  if (
    query.includes('book') ||
    query.includes('appointment') ||
    query.includes('schedule') ||
    query.includes('slot') ||
    query.includes('meeting') ||
    query.includes('milna') ||
    query.includes('waqt') ||
    query.includes('visit')
  ) {
    return {
      text: `Ji bilkul! Jeose Services ke behalf par main aapki appointment book kar sakti hoon. Kal morning 11:00 AM ya afternoon 3:30 PM ka slot available hai. Which time suits you best?`,
      action: 'Offered slots: Tomorrow 11:00 AM / 3:30 PM',
      qualification: 'booked_appointment',
    };
  }

  // 2. Pricing & Cost
  if (
    query.includes('price') ||
    query.includes('cost') ||
    query.includes('package') ||
    query.includes('fee') ||
    query.includes('rate') ||
    query.includes('kitna') ||
    query.includes('karcha') ||
    query.includes('charge') ||
    query.includes('pricing')
  ) {
    return {
      text: `Jeose Services ke plans sirf $49 per month se start hote hain. Isme 24/7 AI Voice Calling, WhatsApp CRM automation aur unlimited customer calls include hain. Shall I send complete package details on your WhatsApp?`,
      action: 'Quoted: $49/mo Starter Plan for Jeose Services',
      qualification: 'hot_lead',
    };
  }

  // 3. Human Manager / Escalation / Consultant
  if (
    query.includes('human') ||
    query.includes('manager') ||
    query.includes('doctor') ||
    query.includes('transfer') ||
    query.includes('agent') ||
    query.includes('insan') ||
    query.includes('baat karwao') ||
    query.includes('senior')
  ) {
    return {
      text: `Ji theek hai, main turant aapki call Jeose Services ke senior consultant ko transfer kar rahi hoon. Kripya do second line par bane rahiye. Connecting you right now.`,
      action: 'Call transferred to Jeose Services senior consultant',
      qualification: 'callback_requested',
    };
  }

  // 4. Emergency / Urgent
  if (
    query.includes('urgent') ||
    query.includes('emergency') ||
    query.includes('pain') ||
    query.includes('dard') ||
    query.includes('jaldi') ||
    query.includes('help')
  ) {
    return {
      text: `Main samajh sakti hoon! Yeh urgent matter hai. Main Jeose Services ki on-duty support team ko turant alert bhej rahi hoon. Our team will contact you right away.`,
      action: 'Urgent emergency escalation triggered for Jeose Services',
      qualification: 'hot_lead',
    };
  }

  // 5. Greetings / Hello / Namaste / Salam
  if (
    query.includes('hello') ||
    query.includes('hi') ||
    query.includes('namaste') ||
    query.includes('salam') ||
    query.includes('assalam') ||
    query.includes('kaise') ||
    query.includes('kya hal')
  ) {
    return {
      text: `Hello! Jeose Services mein aapka welcome hai. Main Priya baat kar rahi hoon. Main aapki kis tarah madad kar sakti hoon? How may I assist you today?`,
      action: 'Greeting acknowledged in bilingual Urdu & English',
      qualification: 'hot_lead',
    };
  }

  // 6. Not interested / Later
  if (
    query.includes('not interested') ||
    query.includes('busy') ||
    query.includes('later') ||
    query.includes('nahi chahiye') ||
    query.includes('baad me') ||
    query.includes('no')
  ) {
    return {
      text: `Koi baat nahi ji! Jeose Services ko apna time dene ke liye shukriya. Main aapke WhatsApp par ek summary bhej deti hoon so you can review whenever convenient. Have a wonderful day!`,
      action: 'Sent WhatsApp brochure fallback',
      qualification: 'not_interested',
    };
  }

  // 7. General Inquiry Response (Polite Indian Receptionist in Urdu + English)
  return {
    text: `Ji bilkul! Jeose Services mein ham aapko AI Voice Calling, WhatsApp CRM automation aur automated lead solutions provide karte hain. Would you like to know more about our features or schedule a live demo?`,
    action: 'Inquiry processed & contact logged for Jeose Services',
    qualification: 'hot_lead',
  };
}
