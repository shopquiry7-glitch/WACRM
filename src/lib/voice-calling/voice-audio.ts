// Voice audio playback and speech synthesis helper tuned for Natural Indian Female Receptionist (Priya / Neerja)

// Cache voices
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the most natural, human-sounding Indian female voice available.
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
      (v.lang === 'en-IN' || v.lang === 'hi-IN' || v.lang === 'en_IN') &&
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

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): { cancel: () => void } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    options?.onEnd?.();
    return { cancel: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Natural human Indian female voice tuning (slightly warmer pitch, polite speed)
  const indianVoice = getIndianFemaleVoice();
  if (indianVoice) {
    utterance.voice = indianVoice;
    // If it's a native Indian voice, speed 1.0 is great. If standard fallback, soften pitch
    const isNativeIndian = indianVoice.lang.includes('IN') || indianVoice.name.toLowerCase().includes('neerja') || indianVoice.name.toLowerCase().includes('heera');
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
    console.error('Speech synthesis error:', e);
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      window.speechSynthesis.cancel();
    },
  };
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
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
    recognition.lang = 'en-IN'; // Optimized for Indian English & Hindi accent

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

// Generate natural, polite Indian receptionist conversational responses
export async function generateSimulatedAgentResponse(
  userQuery: string,
  agentName: string,
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
    query.includes('waqt')
  ) {
    return {
      text: `Ji bilkul! Main aapki appointment confirm kar sakti hoon. Hamare paas kal subah 11:00 baje aur dopahar 3:30 baje ka slot available hai. Aapko kaunsa time theek rahega?`,
      action: 'Slot offered: Tomorrow 11:00 AM / 3:30 PM',
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
    query.includes('charge')
  ) {
    return {
      text: `Hamare plans sirf $49 per month se start hote hain. Isme 24/7 AI Receptionist calling, WhatsApp automation aur unlimited incoming calls include hain. Kya main aapke number par WhatsApp brochure send kar doon?`,
      action: 'Quoted: $49/mo Starter Plan',
      qualification: 'hot_lead',
    };
  }

  // 3. Human Manager / Escalation / Doctor
  if (
    query.includes('human') ||
    query.includes('manager') ||
    query.includes('doctor') ||
    query.includes('transfer') ||
    query.includes('agent') ||
    query.includes('insan') ||
    query.includes('baat karwao')
  ) {
    return {
      text: `Ji theek hai, main turant aapki call hamare senior specialist ko transfer kar rahi hoon. Kripya do second line par bane rahiye.`,
      action: 'Call transferred to senior specialist',
      qualification: 'callback_requested',
    };
  }

  // 4. Emergency / Urgent
  if (
    query.includes('urgent') ||
    query.includes('emergency') ||
    query.includes('pain') ||
    query.includes('dard') ||
    query.includes('jaldi')
  ) {
    return {
      text: `Main samajh sakti hoon! Urgent inquiry ke liye main abhi hamare on-duty specialist ko alert bhej rahi hoon. Aapka callback number note ho chuka hai, hamari team turant contact karegi.`,
      action: 'Urgent emergency escalation triggered',
      qualification: 'hot_lead',
    };
  }

  // 5. Greetings / Hello / Namaste
  if (
    query.includes('hello') ||
    query.includes('hi') ||
    query.includes('namaste') ||
    query.includes('salam') ||
    query.includes('kaise') ||
    query.includes('kya hal')
  ) {
    return {
      text: `Namaste! Main bahut acchi hoon, shukriya. Main Priya bol rahi hoon. Aaj aapko services, appointments ya pricing ke baare me kya information chahiye?`,
      action: 'Greeting acknowledged',
      qualification: 'hot_lead',
    };
  }

  // 6. Not interested / Later
  if (
    query.includes('not interested') ||
    query.includes('busy') ||
    query.includes('later') ||
    query.includes('nahi chahiye') ||
    query.includes('baad me')
  ) {
    return {
      text: `Koi baat nahi ji! Aapka bahut shukriya. Main aapke WhatsApp par ek summary bhej deti hoon taaki aap free time me dekh sakein. Have a wonderful day!`,
      action: 'Sent WhatsApp brochure fallback',
      qualification: 'not_interested',
    };
  }

  // 7. General Inquiry Response (Polite Indian Receptionist tone)
  const callerRep = agentName.split('-')[0].trim();
  return {
    text: `Ji bilkul! As ${callerRep}, main aapki poori madad kar sakti hoon. Main aapki details register kar leti hoon aur WhatsApp par confirmation bhej deti hoon. Aapko aur kya jankari chahiye?`,
    action: 'Inquiry processed & contact logged',
    qualification: 'hot_lead',
  };
}
