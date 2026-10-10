-- 044_ai_voice_calling.sql: Multi-Tenant AI Voice Receptionist & Outbound Lead Calling Agent SaaS
-- Enables 24/7 AI Voice Receptionist, Inbound Telephony, Outbound Marketing Campaigns, Call Transcripts, and Provider Credentials per Tenant.

-- ============================================================
-- 1. VOICE AGENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'receptionist' CHECK (type IN ('receptionist', 'outbound_marketing', 'lead_qualifier', 'support')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  voice_provider TEXT NOT NULL DEFAULT 'elevenlabs' CHECK (voice_provider IN ('elevenlabs', 'openai', 'cartesia', 'deepgram')),
  voice_id TEXT NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM', -- Rachel
  voice_name TEXT NOT NULL DEFAULT 'Rachel (Warm & Professional)',
  language TEXT NOT NULL DEFAULT 'en-US',
  llm_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  first_message TEXT NOT NULL DEFAULT 'Hello! Thank you for calling. How may I assist you today?',
  system_prompt TEXT NOT NULL,
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.70,
  silence_timeout_seconds INT NOT NULL DEFAULT 15,
  interruption_handling BOOLEAN NOT NULL DEFAULT true,
  transfer_phone_number TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. VOICE PHONE NUMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  friendly_name TEXT NOT NULL DEFAULT 'Main Office Hotline',
  provider TEXT NOT NULL DEFAULT 'twilio' CHECK (provider IN ('twilio', 'telnyx', 'plivo', 'vapi')),
  assigned_agent_id UUID REFERENCES voice_agents(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'released')),
  capabilities JSONB NOT NULL DEFAULT '{"voice": true, "sms": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. VOICE CALLS & LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES voice_agents(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  direction TEXT NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  caller_name TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'ringing', 'in-progress', 'completed', 'busy', 'no-answer', 'failed', 'cancelled')),
  duration_seconds INT NOT NULL DEFAULT 0,
  recording_url TEXT,
  sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative', 'interested', 'objection')),
  qualification_status TEXT NOT NULL DEFAULT 'unqualified' CHECK (qualification_status IN ('hot_lead', 'booked_appointment', 'callback_requested', 'not_interested', 'unqualified')),
  summary TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { role: 'agent'|'caller', text: string, timestamp: string }
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cost_estimate NUMERIC(8,4) NOT NULL DEFAULT 0.0000,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. OUTBOUND MARKETING CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agent_id UUID REFERENCES voice_agents(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'failed')),
  calling_window_start TEXT NOT NULL DEFAULT '09:00',
  calling_window_end TEXT NOT NULL DEFAULT '18:00',
  max_concurrent_calls INT NOT NULL DEFAULT 2,
  retry_attempts INT NOT NULL DEFAULT 1,
  total_leads INT NOT NULL DEFAULT 0,
  completed_calls INT NOT NULL DEFAULT 0,
  answered_calls INT NOT NULL DEFAULT 0,
  qualified_leads INT NOT NULL DEFAULT 0,
  leads_data JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { id, name, phone, status, call_id, notes }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. TELEPHONY & SAAS INTEGRATION SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_telephony_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  telephony_provider TEXT NOT NULL DEFAULT 'twilio' CHECK (telephony_provider IN ('twilio', 'vapi', 'retell', 'bland')),
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  vapi_api_key TEXT,
  retell_api_key TEXT,
  elevenlabs_api_key TEXT,
  inbound_webhook_url TEXT,
  status_callback_url TEXT,
  recording_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_push_leads_to_crm BOOLEAN NOT NULL DEFAULT true,
  auto_create_deals BOOLEAN NOT NULL DEFAULT true,
  auto_send_whatsapp_summary BOOLEAN NOT NULL DEFAULT true,
  daily_call_limit INT NOT NULL DEFAULT 500,
  concurrency_limit INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_voice_agents_account_id ON voice_agents(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_phone_numbers_account_id ON voice_phone_numbers(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_account_id ON voice_calls(account_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_agent_id ON voice_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_created_at ON voice_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_campaigns_account_id ON voice_campaigns(account_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_telephony_settings ENABLE ROW LEVEL SECURITY;

-- voice_agents
CREATE POLICY voice_agents_select ON voice_agents
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY voice_agents_all ON voice_agents
  FOR ALL USING (is_account_member(account_id, 'agent'));

-- voice_phone_numbers
CREATE POLICY voice_phone_numbers_select ON voice_phone_numbers
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY voice_phone_numbers_all ON voice_phone_numbers
  FOR ALL USING (is_account_member(account_id, 'admin'));

-- voice_calls
CREATE POLICY voice_calls_select ON voice_calls
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY voice_calls_all ON voice_calls
  FOR ALL USING (is_account_member(account_id, 'agent'));

-- voice_campaigns
CREATE POLICY voice_campaigns_select ON voice_campaigns
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY voice_campaigns_all ON voice_campaigns
  FOR ALL USING (is_account_member(account_id, 'agent'));

-- voice_telephony_settings
CREATE POLICY voice_telephony_settings_select ON voice_telephony_settings
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY voice_telephony_settings_all ON voice_telephony_settings
  FOR ALL USING (is_account_member(account_id, 'admin'));
