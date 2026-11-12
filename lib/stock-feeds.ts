/**
 * Data for /stock-feeds ("can you import my stock?"). Facts below are only what vansales-backend proves (cited per line); everything else is a neutral sentence plus a TODO(Ian) so no claim is invented.
 * STOCK_FEEDS_LASTMOD is the sitemap lastmod: a real date, set when the copy last changed. Update it whenever the page copy changes. There is no "now" fallback.
 */
import { fitTitle } from "./seo/title.ts";

export const STOCK_FEEDS_PATH = "/stock-feeds";
export const STOCK_FEEDS_LASTMOD = "2026-11-12";

/** Ian's requested title, fitted by the site helper (the layout adds " · Vansales"). Renders as "Van Dealer Stock Feeds | Import Your Stock · Vansales". */
export const STOCK_FEEDS_REQUESTED_TITLE = "Van Dealer Stock Feeds | Import Your Stock to Vansales";
export const STOCK_FEEDS_TITLE = fitTitle(STOCK_FEEDS_REQUESTED_TITLE, " · Vansales");
export const STOCK_FEEDS_H1 = "Import your stock from the platform you already use";
export const STOCK_FEEDS_DESCRIPTION = "Send us your existing stock feed — AutoTrader, eBay Motors, Pinewood, Dragon2000, Click Dealer, GForces, CSV or XML. We import it, you never re-key a van.";

/** Every platform named in the home page For dealers card. The page must name each one. */
export const HOME_CARD_PLATFORMS = ["AutoTrader", "eBay Motors", "Pinewood", "Dragon2000", "Click Dealer", "GForces", "CSV"] as const;

export type FeedSource = { name: string; note: string };
export type FeedGroup = { title: string; sources: FeedSource[] };

// TODO(Ian): which of these platforms do we have a working import for? The code only has named presets for AutoTrader (by advertiser ID), Dragon2000, Click Dealer, Dealski, TraderWay, Car Dealer 5 and 67 Degrees (app/Services/Import/Sources.php:19-26) plus a generic XML/JSON feed URL and CSV. The notes below deliberately say "send us the feed you already produce" and claim no integration.
const SEND_FEED = "Send us the feed link or export you already produce, or the contact at your provider who can send it.";

export const FEED_GROUPS: FeedGroup[] = [
  {
    title: "Marketplaces",
    sources: [
      { name: "AutoTrader", note: "Your AutoTrader advertiser details, or the stock export you already produce." },
      { name: "eBay Motors Group (Motors.co.uk, Gumtree)", note: SEND_FEED },
      { name: "CarGurus", note: SEND_FEED },
      { name: "Carwow", note: SEND_FEED },
      { name: "Facebook Marketplace", note: SEND_FEED },
    ],
  },
  {
    title: "DMS and stock management",
    sources: [
      { name: "Pinewood", note: SEND_FEED },
      { name: "Keyloop (CDK)", note: SEND_FEED },
      { name: "Dragon2000", note: "Your Dragon2000 stock feed link." },
      { name: "Dealerweb", note: SEND_FEED },
      { name: "Click Dealer", note: "Your Click Dealer stock feed link." },
      { name: "Evolution Funding", note: SEND_FEED },
    ],
  },
  {
    title: "Website platforms",
    sources: [
      { name: "GForces NetDirector", note: SEND_FEED },
      { name: "Autoweb Design", note: SEND_FEED },
      { name: "Spidersnet", note: SEND_FEED },
      { name: "Bluesky Interactive", note: SEND_FEED },
      { name: "Click Dealer", note: "Your Click Dealer stock feed link." },
    ],
  },
  {
    title: "Direct",
    sources: [
      // Proven: CSV import exists, only the registration column is required (app/Services/Import/CsvImport.php:6-9).
      { name: "CSV upload", note: "A CSV file of your stock. Only the registration column is required." },
      // Proven: a generic XML or JSON feed URL is read daily (app/Services/Import/Sources.php:23, app/Services/Import/Feed/FeedParser.php:20-22).
      { name: "XML feed", note: "The link to your XML stock feed." },
      { name: "AutoTrader Connect API", note: "Your AutoTrader advertiser details." },
    ],
  },
];

// Proven (vansales-backend routes/console.php:5,9-12): feed URLs, AutoTrader and Dealski imports each run once a day. CSV is an upload, not a schedule.
export const NEXT_STEPS: { title: string; body: string }[] = [
  {
    title: "How long the first import takes",
    // TODO(Ian): how long does setup + first import really take (we set it up for the dealer)? Replace this sentence with the real answer.
    body: "We confirm the timing for your stock when we set you up.",
  },
  {
    title: "How often your stock refreshes",
    // Proven: routes/console.php:9-12 (daily). TODO(Ian): confirm daily is the promise we want to make for every source, and whether a dealer can ask for a manual re-sync.
    body: "Stock that comes in by feed link is refreshed once a day. A CSV is a one-off upload, so send us a new file when your stock changes.",
  },
  {
    title: "What happens when a van sells",
    // Proven: app/Services/Import/StockSyncer.php:15-16,20,69-72,134-141. TODO(Ian): confirm this is the wording you want about vans dropping out of a feed.
    body: "If your feed marks a van as sold, its advert is marked sold. If a van disappears from your feed, it is marked sold once it has been missing from two updates in a row, and it comes back if it reappears.",
  },
];
