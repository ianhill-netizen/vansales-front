/* All mock data for the app-shell prototype. Replace with real API calls in Phase 1. */

// ── Buyer ─────────────────────────────────────────────────────────────────────
export const MOCK_SAVED_VANS = [
  { id: "1", make: "Ford", model: "Transit Custom", year: 2022, price: 24995, mileage: 28000, slug: "ford-transit-custom-2022", image: null },
  { id: "2", make: "Volkswagen", model: "Transporter", year: 2021, price: 31500, mileage: 41000, slug: "vw-transporter-2021", image: null },
  { id: "3", make: "Mercedes-Benz", model: "Sprinter 314", year: 2023, price: 37800, mileage: 12000, slug: "mercedes-sprinter-314-2023", image: null },
];

export const MOCK_SAVED_SEARCHES = [
  { id: "1", label: "Panel vans under £30k", href: "/vans?bodyStyle=Panel+Van&maxPrice=30000", count: 48, lastUpdated: "2 hours ago" },
  { id: "2", label: "New Volkswagen Transporters", href: "/vans?condition=new&q=Volkswagen+Transporter", count: 12, lastUpdated: "1 day ago" },
];

export const MOCK_ENQUIRIES = [
  { id: "1", van: "Ford Transit Custom 2022", dealer: "Swiss Vans", date: "2026-06-17", status: "replied", channel: "WhatsApp" },
  { id: "2", van: "VW Transporter 2021", dealer: "Swiss Vans", date: "2026-06-15", status: "sent", channel: "Message" },
  { id: "3", van: "Renault Master LWB", dealer: "Midlands Commercial", date: "2026-06-10", status: "replied", channel: "Message" },
  { id: "4", van: "Mercedes Sprinter 314", dealer: "Swiss Vans", date: "2026-06-05", status: "viewed", channel: "WhatsApp" },
];

export const MOCK_ALERTS = [
  { id: "1", query: "Panel vans under £30k", trigger: "3 new vans matching your search", href: "/vans?bodyStyle=Panel+Van&maxPrice=30000", unread: true },
  { id: "2", query: "Ford Transit Custom", trigger: "Price drop: £24,995 → £23,500", href: "/listing/ford-transit-custom-2022", unread: true },
];

// ── Dealer (shared between 'dealer' and 'swiss-vans' personas) ────────────────
export const MOCK_DEALER_STOCK = {
  total: 47,
  live: 43,
  unadvertised: 4,
  aged45: 2,
  issues: 1,
  avgPhotos: 8.2,
  needsPhotos: 2,
  boostTokens: 120,
};

export const MOCK_LEADS = [
  {
    id: "1",
    van: "Ford Transit Custom 2.0 TDCi 130",
    buyer: "James Cooper",
    channel: "WhatsApp",
    time: "10 min ago",
    note: "Replied — asking about mileage",
    read: false,
  },
  {
    id: "2",
    van: "Mercedes Sprinter 314 LWB",
    buyer: "Sarah Ahmed",
    channel: "Finance",
    time: "2 h ago",
    note: "Finance application submitted via Dealski",
    read: false,
  },
  {
    id: "3",
    van: "VW Transporter T6.1",
    buyer: "Tom Davies",
    channel: "Message",
    time: "Yesterday",
    note: "",
    read: true,
  },
  {
    id: "4",
    van: "Renault Master LWB High Roof",
    buyer: "Pete Fowler",
    channel: "PX",
    time: "Yesterday",
    note: "Part-exchange value enquiry from Dealski",
    read: true,
  },
  {
    id: "5",
    van: "Peugeot Expert Compact",
    buyer: "A. Patel",
    channel: "WhatsApp",
    time: "2 days ago",
    note: "Harry replied",
    read: true,
  },
];

export const MOCK_PERFORMANCE = [
  { van: "Ford Transit Custom 2.0 TDCi", views: 142, enquiries: 4, daysListed: 12 },
  { van: "Mercedes Sprinter 314 LWB", views: 98, enquiries: 2, daysListed: 21 },
  { van: "VW Transporter T6.1", views: 211, enquiries: 7, daysListed: 8 },
  { van: "Renault Master LWB", views: 34, enquiries: 1, daysListed: 48 },
  { van: "Peugeot Expert Compact", views: 67, enquiries: 0, daysListed: 55 },
];

export const MOCK_DEALER_LISTINGS = [
  { id: "1", make: "Ford", model: "Transit Custom 2.0 TDCi 130", year: 2022, price: 24995, condition: "used", status: "live", photos: 12, age: 12 },
  { id: "2", make: "Mercedes-Benz", model: "Sprinter 314 LWB", year: 2023, price: 37800, condition: "new", status: "live", photos: 8, age: 21 },
  { id: "3", make: "Volkswagen", model: "Transporter T6.1", year: 2022, price: 31500, condition: "used", status: "live", photos: 15, age: 8 },
  { id: "4", make: "Renault", model: "Master LWB High Roof", year: 2020, price: 18500, condition: "used", status: "live", photos: 4, age: 48 },
  { id: "5", make: "Peugeot", model: "Expert Compact", year: 2019, price: 14995, condition: "used", status: "live", photos: 0, age: 55 },
  { id: "6", make: "Vauxhall", model: "Vivaro Life", year: 2023, price: 28500, condition: "new", status: "unadvertised", photos: 0, age: 3 },
];

// ── Admin ─────────────────────────────────────────────────────────────────────
export const MOCK_DEALERS = [
  { id: "1", name: "Swiss Vans", slug: "swiss-vans", plan: "Featured", vans: 47, status: "active", joined: "2024-01-15" },
  { id: "2", name: "Midlands Commercial Vehicles", slug: "midlands-commercial", plan: "Pro", vans: 31, status: "active", joined: "2024-03-20" },
  { id: "3", name: "Northern Vans Direct", slug: "northern-vans-direct", plan: "Starter", vans: 14, status: "active", joined: "2024-05-10" },
  { id: "4", name: "Premier Commercials", slug: "premier-commercials", plan: "Trial", vans: 6, status: "trial", joined: "2026-06-01" },
];

export const MOCK_PENDING_LISTINGS = [
  { id: "1", van: "Ford Transit Custom 2.0 TDCi", dealer: "Premier Commercials", submitted: "1h ago", reason: "New dealer — manual review" },
  { id: "2", van: "Unbranded Tipper 2018", dealer: "Northern Vans Direct", submitted: "3h ago", reason: "Missing make/model data" },
  { id: "3", van: "Mercedes Sprinter 316 CDI", dealer: "Midlands Commercial", submitted: "Yesterday", reason: "Flagged image (reported by user)" },
];

// ── API/Integrations ──────────────────────────────────────────────────────────
export type IntegrationStatus = "connected" | "disconnected" | "coming-soon" | "error";

export interface Integration {
  id: string;
  name: string;
  purpose: string;
  status: IntegrationStatus;
  keyEnvVar: string | null;
  configNote?: string;
  docsUrl?: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "dealski",
    name: "Dealski",
    purpose: "Live van feed, lead CRM, finance applications, part-exchange",
    status: "connected",
    keyEnvVar: "DEALSKI_TENANT",
    configNote: "Tenant ID: swissvans · Feed URL: swissvans.dealski.co.uk/api/public/stock",
    docsUrl: "https://dealski.co.uk/docs",
  },
  {
    id: "google-maps",
    name: "Google Maps",
    purpose: "Dealer location map on dealer profile pages",
    status: "connected",
    keyEnvVar: "NEXT_PUBLIC_GOOGLE_MAPS_KEY",
    configNote: "Domain-restricted key · Currently using Leaflet+OSM fallback on map search",
  },
  {
    id: "cardata-uk",
    name: "UK Vehicle Data (Cardata UK)",
    purpose: "VRM lookup → auto-fill make/model/year/spec for new listings",
    status: "disconnected",
    keyEnvVar: "CARDATA_UK_API_KEY",
    configNote: "Register at cardata.co.uk to get API key",
  },
  {
    id: "hpi",
    name: "HPI Check",
    purpose: "Vehicle history check — finance outstanding, stolen, written-off",
    status: "disconnected",
    keyEnvVar: "HPI_API_KEY",
    configNote: "1 token = 1 HPI check. Tokens drawn from dealer boost balance.",
  },
  {
    id: "stripe",
    name: "Stripe",
    purpose: "Subscription billing, boost token top-ups, PAYG listing payments",
    status: "coming-soon",
    keyEnvVar: "STRIPE_SECRET_KEY",
  },
  {
    id: "postmark",
    name: "Transactional email (Postmark)",
    purpose: "Lead notifications, account emails, receipts",
    status: "coming-soon",
    keyEnvVar: "POSTMARK_API_KEY",
  },
  {
    id: "finance-quotes",
    name: "Finance quotes API",
    purpose: "Real-time HP/PCP/lease quotes on listing pages",
    status: "coming-soon",
    keyEnvVar: "FINANCE_API_KEY",
    configNote: "Integrate Dealski Finance or Codeweavers",
  },
  {
    id: "feed-ingestion",
    name: "Feed ingestion (AutoTrader / FeedStream)",
    purpose: "Pull stock from AutoTrader or third-party XML/CSV feeds",
    status: "coming-soon",
    keyEnvVar: "FEED_API_KEY",
  },
  {
    id: "meta",
    name: "Meta / Facebook Ads",
    purpose: "Retargeting pixel + Conversions API for lead quality reporting",
    status: "coming-soon",
    keyEnvVar: "META_PIXEL_ID",
  },
  {
    id: "analytics",
    name: "Analytics (Plausible / GA4)",
    purpose: "Pageviews, search events, enquiry conversion funnel",
    status: "coming-soon",
    keyEnvVar: "NEXT_PUBLIC_ANALYTICS_ID",
  },
];
