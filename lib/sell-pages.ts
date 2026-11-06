/**
 * The five "sell my van" landing pages: URL, H1, meta title and meta description (fixed here, so every page has its own and the pattern never depends on the content API). The ~600-word body comes from
 * vansales-backend (sell_pages, written by Gemini). Pure data, no I/O. Keep the slugs in step with vansales-backend App\Support\SellPageDefs.
 */
export interface SellPageDef {
  slug: string;
  h1: string;
  title: string;
  description: string;
}

export const SELL_PAGES: readonly SellPageDef[] = [
  { slug: "sell-my-van", h1: "Sell My Van", title: "Sell My Van UK | Vansales.com", description: "Sell my van in the UK: how to price it, what paperwork you need and where to list it. List your van free and deal with buyers directly on Vansales.com." },
  { slug: "sell-my-van-fast", h1: "Sell My Van Fast", title: "Sell My Van Fast | Vansales.com", description: "Need to sell my van fast? Price it right, get the paperwork ready and reach van buyers quickly. A straight-talking UK guide from Vansales.com." },
  { slug: "sell-my-van-online", h1: "Sell My Van Online", title: "Sell My Van Online UK | Vansales.com", description: "Sell my van online: take good photos, write an honest advert and handle enquiries safely. How to sell a used van online in the UK, step by step." },
  { slug: "van-valuation", h1: "Van Valuation: What Is My Van Worth?", title: "Van Valuation UK | What Is My Van Worth? | Vansales.com", description: "What is my van worth? How UK van valuations work, what changes the price and how to get a realistic figure before you sell. Straight-talking advice." },
  { slug: "sell-used-van", h1: "Sell a Used Van", title: "Sell a Used Van UK | Vansales.com", description: "Selling a used van in the UK? Private sale, dealer or online: what each costs you, what buyers check and how to get the best price for your van." },
];

export const sellPagePath = (p: Pick<SellPageDef, "slug">) => `/${p.slug}`;
export const findSellPage = (slug: string) => SELL_PAGES.find((p) => p.slug === slug);

/** The steps shown on every sell page and published as its ItemList. */
export const SELL_STEPS: readonly string[] = [
  "Get your paperwork ready: V5C, MOT and service history",
  "Price it realistically against similar vans",
  "Take honest photos and write an honest advert",
  "List it where van buyers look",
  "Handle enquiries and test drives safely",
  "Take payment safely before the van leaves",
];
