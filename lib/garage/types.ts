export type VehicleStatus = "draft" | "listed" | "sold";
export type ContactPref = "platform" | "reveal_number" | "masked_number";
export type DocType = "warranty" | "insurance";

export interface GarageVehicle {
  id: string;
  make: string;
  model: string;
  derivative: string;
  year: number;
  reg: string;
  mileage: number;
  price: number | null;
  status: VehicleStatus;
  listed_on_vansales: boolean;
  image_url: string | null;
  slug: string | null;
}

export interface WalletLedgerEntry {
  id: string;
  date: string;
  action: string;
  tokens: number;
  running_balance: number;
}

export interface GarageWallet {
  tokens: number;
  ledger: WalletLedgerEntry[];
}

export interface MessageEntry {
  id: string;
  from: "seller" | "buyer";
  body: string;
  sent_at: string;
}

export interface MessageThread {
  id: string;
  vehicle: string;
  buyer_name: string;
  last_message: string;
  last_message_at: string;
  unread: number;
  messages: MessageEntry[];
}

export interface PxOffer {
  id: string;
  dealer_name: string;
  vehicle: string;
  offer_amount: number;
  date: string;
  status: "pending" | "accepted" | "declined";
}

export interface GarageDocument {
  id: string;
  name: string;
  type: DocType;
  date: string;
  url: string | null;
}

export interface GarageProfile {
  name: string;
  email: string;
  contact_pref: ContactPref;
}

export interface GarageData {
  profile: GarageProfile;
  vehicles: GarageVehicle[];
  wallet: GarageWallet;
  threads: MessageThread[];
  px_offers: PxOffer[];
  documents: GarageDocument[];
}
