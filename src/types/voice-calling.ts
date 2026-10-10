export type AgentType = 'receptionist' | 'outbound_marketing' | 'lead_qualifier' | 'support';
export type AgentStatus = 'active' | 'inactive' | 'archived';
export type VoiceProvider = 'elevenlabs' | 'openai' | 'cartesia' | 'deepgram' | 'custom';
export type TelephonyProvider = 'twilio' | 'vapi' | 'retell' | 'bland';

export interface VoiceAgent {
  id: string;
  accountId?: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  voiceProvider: VoiceProvider;
  voiceId: string;
  voiceName: string;
  language: string;
  llmModel: string;
  firstMessage: string;
  systemPrompt: string;
  temperature: number;
  silenceTimeoutSeconds: number;
  interruptionHandling: boolean;
  transferPhoneNumber?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VoicePhoneNumber {
  id: string;
  accountId?: string;
  phoneNumber: string;
  friendlyName: string;
  provider: 'twilio' | 'telnyx' | 'plivo' | 'vapi';
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: 'active' | 'pending' | 'released';
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed' | 'cancelled';
export type CallSentiment = 'positive' | 'neutral' | 'negative' | 'interested' | 'objection';
export type CallQualification = 'hot_lead' | 'booked_appointment' | 'callback_requested' | 'not_interested' | 'unqualified';

export interface CallTranscriptTurn {
  role: 'agent' | 'caller';
  text: string;
  timestamp: string;
}

export interface VoiceCall {
  id: string;
  accountId?: string;
  agentId?: string;
  agentName?: string;
  contactId?: string;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  callerName?: string;
  status: CallStatus;
  durationSeconds: number;
  recordingUrl?: string;
  sentiment: CallSentiment;
  qualificationStatus: CallQualification;
  summary?: string;
  transcript: CallTranscriptTurn[];
  actionItems: string[];
  costEstimate: number;
  metadata?: Record<string, unknown>;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

export type CampaignStatus = 'draft' | 'running' | 'paused' | 'completed' | 'failed';

export interface CampaignLead {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'calling' | 'completed' | 'failed' | 'unreachable';
  callId?: string;
  qualification?: CallQualification;
  notes?: string;
  category?: string;
}

export interface VoiceCampaign {
  id: string;
  accountId?: string;
  name: string;
  agentId?: string;
  agentName?: string;
  status: CampaignStatus;
  callingWindowStart: string;
  callingWindowEnd: string;
  maxConcurrentCalls: number;
  retryAttempts: number;
  totalLeads: number;
  completedCalls: number;
  answeredCalls: number;
  qualifiedLeads: number;
  leads: CampaignLead[];
  createdAt: string;
  updatedAt: string;
}

export interface VoiceTelephonySettings {
  id?: string;
  accountId?: string;
  telephonyProvider: TelephonyProvider;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  vapiApiKey?: string;
  retellApiKey?: string;
  elevenlabsApiKey?: string;
  inboundWebhookUrl?: string;
  statusCallbackUrl?: string;
  recordingEnabled: boolean;
  autoPushLeadsToCrm: boolean;
  autoCreateDeals: boolean;
  autoSendWhatsappSummary: boolean;
  dailyCallLimit: number;
  concurrencyLimit: number;
  updatedAt?: string;
}

export interface VoiceStatsOverview {
  totalCalls: number;
  totalMinutes: number;
  inboundAnswerRate: number;
  outboundConnectRate: number;
  qualifiedLeadsCount: number;
  appointmentsBookedCount: number;
  activeNumbersCount: number;
  activeAgentsCount: number;
}
