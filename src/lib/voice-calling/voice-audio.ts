import { getCustomVoiceSync, DEFAULT_ELEVENLABS_KEY } from '@/lib/voice-calling/custom-voice-db';

let currentAudio: HTMLAudioElement | null = null;

/**
 * High-quality Speech Player for Maya & Voice Agents.
 * Dynamically synthesizes ANY given text in the user's active cloned voice or neural voice.
 * 
 * IMPORTANT: Never plays the static reference recording file as speech for dynamic text.
 * The user's uploaded voice sample is cloned to speak whatever dynamic text is requested.
 */
export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    voiceId?: string;
    apiKey?: string;
    audioUrl?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): { cancel: () => void } {
  if (typeof window === 'undefined') {
    options?.onEnd?.();
    return { cancel: () => {} };
  }

  stopSpeaking();

  const trimmedText = text.trim();
  if (!trimmedText && !options?.audioUrl) {
    options?.onEnd?.();
    return { cancel: () => {} };
  }

  let isCancelled = false;

  try {
    // 1. Retrieve persistent cloned voice settings
    const clonedRecord = getCustomVoiceSync();
    const effectiveVoiceId =
      options?.voiceId ||
      (clonedRecord?.voiceId && clonedRecord.voiceId !== 'neural_custom_clone'
        ? clonedRecord.voiceId
        : 'EXAVITQu4vr4xnSDxMaL');
    const effectiveApiKey = options?.apiKey || clonedRecord?.apiKey || DEFAULT_ELEVENLABS_KEY;

    // 2. Build dynamic audio URL (direct audio file if explicitly provided, else dynamic TTS)
    const audioUrl =
      options?.audioUrl ||
      `/api/voice/tts?text=${encodeURIComponent(trimmedText)}${
        effectiveVoiceId ? `&voiceId=${encodeURIComponent(effectiveVoiceId)}` : ''
      }${options?.lang ? `&lang=${encodeURIComponent(options.lang)}` : ''}${
        effectiveApiKey ? `&apiKey=${encodeURIComponent(effectiveApiKey)}` : ''
      }`;

    const audio = new Audio(audioUrl);
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

    audio.onerror = (e) => {
      if (isCancelled) return;
      console.warn('Dynamic speech playback error:', e);
      if (currentAudio === audio) {
        currentAudio = null;
      }
      options?.onError?.(e);
      finish();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (isCancelled) return;
        console.warn('Audio play notice (user interaction or codec):', err);
        finish();
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
    console.warn('Speech playback initialization notice:', err);
    options?.onEnd?.();

    return {
      cancel: () => {
        stopSpeaking();
      },
    };
  }
}

/**
 * Dedicated preview player for the user's raw uploaded reference sample recording.
 * Only called when the user explicitly clicks "Listen to original sample audio".
 */
export function playSampleRecording(
  audioUrl: string,
  onStart?: () => void,
  onEnd?: () => void
): { stop: () => void } {
  stopSpeaking();
  const audio = new Audio(audioUrl);
  currentAudio = audio;

  audio.onplay = () => onStart?.();
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
    onEnd?.();
  };
  audio.onerror = () => {
    if (currentAudio === audio) currentAudio = null;
    onEnd?.();
  };

  audio.play().catch(() => onEnd?.());

  return {
    stop: () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      if (currentAudio === audio) currentAudio = null;
    },
  };
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
    recognition.lang = 'en-IN';

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

/**
 * Generate Maya's natural, persuasive conversational responses in bilingual Urdu + English
 * specifically pitching the COMPLETE BUSINESS WEBSITE & BRANDING PACKAGE FOR ONLY AED 299!
 */
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

  // 1. Inquiries about the AED 299 Website & Branding Package / Pricing / Cost
  if (
    query.includes('website') ||
    query.includes('package') ||
    query.includes('price') ||
    query.includes('cost') ||
    query.includes('299') ||
    query.includes('kitna') ||
    query.includes('karcha') ||
    query.includes('offer') ||
    query.includes('domain') ||
    query.includes('hosting') ||
    query.includes('logo') ||
    query.includes('branding') ||
    query.includes('profile')
  ) {
    return {
      text: `Ji bilkul! Hamara Complete Business Website & Branding Package sirf AED 299 ka hai! Isme custom professional website, free .COM domain, 1-year premium web hosting, official business emails, 10-page company profile, custom logo design, business card design aur Google Business Profile setup sab shamil hai. Kya main aapke WhatsApp par live demo link aur sample design bhej doon?`,
      action: 'Pitch delivered: AED 299 Complete Website & Branding Package',
      qualification: 'hot_lead',
    };
  }

  // 2. WhatsApp Brochure / Sample Demos
  if (
    query.includes('whatsapp') ||
    query.includes('send') ||
    query.includes('bhej') ||
    query.includes('brochure') ||
    query.includes('details') ||
    query.includes('sample') ||
    query.includes('link') ||
    query.includes('demo')
  ) {
    return {
      text: `Done! Maine complete AED 299 Website & Branding Package brochure aur sample portfolio aapke WhatsApp number par bhej di hai. Hamare senior web designer 15 minutes mein aapko connect karenge to start your project. Have a wonderful day!`,
      action: 'Sent AED 299 Website Brochure via WhatsApp',
      qualification: 'hot_lead',
    };
  }

  // 3. Appointments, Meetings & Design Consultations
  if (
    query.includes('book') ||
    query.includes('appointment') ||
    query.includes('schedule') ||
    query.includes('slot') ||
    query.includes('meeting') ||
    query.includes('milna') ||
    query.includes('waqt') ||
    query.includes('kal') ||
    query.includes('time')
  ) {
    return {
      text: `Ji bilkul! Maya aapki onboarding appointment confirm kar sakti hai. Hamare paas kal subah 11:00 AM ya afternoon 3:00 PM ka slot available hai to discuss your website design. Which time suits you best?`,
      action: 'Slot offered: Tomorrow 11:00 AM / 3:00 PM',
      qualification: 'booked_appointment',
    };
  }

  // 4. Human Specialist / Manager / Developer
  if (
    query.includes('human') ||
    query.includes('manager') ||
    query.includes('developer') ||
    query.includes('designer') ||
    query.includes('transfer') ||
    query.includes('agent') ||
    query.includes('insan') ||
    query.includes('baat karwao') ||
    query.includes('senior')
  ) {
    return {
      text: `Ji theek hai, main turant aapki call Jeose Services ke senior web designer aur project manager ko transfer kar rahi hoon. Please hold for two seconds while I connect you.`,
      action: 'Call transferred to Senior Web Designer',
      qualification: 'callback_requested',
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
      text: `Hello! Jeose Services se Maya baat kar rahi hoon. Hum UAE aur KSA businesses ke liye Complete Website & Branding Package provide kar rahe hain for ONLY AED 299! Professional website, free .COM domain, 1-year hosting, 10-page company profile aur Google profile sab include hai. Main aapki kis tarah madad kar sakti hoon?`,
      action: 'Maya introduced AED 299 Website & Branding Package',
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
      text: `Koi baat nahi ji! Jeose Services ko apna waqt dene ke liye shukriya. Main aapke WhatsApp par ek summary bhej deti hoon taaki aap free time me hamara AED 299 package dekh sakein. Have a great day!`,
      action: 'Sent WhatsApp brochure fallback',
      qualification: 'not_interested',
    };
  }

  // 7. General Questions / Features
  return {
    text: `Ji bilkul! Jeose Services mein hum aapke business ko professional online identity dete hain with custom website, logo, company profile aur Google maps setup for just AED 299. Would you like to get started today?`,
    action: 'AED 299 Website consultation active',
    qualification: 'hot_lead',
  };
}
