import type { GarageData } from "./types";

// Wallet ledger reconciles cleanly from 0:
// +100 Monthly free drop → 100
// -50  Image enhance      → 50
// -1   Message            → 49  (current balance)
export const MOCK_GARAGE: GarageData = {
  profile: {
    name: "John Smith",
    email: "john.smith@example.com",
    contact_pref: "platform",
  },

  vehicles: [
    {
      id: "v1",
      make: "Ford",
      model: "Transit Custom",
      derivative: "280 L1 EcoBlue 130",
      year: 2020,
      reg: "WL20 XYZ",
      mileage: 67800,
      price: 14995,
      status: "listed",
      listed_on_vansales: true,
      image_url: null,
      slug: "ford-transit-custom-wl20xyz",
    },
    {
      id: "v2",
      make: "Vauxhall",
      model: "Vivaro",
      derivative: "2900 Edition L1 120",
      year: 2019,
      reg: "SK19 ABD",
      mileage: 45000,
      price: 11500,
      status: "draft",
      listed_on_vansales: false,
      image_url: null,
      slug: null,
    },
  ],

  wallet: {
    tokens: 49,
    ledger: [
      { id: "l3", date: "2026-06-15", action: "Message", tokens: -1, running_balance: 49 },
      { id: "l2", date: "2026-06-10", action: "Image enhance", tokens: -50, running_balance: 50 },
      { id: "l1", date: "2026-06-01", action: "Monthly free drop", tokens: 100, running_balance: 100 },
    ],
  },

  threads: [
    {
      id: "t1",
      vehicle: "Ford Transit Custom WL20 XYZ",
      buyer_name: "Alex Turner",
      last_message: "Is the van still available? I can come view this weekend.",
      last_message_at: "2026-06-24T14:23:00Z",
      unread: 1,
      messages: [
        {
          id: "m1",
          from: "buyer",
          body: "Hi, I'm interested in your Transit Custom. Is it still available?",
          sent_at: "2026-06-23T09:10:00Z",
        },
        {
          id: "m2",
          from: "seller",
          body: "Yes, still available! Happy to answer any questions.",
          sent_at: "2026-06-23T11:30:00Z",
        },
        {
          id: "m3",
          from: "buyer",
          body: "Is the van still available? I can come view this weekend.",
          sent_at: "2026-06-24T14:23:00Z",
        },
      ],
    },
    {
      id: "t2",
      vehicle: "Ford Transit Custom WL20 XYZ",
      buyer_name: "Rachel Green",
      last_message: "Thanks for the details. I'll be in touch.",
      last_message_at: "2026-06-20T10:00:00Z",
      unread: 0,
      messages: [
        {
          id: "m4",
          from: "buyer",
          body: "How many owners has this had?",
          sent_at: "2026-06-18T16:00:00Z",
        },
        {
          id: "m5",
          from: "seller",
          body: "Just one previous owner — a local builder. Full service history.",
          sent_at: "2026-06-19T09:30:00Z",
        },
        {
          id: "m6",
          from: "buyer",
          body: "Thanks for the details. I'll be in touch.",
          sent_at: "2026-06-20T10:00:00Z",
        },
      ],
    },
  ],

  px_offers: [
    {
      id: "px1",
      dealer_name: "SwissVans",
      vehicle: "Ford Transit Custom WL20 XYZ",
      offer_amount: 12500,
      date: "2026-06-22",
      status: "pending",
    },
  ],

  documents: [
    {
      id: "doc1",
      name: "Ford Transit Custom — Extended Warranty",
      type: "warranty",
      date: "2024-03-15",
      url: null,
    },
    {
      id: "doc2",
      name: "Commercial Vehicle Insurance Policy",
      type: "insurance",
      date: "2026-01-10",
      url: null,
    },
  ],
};
