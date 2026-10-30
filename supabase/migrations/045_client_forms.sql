-- 045_client_forms.sql: Public Client Onboarding Forms & Submissions

CREATE TABLE IF NOT EXISTS client_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  reference_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'completed', 'archived')),
  
  -- Step 1: Business Profile
  business_name TEXT NOT NULL,
  business_category TEXT,
  business_tagline TEXT,
  target_locations TEXT,

  -- Step 2: Website Scope & Content
  services_products TEXT,
  website_type TEXT,
  reference_websites TEXT,
  special_notes TEXT,

  -- Step 3: Contact & Business Location
  client_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  calling_number TEXT,
  email TEXT,
  business_address TEXT,
  google_map_link TEXT,
  working_hours TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,

  -- Step 4: Package, Assets & Addons
  logo_status TEXT DEFAULT 'upload',
  logo_url TEXT,
  logo_file_name TEXT,
  has_existing_logo BOOLEAN DEFAULT true,
  selected_package JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_estimate NUMERIC NOT NULL DEFAULT 0,

  -- Management
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  internal_notes TEXT,
  client_ip TEXT,
  source TEXT DEFAULT 'web_form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_form_submissions_account_id ON client_form_submissions(account_id);
CREATE INDEX IF NOT EXISTS idx_client_form_submissions_status ON client_form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_client_form_submissions_whatsapp ON client_form_submissions(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_client_form_submissions_created_at ON client_form_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE client_form_submissions ENABLE ROW LEVEL SECURITY;

-- Public can submit form (INSERT)
CREATE POLICY client_form_submissions_insert_public ON client_form_submissions
  FOR INSERT WITH CHECK (true);

-- Account members can view submissions
CREATE POLICY client_form_submissions_select ON client_form_submissions
  FOR SELECT USING (
    account_id IS NULL OR is_account_member(account_id)
  );

-- Account members (agent+) can update and manage submissions
CREATE POLICY client_form_submissions_update ON client_form_submissions
  FOR UPDATE USING (
    account_id IS NULL OR is_account_member(account_id)
  );

-- Admins can delete
CREATE POLICY client_form_submissions_delete ON client_form_submissions
  FOR DELETE USING (
    account_id IS NULL OR is_account_member(account_id, 'admin')
  );

