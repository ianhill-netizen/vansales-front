-- Run in Supabase SQL editor: Dashboard → SQL editor → New query

-- 1. Create the integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category       text        NOT NULL CHECK (category IN ('api', 'ai', 'tracking')),
  provider       text        NOT NULL UNIQUE,
  label          text        NOT NULL,
  value          text,                          -- AES-256-GCM encrypted: iv:tag:ciphertext (hex)
  base_url       text,                          -- optional feed/base URL (Dealski etc.)
  status         text        NOT NULL DEFAULT 'untested'
                             CHECK (status IN ('connected', 'untested', 'failed')),
  last_tested_at timestamptz,
  notes          text,
  updated_at     timestamptz DEFAULT now()
);

-- 2. Row-level security — only service role can read/write (app uses service role key)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only"
  ON integrations
  USING (auth.role() = 'service_role');

-- 3. Seed provider rows (empty keys)
INSERT INTO integrations (category, provider, label, status) VALUES
  ('api',      'dealski',         'Dealski',              'untested'),
  ('api',      'uk-vehicle-data', 'UK Vehicle Data',      'untested'),
  ('api',      'cap-hpi',         'cap hpi',              'untested'),
  ('api',      'google-maps',     'Google Maps',          'untested'),
  ('api',      'stripe',          'Stripe',               'untested'),
  ('api',      'resend',          'Resend',               'untested'),
  ('ai',       'openai',          'OpenAI (ChatGPT)',     'untested'),
  ('ai',       'image-gen',       'Image Generation',     'untested'),
  ('tracking', 'gtm',             'Google Tag Manager',   'untested'),
  ('tracking', 'ga4',             'Google Analytics 4',  'untested'),
  ('tracking', 'meta-pixel',      'Meta Pixel',           'untested')
ON CONFLICT (provider) DO NOTHING;
