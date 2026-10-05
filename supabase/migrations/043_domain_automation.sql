-- 043_domain_automation.sql: Cloudflare, DNS and VPS Domain Automation

CREATE TABLE IF NOT EXISTS domain_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  server_ip TEXT NOT NULL DEFAULT '147.93.170.17',
  provider TEXT NOT NULL DEFAULT 'cloudflare' CHECK (provider IN ('cloudflare', 'namecheap_cloudflare')),
  status TEXT NOT NULL DEFAULT 'configured' CHECK (status IN ('pending', 'configured', 'active', 'error')),
  dev_mode BOOLEAN NOT NULL DEFAULT false,
  dev_mode_expires_at TIMESTAMPTZ,
  nameservers JSONB NOT NULL DEFAULT '["dane.ns.cloudflare.com", "elena.ns.cloudflare.com"]'::jsonb,
  ssl_mode TEXT NOT NULL DEFAULT 'full' CHECK (ssl_mode IN ('off', 'flexible', 'full', 'strict')),
  dns_records JSONB NOT NULL DEFAULT '[]'::jsonb,
  security_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  speed_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  cache_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  ssl_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  waf_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  wordpress_optimized BOOLEAN NOT NULL DEFAULT true,
  client_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS domain_automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  cloudflare_api_token TEXT,
  cloudflare_account_id TEXT,
  cloudflare_email TEXT,
  namecheap_api_key TEXT,
  namecheap_username TEXT,
  namecheap_client_ip TEXT DEFAULT '147.93.170.17',
  default_server_ip TEXT NOT NULL DEFAULT '147.93.170.17',
  default_nameservers JSONB NOT NULL DEFAULT '["dane.ns.cloudflare.com", "elena.ns.cloudflare.com"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_domain_configurations_account_id ON domain_configurations(account_id);
CREATE INDEX IF NOT EXISTS idx_domain_configurations_domain ON domain_configurations(domain);

-- RLS
ALTER TABLE domain_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY domain_configurations_select ON domain_configurations
  FOR SELECT USING (is_account_member(account_id));

CREATE POLICY domain_configurations_all ON domain_configurations
  FOR ALL USING (is_account_member(account_id, 'admin'));

CREATE POLICY domain_automation_settings_select ON domain_automation_settings
  FOR SELECT USING (is_account_member(account_id));

CREATE POLICY domain_automation_settings_all ON domain_automation_settings
  FOR ALL USING (is_account_member(account_id, 'admin'));
