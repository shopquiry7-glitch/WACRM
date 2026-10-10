import type {
  VoiceAgent,
  VoicePhoneNumber,
  VoiceCall,
  VoiceCampaign,
  VoiceTelephonySettings,
} from '@/types/voice-calling';

export const VOICE_PERSONAS = [
  {
    id: 'maya-indian-natural',
    name: 'Maya (Real Indian Female Voice - Warm, Clear & Smooth)',
    provider: 'elevenlabs' as const,
    gender: 'Female',
    accent: 'Indian (Urdu + English Bilingual)',
    description: 'Ultra-clear, smooth natural Indian female voice speaking fluent Urdu and English. Specialist for UAE AED 299 Website & Branding Package.',
    sampleAudioText: 'Hello! Jeose Services se Maya baat kar rahi hoon. Hum aapke business ke liye Complete Website aur Branding Package provide kar rahe hain for ONLY AED 299! Free .COM domain, 1-year hosting aur Google Profile include hai. How may I assist you today?',
  },
  {
    id: 'custom-user-voice',
    name: 'Custom User Uploaded Voice (Real Voice Audio)',
    provider: 'custom' as const,
    gender: 'Custom',
    accent: 'User Uploaded Voice',
    description: 'Your own uploaded real human voice recording or recorded audio file.',
    sampleAudioText: 'Hello! This is your custom uploaded voice speaking for Jeose Services.',
  },
  {
    id: 'neerja-indian-natural',
    name: 'Neerja (Professional Indian Executive)',
    provider: 'elevenlabs' as const,
    gender: 'Female',
    accent: 'Indian English & Urdu',
    description: 'Crisp, articulate corporate Indian receptionist tone, ideal for B2B sales & hot leads.',
    sampleAudioText: 'Hello! Main Neerja baat kar rahi hoon Jeose Services se. How may I assist your business growth today?',
  },
  {
    id: 'swara-indian-hindi',
    name: 'Swara (Warm Urdu & Hindi Speaker)',
    provider: 'elevenlabs' as const,
    gender: 'Female',
    accent: 'Urdu / Hindi / English',
    description: 'Gentle, soothing Indian tone for clinics, salons, and customer reception.',
    sampleAudioText: 'Assalam-o-Alaikum aur Hello! Jeose Services mein aapka welcome hai. Main aapki booking confirm kar sakti hoon.',
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel (Warm & Empathetic)',
    provider: 'elevenlabs' as const,
    gender: 'Female',
    accent: 'American (Neutral)',
    description: 'Natural international voice for overseas global clients',
    sampleAudioText: 'Thank you for calling Jeose Services! I would be delighted to help you schedule an appointment.',
  },
];

export const INITIAL_VOICE_AGENTS: VoiceAgent[] = [
  {
    id: 'agent-receptionist-1',
    name: 'Maya - 24/7 AI Receptionist & Website Specialist (Indian Female Voice)',
    type: 'receptionist',
    status: 'active',
    voiceProvider: 'elevenlabs',
    voiceId: 'maya-indian-natural',
    voiceName: 'Maya (Real Indian Female - Clear & Smooth)',
    language: 'en-IN',
    llmModel: 'gpt-4o-mini',
    firstMessage: 'Hello! Jeose Services se Maya baat kar rahi hoon. Hum aapke business ke liye Complete Website & Branding Package provide kar rahe hain for ONLY AED 299! Custom website, free dot com domain, 1 year hosting aur company profile include hai. Main aapki kis tarah madad kar sakti hoon?',
    systemPrompt: `You are Maya, a courteous, warm, and highly persuasive Indian female AI Voice Agent for Jeose Services.
You speak fluently in a natural, polite blend of Urdu and English (Hinglish).

YOUR PRIMARY MISSION:
Explain and offer the COMPLETE BUSINESS WEBSITE & BRANDING PACKAGE for ONLY AED 299 to businesses in UAE (Dubai, Abu Dhabi, Sharjah) and Saudi Arabia.

PACKAGE DETAILS (ONLY AED 299):
1. Professional Website:
   - Custom Business Website Design
   - Free .COM Domain
   - 1-Year Premium Web Hosting
   - Professional Business Email Accounts
   - Mobile-Friendly & Responsive Design
   - Basic SEO Optimization
   - Professional Contact Form
2. Company Profile & Branding:
   - Professional Company Profile (Up to 10 Pages)
   - Custom Logo Design
   - Professional Business Card Design
   - Custom Letterhead Design
3. Google Business Profile:
   - Google Business Profile Setup & Local Map Optimization to improve online visibility
4. Pricing:
   - Complete All-In-One Package is JUST AED 299!

CONVERSATIONAL GUIDELINES:
- Greet with: "Hello! Jeose Services se Maya baat kar rahi hoon."
- If the client asks what is included or the price: "Hamara Complete Package sirf AED 299 ka hai, jisme custom website, free .com domain, 1 year hosting, official emails, 10-page company profile, logo aur Google profile setup sab include hai."
- If the client is interested: "Main aapke WhatsApp number par complete sample demo aur package brochure send kar rahi hoon."
- Offer to connect with a senior technical specialist or book an onboarding slot tomorrow at 11 AM or 3 PM.
- Always sound polite, clear, friendly, and smooth. Never sound like a machine.`,
    temperature: 0.65,
    silenceTimeoutSeconds: 12,
    interruptionHandling: true,
    transferPhoneNumber: '+971 50 505 3639',
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'agent-marketing-2',
    name: 'Maya - Outbound UAE Website Sales SDR (AED 299 Offer)',
    type: 'outbound_marketing',
    status: 'active',
    voiceProvider: 'elevenlabs',
    voiceId: 'maya-indian-natural',
    voiceName: 'Maya (Real Indian Female - Clear & Smooth)',
    language: 'en-IN',
    llmModel: 'gpt-4o',
    firstMessage: 'Hello! Jeose Services se Maya baat kar rahi hoon. I saw your business profile in UAE and wanted to quickly share our Complete Website & Branding Package for ONLY AED 299!',
    systemPrompt: `You are Maya, an energetic and professional Indian female AI Sales Development Representative calling business owners in UAE and KSA for Jeose Services.
Your goal is to introduce the AED 299 Complete Website & Branding package and qualify leads for immediate WhatsApp brochure delivery.
Package highlights: Custom Website + Free .COM domain + 1-Year Hosting + Business Emails + 10-page Company Profile + Logo Design + Google Business Profile setup for JUST AED 299.`,
    temperature: 0.70,
    silenceTimeoutSeconds: 10,
    interruptionHandling: true,
    transferPhoneNumber: '+971 50 505 3639',
    createdAt: '2026-09-20T10:30:00Z',
    updatedAt: '2026-10-05T14:15:00Z',
  },
  {
    id: 'agent-healthcare-3',
    name: 'Dr. Sarah - Clinic & Healthcare Appointment Setter',
    type: 'receptionist',
    status: 'active',
    voiceProvider: 'openai',
    voiceId: 'nova',
    voiceName: 'Nova (Energetic & Friendly)',
    language: 'en-US',
    llmModel: 'gpt-4o-mini',
    firstMessage: 'Hello! Thank you for calling Jeose Healthcare Services. Main Dr. Sarah baat kar rahi hoon, how can I help you book or reschedule your visit today?',
    systemPrompt: `You are Sarah, the dedicated AI Patient Coordinator for Jeose Healthcare Services.
1. Inquire if the patient is visiting for routine checkup or consultation.
2. Collect patient name and timing preferences.`,
    temperature: 0.60,
    silenceTimeoutSeconds: 15,
    interruptionHandling: true,
    transferPhoneNumber: '+1 (555) 442-9901',
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-10-06T16:20:00Z',
  },
];

export const INITIAL_PHONE_NUMBERS: VoicePhoneNumber[] = [
  {
    id: 'num-1',
    phoneNumber: '+971 50 505 3639',
    friendlyName: 'Jeose Services UAE Verified DID Line',
    provider: 'twilio',
    assignedAgentId: 'agent-receptionist-1',
    assignedAgentName: 'Maya - 24/7 AI Receptionist & Website Specialist',
    status: 'active',
    capabilities: { voice: true, sms: true },
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-10T14:00:00Z',
  },
  {
    id: 'num-2',
    phoneNumber: '+966 50 123 4567',
    friendlyName: 'Saudi Arabia Regional Operations Line',
    provider: 'twilio',
    assignedAgentId: 'agent-marketing-2',
    assignedAgentName: 'Maya - Outbound UAE Website Sales SDR',
    status: 'active',
    capabilities: { voice: true, sms: false },
    createdAt: '2026-09-18T09:30:00Z',
    updatedAt: '2026-09-18T09:30:00Z',
  },
  {
    id: 'num-3',
    phoneNumber: '+1 (415) 890-3421',
    friendlyName: 'US Main Office Virtual Receptionist',
    provider: 'twilio',
    assignedAgentId: 'agent-receptionist-1',
    assignedAgentName: 'Maya - 24/7 AI Receptionist & Website Specialist',
    status: 'active',
    capabilities: { voice: true, sms: true },
    createdAt: '2026-09-22T12:00:00Z',
    updatedAt: '2026-09-22T12:00:00Z',
  },
];

export const INITIAL_CALL_LOGS: VoiceCall[] = [
  {
    id: 'call-101',
    agentId: 'agent-receptionist-1',
    agentName: 'Maya - 24/7 AI Receptionist & Website Specialist',
    direction: 'inbound',
    fromNumber: '+971 50 234 8901',
    toNumber: '+971 50 505 3639',
    callerName: 'Ahmed Al-Mansoor (Dubai Business Owner)',
    status: 'completed',
    durationSeconds: 154,
    recordingUrl: 'https://cdn.example.com/audio/call-101.mp3',
    sentiment: 'positive',
    qualificationStatus: 'hot_lead',
    summary: 'Caller inquired about the AED 299 Complete Website & Branding Package. Maya explained that the package includes custom website design, free .COM domain, 1-year hosting, 10-page company profile, logo design, and Google Business Profile optimization. Client requested sample designs and invoice via WhatsApp.',
    transcript: [
      { role: 'agent', text: 'Hello! Jeose Services se Maya baat kar rahi hoon. Hum aapke business ke liye Complete Website & Branding Package provide kar rahe hain for ONLY AED 299! Main aapki kis tarah madad kar sakti hoon?', timestamp: '00:02' },
      { role: 'caller', text: 'Hello Maya! Mujhe aapka AED 299 wala website package chahiye. Isme kya kya shamil hai?', timestamp: '00:10' },
      { role: 'agent', text: 'Ji bilkul Ahmed sahib! AED 299 package me custom website design, free dot com domain, 1 year premium web hosting, business emails, 10-page company profile, custom logo design, business card design aur Google Business Profile setup sab shamil hai. Zero hidden charges!', timestamp: '00:25' },
      { role: 'caller', text: 'Yeh toh bahut zabardast offer hai. Kya aap mujhe WhatsApp par sample websites aur payment link bhej sakti hain?', timestamp: '00:42' },
      { role: 'agent', text: 'Maine sample designs aur complete package brochure aapke WhatsApp par send kar diya hai. Hamari design team 15 minutes me aapko connect karegi. Shukriya!', timestamp: '00:58' },
      { role: 'caller', text: 'Thank you Maya, your voice is very clear and smooth!', timestamp: '01:05' },
      { role: 'agent', text: 'Aapka bahut shukriya ji! Have a wonderful day ahead.', timestamp: '01:10' },
    ],
    actionItems: [
      'Dispatched AED 299 Website & Branding brochure via WhatsApp',
      'Assigned new project ticket: Ahmed Al-Mansoor (Dubai)',
      'Created Deal in Pipeline: Stage "Website Package Ordered" (AED 299)',
    ],
    costEstimate: 0.12,
    startedAt: '2026-10-10T14:15:00Z',
    endedAt: '2026-10-10T14:17:34Z',
    createdAt: '2026-10-10T14:15:00Z',
  },
  {
    id: 'call-102',
    agentId: 'agent-marketing-2',
    agentName: 'Maya - Outbound UAE Website Sales SDR',
    direction: 'outbound',
    fromNumber: '+971 50 505 3639',
    toNumber: '+971 55 234 8891',
    callerName: 'Prime Smiles Clinic (Dubai)',
    status: 'completed',
    durationSeconds: 168,
    recordingUrl: 'https://cdn.example.com/audio/call-102.mp3',
    sentiment: 'interested',
    qualificationStatus: 'hot_lead',
    summary: 'Outbound sales call by Maya offering the AED 299 Website & Branding Package. Clinic manager agreed to upgrade their website and setup Google Business Profile. WhatsApp proposal sent.',
    transcript: [
      { role: 'agent', text: 'Hello! Jeose Services se Maya baat kar rahi hoon. I saw your clinic in Dubai and wanted to share our Complete Website & Branding Package for ONLY AED 299!', timestamp: '00:03' },
      { role: 'caller', text: 'Hello Maya. What does the AED 299 package include?', timestamp: '00:12' },
      { role: 'agent', text: 'Isme complete responsive clinic website, free dot com domain, 1-year hosting, official doctor emails, 10-page company profile, logo design aur Google map listing sab include hai.', timestamp: '00:26' },
      { role: 'caller', text: 'Please send the proposal on this WhatsApp number right away.', timestamp: '00:39' },
      { role: 'agent', text: 'Maine proposal WhatsApp par send kar diya hai. Our web designer will assist you with setup tomorrow at 11 AM. Have a great day!', timestamp: '00:52' },
    ],
    actionItems: [
      'Pushed to Deals Pipeline: Stage "AED 299 Package Sold"',
      'Automated WhatsApp media brochure with website demos dispatched',
    ],
    costEstimate: 0.14,
    startedAt: '2026-10-10T11:20:00Z',
    endedAt: '2026-10-10T11:22:48Z',
    createdAt: '2026-10-10T11:20:00Z',
  },
];

export const INITIAL_CAMPAIGNS: VoiceCampaign[] = [
  {
    id: 'camp-1',
    name: 'UAE AED 299 Complete Website & Branding Outreach',
    agentId: 'agent-marketing-2',
    agentName: 'Maya - Outbound UAE Website Sales SDR',
    status: 'running',
    callingWindowStart: '09:00',
    callingWindowEnd: '18:00',
    maxConcurrentCalls: 3,
    retryAttempts: 2,
    totalLeads: 24,
    completedCalls: 18,
    answeredCalls: 14,
    qualifiedLeads: 11,
    leads: [
      { id: 'lead-c1', name: 'Prime Care Dental Clinic', phone: '+971 50 505 3639', status: 'completed', qualification: 'hot_lead', category: 'Healthcare', notes: 'Ordered AED 299 Website Package' },
      { id: 'lead-c2', name: 'Prime Smiles Ortho', phone: '+971 55 234 8891', status: 'completed', qualification: 'booked_appointment', category: 'Healthcare', notes: 'Demo meeting booked' },
      { id: 'lead-c3', name: 'Elite Derma Clinic', phone: '+971 52 901 4455', status: 'completed', qualification: 'hot_lead', category: 'Healthcare', notes: 'Requested WhatsApp brochure' },
      { id: 'lead-c4', name: 'Bright Smile Studio', phone: '+971 54 882 1100', status: 'calling', category: 'Dentist' },
      { id: 'lead-c5', name: 'Skyline Real Estate Group', phone: '+971 50 123 4567', status: 'pending', category: 'Real Estate' },
    ],
    createdAt: '2026-10-08T09:00:00Z',
    updatedAt: '2026-10-10T15:30:00Z',
  },
];

export const INITIAL_TELEPHONY_SETTINGS: VoiceTelephonySettings = {
  telephonyProvider: 'twilio',
  twilioAccountSid: '',
  twilioAuthToken: '',
  vapiApiKey: 'vapi_live_••••••••••••••••••••••••',
  retellApiKey: 'key_••••••••••••••••••••••••',
  elevenlabsApiKey: 'xi_••••••••••••••••••••••••',
  inboundWebhookUrl: 'https://api.crmverse.app/api/voice/webhook',
  statusCallbackUrl: 'https://api.crmverse.app/api/voice/status',
  recordingEnabled: true,
  autoPushLeadsToCrm: true,
  autoCreateDeals: true,
  autoSendWhatsappSummary: true,
  dailyCallLimit: 500,
  concurrencyLimit: 5,
};
