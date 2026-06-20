/* Mock data for the rebuilt dealer dashboard. All in-memory, no DB. */

export type LeadChannel = "WhatsApp" | "Phone" | "Web" | "Finance" | "PX";
export type LeadStatus = "new" | "replied" | "closed";
export type PricePosition = "great" | "good" | "fair" | "high";
export type PerfMetric = "views" | "leads" | "appearances";

export interface DashLead {
  id: string;
  van: string;
  buyer: string;
  channel: LeadChannel;
  time: string;
  status: LeadStatus;
  read: boolean;
}

export interface PerfDay {
  label: string;
  views: number;
  leads: number;
  appearances: number;
}

export interface ListingPerf {
  id: string;
  van: string;
  views: number;
  leads: number;
  appearances: number;
  daysListed: number;
  aged: boolean;
}

export interface PriceIndicator {
  id: string;
  van: string;
  price: number;
  marketPrice: number;
  position: PricePosition;
  delta: number; // negative = below market, positive = above
}

export interface QualityIssue {
  type: string;
  label: string;
  detail: string;
  count: number;
  href: string;
  severity: "warn" | "error";
}

export interface BoostItem {
  id: string;
  van: string;
  tokenCost: number;
  boosted: boolean;
  boostedUntil?: string;
}

export const MOCK_DASH_STOCK = {
  total: 47,
  advertised: 43,
  soldThisMonth: 6,
  avgDaysToSell: 14,
  qualityScore: 72,
  boostTokens: 120,
};

export const MOCK_DASH_LEADS: DashLead[] = [
  { id: "1", van: "Ford Transit Custom 2.0 TDCi 130", buyer: "James Cooper", channel: "WhatsApp", time: "10 min ago", status: "new", read: false },
  { id: "2", van: "Mercedes Sprinter 314 LWB", buyer: "Sarah Ahmed", channel: "Finance", time: "2 h ago", status: "new", read: false },
  { id: "3", van: "VW Transporter T6.1", buyer: "Tom Davies", channel: "Phone", time: "3 h ago", status: "replied", read: true },
  { id: "4", van: "Renault Master LWB High Roof", buyer: "Pete Fowler", channel: "PX", time: "Yesterday", status: "replied", read: true },
  { id: "5", van: "Peugeot Expert Compact", buyer: "A. Patel", channel: "Web", time: "Yesterday", status: "new", read: false },
  { id: "6", van: "Ford Transit Custom Sport", buyer: "Ryan Hughes", channel: "WhatsApp", time: "2 days ago", status: "closed", read: true },
  { id: "7", van: "Vauxhall Vivaro Life 2023", buyer: "Chloe Ward", channel: "Web", time: "2 days ago", status: "replied", read: true },
];

// 30-day performance timeline
export const MOCK_PERF_TIMELINE: PerfDay[] = [
  { label: "21 May", views: 88, leads: 2, appearances: 300 },
  { label: "22", views: 102, leads: 3, appearances: 320 },
  { label: "23", views: 95, leads: 2, appearances: 290 },
  { label: "24", views: 110, leads: 4, appearances: 340 },
  { label: "25", views: 87, leads: 2, appearances: 280 },
  { label: "26", views: 60, leads: 1, appearances: 200 },
  { label: "27", views: 55, leads: 1, appearances: 190 },
  { label: "28", views: 120, leads: 4, appearances: 380 },
  { label: "29", views: 132, leads: 5, appearances: 400 },
  { label: "30", views: 115, leads: 3, appearances: 360 },
  { label: "31", views: 98, leads: 2, appearances: 310 },
  { label: "1 Jun", views: 140, leads: 6, appearances: 420 },
  { label: "2", views: 125, leads: 4, appearances: 380 },
  { label: "3", views: 130, leads: 5, appearances: 390 },
  { label: "4", views: 108, leads: 3, appearances: 340 },
  { label: "5", views: 118, leads: 4, appearances: 360 },
  { label: "6", views: 95, leads: 2, appearances: 300 },
  { label: "7", views: 142, leads: 7, appearances: 430 },
  { label: "8", views: 138, leads: 6, appearances: 420 },
  { label: "9", views: 120, leads: 4, appearances: 370 },
  { label: "10", views: 99, leads: 2, appearances: 310 },
  { label: "11", views: 145, leads: 5, appearances: 440 },
  { label: "12", views: 161, leads: 7, appearances: 490 },
  { label: "13", views: 148, leads: 6, appearances: 460 },
  { label: "14", views: 132, leads: 4, appearances: 400 },
  { label: "15", views: 118, leads: 3, appearances: 360 },
  { label: "16", views: 95, leads: 2, appearances: 290 },
  { label: "17", views: 107, leads: 3, appearances: 330 },
  { label: "18", views: 138, leads: 5, appearances: 410 },
  { label: "19 Jun", views: 142, leads: 6, appearances: 430 },
];

export const MOCK_LISTING_PERF: ListingPerf[] = [
  { id: "1", van: "Ford Transit Custom 2.0 TDCi 130", views: 142, leads: 4, appearances: 430, daysListed: 12, aged: false },
  { id: "2", van: "VW Transporter T6.1", views: 211, leads: 7, appearances: 640, daysListed: 8, aged: false },
  { id: "3", van: "Mercedes Sprinter 314 LWB", views: 98, leads: 2, appearances: 290, daysListed: 21, aged: false },
  { id: "4", van: "Vauxhall Vivaro Life 2023", views: 56, leads: 1, appearances: 170, daysListed: 5, aged: false },
  { id: "5", van: "Renault Master LWB High Roof", views: 34, leads: 1, appearances: 102, daysListed: 48, aged: true },
  { id: "6", van: "Peugeot Expert Compact", views: 18, leads: 0, appearances: 54, daysListed: 55, aged: true },
];

export const MOCK_PRICE_INDICATORS: PriceIndicator[] = [
  { id: "1", van: "Ford Transit Custom 2.0 TDCi 130", price: 24995, marketPrice: 27500, position: "great", delta: -9.1 },
  { id: "2", van: "VW Transporter T6.1", price: 31500, marketPrice: 30800, position: "fair", delta: 2.3 },
  { id: "3", van: "Mercedes Sprinter 314 LWB", price: 37800, marketPrice: 36200, position: "good", delta: 4.4 },
  { id: "4", van: "Renault Master LWB High Roof", price: 18500, marketPrice: 16200, position: "high", delta: 14.2 },
  { id: "5", van: "Peugeot Expert Compact", price: 14995, marketPrice: 15800, position: "good", delta: -5.1 },
  { id: "6", van: "Vauxhall Vivaro Life 2023", price: 28500, marketPrice: 27900, position: "fair", delta: 2.2 },
];

export const MOCK_QUALITY_ISSUES: QualityIssue[] = [
  { type: "photos", label: "Add more photos", detail: "2 listings have fewer than 5 photos", count: 2, href: "/dealer-portal/listings?filter=needsPhotos", severity: "warn" },
  { type: "spec", label: "Missing spec", detail: "3 listings are missing wheelbase or payload", count: 3, href: "/dealer-portal/listings?filter=missingSpec", severity: "warn" },
  { type: "description", label: "No description", detail: "1 listing has no description added", count: 1, href: "/dealer-portal/listings?filter=noDescription", severity: "warn" },
  { type: "price", label: "High price flag", detail: "1 listing priced 14% above market", count: 1, href: "/dealer-portal/listings?filter=highPrice", severity: "error" },
];

export const MOCK_BOOST_LISTINGS: BoostItem[] = [
  { id: "1", van: "Ford Transit Custom 2.0 TDCi 130", tokenCost: 20, boosted: true, boostedUntil: "25 Jun" },
  { id: "2", van: "VW Transporter T6.1", tokenCost: 20, boosted: false },
  { id: "3", van: "Mercedes Sprinter 314 LWB", tokenCost: 20, boosted: false },
  { id: "5", van: "Renault Master LWB High Roof", tokenCost: 20, boosted: false },
];
