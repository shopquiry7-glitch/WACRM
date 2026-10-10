// Voice audio playback and speech synthesis helper for the live interactive sandbox

export function speakText(
  text: string,
  options?: {
    voiceId?: string;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): { cancel: () => void } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment');
    options?.onEnd?.();
    return { cancel: () => {} };
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  // Attempt to select a high quality natural English voice
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice =
    voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

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

// Generate realistic AI simulated response based on user input
export async function generateSimulatedAgentResponse(
  userQuery: string,
  agentName: string,
  agentPrompt: string
): Promise<{ text: string; action?: string; qualification?: 'hot_lead' | 'booked_appointment' | 'callback_requested' | 'not_interested' | 'unqualified' }> {
  const query = userQuery.toLowerCase().trim();

  // Fast client response generation with natural conversation intelligence
  if (query.includes('book') || query.includes('appointment') || query.includes('schedule') || query.includes('slot') || query.includes('meeting')) {
    return {
      text: `Certainly! I would be delighted to assist you with booking that. We have slots available tomorrow at 11:00 AM or 3:30 PM. Which time suits your schedule best?`,
      action: 'Slot offered: Tomorrow 11:00 AM / 3:30 PM',
      qualification: 'booked_appointment',
    };
  }

  if (query.includes('price') || query.includes('cost') || query.includes('package') || query.includes('fee') || query.includes('kitna')) {
    return {
      text: `Our plans start at $49 per month, which includes 24/7 AI Receptionist calling, WhatsApp automation, and multi-tenant CRM seats with zero per-user charges. Would you like me to send you the full breakdown on WhatsApp?`,
      action: 'Quoted pricing: $49/mo',
      qualification: 'hot_lead',
    };
  }

  if (query.includes('human') || query.includes('agent') || query.includes('manager') || query.includes('transfer') || query.includes('doctor')) {
    return {
      text: `I understand completely. Let me immediately connect you to our senior specialist on line 1. Please stay on the line for just a moment while I transfer you.`,
      action: 'Call transferred to senior specialist',
      qualification: 'callback_requested',
    };
  }

  if (query.includes('urgent') || query.includes('pain') || query.includes('emergency')) {
    return {
      text: `I hear you, and we prioritize urgent inquiries right away! I am notifying our on-call team right this second. Please share your callback number so our doctor can call back immediately.`,
      action: 'Urgent escalation triggered',
      qualification: 'hot_lead',
    };
  }

  if (query.includes('not interested') || query.includes('busy') || query.includes('later')) {
    return {
      text: `No worries at all! Thank you for letting me know. I can send you a quick 1-page summary on WhatsApp so you can review it whenever you have time. Have a wonderful rest of your day!`,
      action: 'Sent WhatsApp brochure fallback',
      qualification: 'not_interested',
    };
  }

  if (query.includes('urdu') || query.includes('hindi') || query.includes('kya hal') || query.includes('salam')) {
    return {
      text: `Walaikum Assalam! Jee bilkul, hamari AI Receptionist Urdu aur Hindi dono mein fluently baat kar sakti hai. Aap appointments book kar sakte hain ya customer inquiries handle karwa sakte hain. Aap ki kya madad karoon?`,
      action: 'Language switched to Urdu/Hindi',
      qualification: 'hot_lead',
    };
  }

  // General conversational reply
  return {
    text: `Thank you for sharing that with me. As ${agentName.split('-')[0].trim()}, I can immediately take care of your inquiry, register your contact details, and follow up directly on WhatsApp. What would you like to explore next?`,
    action: 'Inquiry processed',
    qualification: 'hot_lead',
  };
}
