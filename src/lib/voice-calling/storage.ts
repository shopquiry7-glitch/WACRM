import type {
  VoiceAgent,
  VoicePhoneNumber,
  VoiceCall,
  VoiceCampaign,
  VoiceTelephonySettings,
  VoiceStatsOverview,
} from '@/types/voice-calling';
import {
  INITIAL_VOICE_AGENTS,
  INITIAL_PHONE_NUMBERS,
  INITIAL_CALL_LOGS,
  INITIAL_CAMPAIGNS,
  INITIAL_TELEPHONY_SETTINGS,
} from './presets';

const STORAGE_KEYS = {
  AGENTS: 'wacrm_voice_agents_v1',
  NUMBERS: 'wacrm_voice_phone_numbers_v1',
  CALLS: 'wacrm_voice_calls_v1',
  CAMPAIGNS: 'wacrm_voice_campaigns_v1',
  SETTINGS: 'wacrm_voice_settings_v1',
};

// Safe JSON parser helper
function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? defaultValue;
  } catch (err) {
    console.error(`Failed to read ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write ${key} to storage:`, err);
  }
}

export function getVoiceAgents(): VoiceAgent[] {
  return getStoredItem<VoiceAgent[]>(STORAGE_KEYS.AGENTS, INITIAL_VOICE_AGENTS);
}

export function saveVoiceAgent(agent: VoiceAgent): VoiceAgent[] {
  const current = getVoiceAgents();
  const index = current.findIndex((a) => a.id === agent.id);
  let updated: VoiceAgent[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...agent, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...agent,
        id: agent.id || `agent-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  setStoredItem(STORAGE_KEYS.AGENTS, updated);
  return updated;
}

export function deleteVoiceAgent(agentId: string): VoiceAgent[] {
  const current = getVoiceAgents();
  const updated = current.filter((a) => a.id !== agentId);
  setStoredItem(STORAGE_KEYS.AGENTS, updated);
  return updated;
}

export function getVoicePhoneNumbers(): VoicePhoneNumber[] {
  return getStoredItem<VoicePhoneNumber[]>(STORAGE_KEYS.NUMBERS, INITIAL_PHONE_NUMBERS);
}

export function saveVoicePhoneNumber(num: VoicePhoneNumber): VoicePhoneNumber[] {
  const current = getVoicePhoneNumbers();
  const index = current.findIndex((n) => n.id === num.id);
  let updated: VoicePhoneNumber[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...num, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...num,
        id: num.id || `num-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  setStoredItem(STORAGE_KEYS.NUMBERS, updated);
  return updated;
}

export function deleteVoicePhoneNumber(numId: string): VoicePhoneNumber[] {
  const current = getVoicePhoneNumbers();
  const updated = current.filter((n) => n.id !== numId);
  setStoredItem(STORAGE_KEYS.NUMBERS, updated);
  return updated;
}

export function getVoiceCalls(): VoiceCall[] {
  return getStoredItem<VoiceCall[]>(STORAGE_KEYS.CALLS, INITIAL_CALL_LOGS);
}

export function saveVoiceCall(call: VoiceCall): VoiceCall[] {
  const current = getVoiceCalls();
  const index = current.findIndex((c) => c.id === call.id);
  let updated: VoiceCall[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = call;
  } else {
    updated = [call, ...current];
  }
  setStoredItem(STORAGE_KEYS.CALLS, updated);
  return updated;
}

export function getVoiceCampaigns(): VoiceCampaign[] {
  return getStoredItem<VoiceCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
}

export function saveVoiceCampaign(campaign: VoiceCampaign): VoiceCampaign[] {
  const current = getVoiceCampaigns();
  const index = current.findIndex((c) => c.id === campaign.id);
  let updated: VoiceCampaign[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...campaign, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...campaign,
        id: campaign.id || `camp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  setStoredItem(STORAGE_KEYS.CAMPAIGNS, updated);
  return updated;
}

export function getVoiceTelephonySettings(): VoiceTelephonySettings {
  return getStoredItem<VoiceTelephonySettings>(STORAGE_KEYS.SETTINGS, INITIAL_TELEPHONY_SETTINGS);
}

export function saveVoiceTelephonySettings(settings: VoiceTelephonySettings): VoiceTelephonySettings {
  const updated = { ...settings, updatedAt: new Date().toISOString() };
  setStoredItem(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

export function getVoiceStats(): VoiceStatsOverview {
  const calls = getVoiceCalls();
  const numbers = getVoicePhoneNumbers();
  const agents = getVoiceAgents();

  const totalCalls = calls.length;
  const totalSeconds = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const inboundCalls = calls.filter((c) => c.direction === 'inbound');
  const inboundAnswered = inboundCalls.filter((c) => c.status === 'completed');
  const inboundAnswerRate = inboundCalls.length > 0
    ? Math.round((inboundAnswered.length / inboundCalls.length) * 100)
    : 100;

  const outboundCalls = calls.filter((c) => c.direction === 'outbound');
  const outboundAnswered = outboundCalls.filter((c) => c.status === 'completed');
  const outboundConnectRate = outboundCalls.length > 0
    ? Math.round((outboundAnswered.length / outboundCalls.length) * 100)
    : 85;

  const qualifiedLeadsCount = calls.filter(
    (c) => c.qualificationStatus === 'hot_lead' || c.qualificationStatus === 'booked_appointment'
  ).length;

  const appointmentsBookedCount = calls.filter(
    (c) => c.qualificationStatus === 'booked_appointment'
  ).length;

  return {
    totalCalls,
    totalMinutes,
    inboundAnswerRate,
    outboundConnectRate,
    qualifiedLeadsCount,
    appointmentsBookedCount,
    activeNumbersCount: numbers.filter((n) => n.status === 'active').length,
    activeAgentsCount: agents.filter((a) => a.status === 'active').length,
  };
}
