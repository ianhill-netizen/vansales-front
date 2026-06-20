export type Category = "api" | "ai" | "tracking";

export type ProviderDef = {
  provider: string;
  label: string;
  category: Category;
  description: string;
  /** Whether this provider has a configurable base URL (e.g. Dealski feed URL). */
  hasBaseUrl?: boolean;
  baseUrlLabel?: string;
  baseUrlPlaceholder?: string;
  valuePlaceholder?: string;
  valueLabel?: string;
};

export const PROVIDERS: ProviderDef[] = [
  /* ── APIs ─────────────────────────────────────────────────── */
  {
    provider: "dealski",
    label: "Dealski",
    category: "api",
    description: "Brochure feed — new-vehicle prices, specs and media from Dealski Media Studio.",
    hasBaseUrl: true,
    baseUrlLabel: "Feed / base URL",
    baseUrlPlaceholder: "https://api.dealski.co.uk",
    valuePlaceholder: "dk_live_••••",
    valueLabel: "API key",
  },
  {
    provider: "uk-vehicle-data",
    label: "UK Vehicle Data",
    category: "api",
    description: "VRM lookup — plate → make, model, colour, registration date.",
    valuePlaceholder: "ukvd_••••",
    valueLabel: "API key",
  },
  {
    provider: "cap-hpi",
    label: "cap hpi",
    category: "api",
    description: "HPI check + CAP valuation data for used-van pricing.",
    valuePlaceholder: "cap_••••",
    valueLabel: "API key",
  },
  {
    provider: "google-maps",
    label: "Google Maps",
    category: "api",
    description: "Powers map search and dealer location maps on listing pages.",
    valuePlaceholder: "AIza••••",
    valueLabel: "API key",
  },
  {
    provider: "stripe",
    label: "Stripe",
    category: "api",
    description: "Dealer subscriptions, payments and invoicing.",
    valuePlaceholder: "sk_live_••••",
    valueLabel: "Secret key",
  },
  {
    provider: "resend",
    label: "Resend",
    category: "api",
    description: "Transactional email — enquiry notifications, welcome emails, alerts.",
    valuePlaceholder: "re_••••",
    valueLabel: "API key",
  },

  /* ── AI ────────────────────────────────────────────────────── */
  {
    provider: "openai",
    label: "OpenAI (ChatGPT)",
    category: "ai",
    description: "Content updates — AI-generated listing descriptions and copy.",
    valuePlaceholder: "sk-proj-••••",
    valueLabel: "API key",
  },
  {
    provider: "image-gen",
    label: "Image Generation",
    category: "ai",
    description: "Dealski Media Studio / Gemini — AI-generated vehicle imagery and background removal.",
    valuePlaceholder: "AIza••••",
    valueLabel: "API key",
  },

  /* ── Tracking ──────────────────────────────────────────────── */
  {
    provider: "gtm",
    label: "Google Tag Manager",
    category: "tracking",
    description: "Inject GTM container into <head> and <body> site-wide. Leave blank to disable.",
    valuePlaceholder: "GTM-XXXX",
    valueLabel: "Container ID",
  },
  {
    provider: "ga4",
    label: "Google Analytics 4",
    category: "tracking",
    description: "Inject GA4 gtag.js site-wide. Skip if GA4 is already set up inside GTM.",
    valuePlaceholder: "G-XXXX",
    valueLabel: "Measurement ID",
  },
  {
    provider: "meta-pixel",
    label: "Meta Pixel",
    category: "tracking",
    description: "Meta (Facebook) Pixel for ad conversion tracking. Injected site-wide.",
    valuePlaceholder: "123456789012345",
    valueLabel: "Pixel ID",
  },
];

export const PROVIDERS_BY_CATEGORY: Record<Category, ProviderDef[]> = {
  api: PROVIDERS.filter((p) => p.category === "api"),
  ai: PROVIDERS.filter((p) => p.category === "ai"),
  tracking: PROVIDERS.filter((p) => p.category === "tracking"),
};

export const PROVIDER_MAP = Object.fromEntries(PROVIDERS.map((p) => [p.provider, p]));

export const SEED_SQL = `-- Run once in Supabase SQL editor to seed provider rows (empty keys)
INSERT INTO integrations (category, provider, label, status)
VALUES
  ('api',      'dealski',          'Dealski',               'untested'),
  ('api',      'uk-vehicle-data',  'UK Vehicle Data',       'untested'),
  ('api',      'cap-hpi',          'cap hpi',               'untested'),
  ('api',      'google-maps',      'Google Maps',           'untested'),
  ('api',      'stripe',           'Stripe',                'untested'),
  ('api',      'resend',           'Resend',                'untested'),
  ('ai',       'openai',           'OpenAI (ChatGPT)',      'untested'),
  ('ai',       'image-gen',        'Image Generation',      'untested'),
  ('tracking', 'gtm',              'Google Tag Manager',    'untested'),
  ('tracking', 'ga4',              'Google Analytics 4',   'untested'),
  ('tracking', 'meta-pixel',       'Meta Pixel',            'untested')
ON CONFLICT (provider) DO NOTHING;`;
