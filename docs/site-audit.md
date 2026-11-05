# vansales-front — Site Audit

Audited at `main` @ `ef6c063` (PR #83, 2026-11-04). Method: static read of the repo (no live site or API calls were made), so anything about live data is marked **inferred**.

Stack: Next.js 16.2.9 (App Router), React 19, Tailwind v4, Prisma 7 (Postgres), NextAuth v5 beta, Leaflet + Google Maps. Deployed on Vercel.

---

## 1. Routes

### Public (`app/(main)`)
| Route | What it does | Data | Cache |
|---|---|---|---|
| `/` | Home: search hero (make/model selects), category strip, make grid with live counts, 6 newest vans, spec cards, finance/insurance teasers | `getListings({sort:newest, limit:6})`, `getFacets()`, `getModelIndex()` | not set |
| `/vans` | Main search. Pill row + "Filter & sort" modal. **No make selected → make chooser grid only (no results)**; make selected → 24/page results, list/map toggle | `getListings` + `getFacets`; `/api/marketplace/geocode` for postcode | ISR 3600 s |
| `/vans/[make]` | Make landing: intro, model links, first 24 vans, related blog/new-van links | `getListings({make, pageSize:24})` | ISR 3600 s; `generateStaticParams` from `ALL_MAKES` |
| `/vans/[make]/[model]` | Model page: generated model content, sidebar `FilterRail`, paginated results, spec cards | `getListings`, `getFacets`, `lib/models/content.generated.ts` | ISR 3600 s |
| `/vans/{panel-van,luton,tipper,dropside,crew-van,pickup,minibus,chassis-cab,electric,ulez}` | Ten static category pages, each a 6-van strip (fixed filter) + editorial | `getListings({bodyStyle/fuel/ulez, pageSize:6})` | ISR 3600 s |
| `/vans/new`, `/vans/used` | Permanent redirects to `/vans?condition=…` | – | – |
| `/listing/[slug]` | Advert detail page (see §5) | `getListingBySlug` | ISR 60 s, `generateStaticParams` returns `[]` (on-demand) |
| `/dealer/[slug]` | Dealer page (see §6) | config + Prisma + `getListings` | ISR 3600 s |
| `/dealer/[slug]/blog`, `/blog/[postSlug]` | Per-dealer blog | markdown in `content/` | – |
| `/directory` | A–Z **make/model** index (not a dealer directory) | `getModelIndex()` | ISR 3600 s |
| `/new-vans`, `/new-vans/[slug]` | New-van model pages from `content/new-vans/*.json`, with matching stock strip | JSON + `getListings` | – |
| `/blog`, `/blog/[slug]` | ~60 markdown posts (`content/blog`) | filesystem | – |
| `/van-finance`, `/van-contract-hire`, `/van-insurance`, `/van-reviews` | Editorial/lead pages | static (`van-reviews` ISR 3600) | – |
| `/advertise` | Dealer/trade packages page (see §6) | static | – |
| `/sell` | Private-seller landing page; links to `/advertise`, phone number; "Get started" anchor | static | – |
| `/signup`, `/signup/{advertise,retail,trade}` | Interest/waitlist forms → `/api/signup` | – | – |
| `/account`, `/garage` | Logged-in buyer/private-seller area. `/garage` (1,315 lines) is driven by `lib/garage/mock.ts` ("TODO: replace with fetch /api/garage/me") | **mock** | – |
| `/coming-soon` | Holding page (served by `proxy.ts` gate) | – | – |
| `/robots.txt`, `/sitemap.xml` | Sitemap lists every listing from `getListings({})` | | |

### Auth (`app/(auth)`)
`/sign-in`, `/sign-up` + `/sign-up/{buyer,private-seller,dealer,dealer-group,dealski-connect,finance-hire-fleet}`, `/dealer portal/login`.

### Portal (`app/(portal)`, logged-in)
`/dealer portal` (dashboard, 710 lines, **mock data** from `lib/dealer/mock-dashboard-data.ts`), `/dealer portal/{add-van,listings,leads,analytics,account}`, `/admin`, `/admin/{dealers,listings,integrations/*}`.

### Utility/dev pages
`/image-review` (force-dynamic, internal), `/maps-test`.

### API routes (`app/api`)
`/enquiry` (dealer enquiry → Dealski; **refuses private adverts**), `/register-interest`, `/waitlist`, `/signup`, `/auth/*`, `/geocode`, `/maps-key`, `/dk-track` (Dealski tracking), `/revalidate`, `/portal/{account,dashboard,leads,listings,listings/[id]}`, `/admin/integrations{,/test}`.

### Gating / middleware
`proxy.ts` rewrites everything to `/coming-soon` unless `COMING_SOON=false` or the preview cookie/`?preview=` key is present. **The preview key `vsp_0fj2k7mx` is hard-coded in source.**

---

## 2. Components (`components/`)

| Component | Purpose | Used by |
|---|---|---|
| `listing-card.tsx` | The van card (see §4) | `/`, `/vans*`, dealer page, new-vans |
| `search/vans-filter.tsx` (1,117 lines) | `/vans` pill row, active chips, draggable model chips, "Filter & sort" modal | `/vans` only |
| `filter-rail.tsx` | Sidebar: price, year, body, wheelbase, fuel (URL-driven) | `/vans/[make]/[model]` only |
| `search-hero.tsx` | Home make→model `<select>` form | `/` |
| `list-map-toggle.tsx`, `map-view.tsx` | List/map switch; Leaflet map of the **current page's** listings | `/vans` |
| `dealer-map-button.tsx`, `results-dealer-map.tsx`, `dealer-map*.tsx`, `google-dealer-map.tsx` | Dealer location maps (Leaflet/Google) | `/vans`, dealer page |
| `gallery.tsx` | Image viewer w/ thumbnails, "Stock image" badge | detail |
| `spec-readout.tsx`, `spec-table.tsx`, `spec-card.tsx` | 4-up readout, full spec table, model spec card | detail / `/` / model |
| `enquiry-panel.tsx`, `enquiry-modal.tsx`, `enquiry-fields.tsx`, `private-enquiry-form.tsx` | Dealer enquiry vs private-seller message form | detail |
| `dealer-cta-buttons.tsx` | Call / WhatsApp / finance CTAs for config dealers | detail, dealer page |
| `pagination.tsx` | Prev/next + `rel` links | `/vans`, model |
| `header.tsx`, `mobile-nav.tsx`, `footer.tsx`, `account-button.tsx`, `brand.tsx` | Chrome | layouts |
| `related-links.tsx` | Internal cross-links | make/model/new-vans |
| `ui.tsx` | Container, Button, Badge, Price, PlateBadge, StatusBadge, Eyebrow… | everywhere |
| `icons.tsx` | SVG icon set | everywhere |
| `waitlist-form.tsx`, `coming-soon-banner.tsx` | Pre-launch capture | coming-soon, layout |
| `dk-tracker.tsx`, `tracking-scripts.tsx` | Dealski + GA-style tracking | layout |
| `integration-row.tsx`, `integrations-page.tsx`, `role-simulator.tsx` | Admin/portal | portal |
| **`category-strip.tsx`, `finance-calculator.tsx`** | **Not imported anywhere** (dead code; grep-verified) | – |

---

## 3. Search & filters

**`/vans`** — URL-driven, server-rendered. Query params (all parsed in `app/(main)/vans/page.tsx`):

`make`, `models` (comma list; legacy `model`), `condition`, `bodyStyle`, `fuel`, `wheelbase`, `gearbox`, `colour`, `minPrice`, `maxPrice`, `monthlyMax` (+`deposit`, default £3,000), `minYear`, `maxYear`, `maxMileage`, `q`, `postcode` + `radius`, `sort`, `page`.

UI (`vans-filter.tsx`):
- **Pill row** (Make/Model, Price, Payment, Year, Mileage, Distance, Wheelbase*, Body type*) — each opens the shared modal scrolled to its section. (*only shown if facets exist)
- **Modal**: make picker, searchable **multi-model chips** (OR), price min/max + preset chips, monthly-payment slider + deposit slider, year, mileage, postcode + radius (10/25/50/100/Nationwide), body, fuel, wheelbase, gearbox, colour, sort.
- **Active chips** row above results, one-click clear, "clear all"; model chips are **drag-to-reorder** (order drives result grouping).
- Apply is explicit (button) → `router.push` in a transition.

Wired vs not:
| Item | State |
|---|---|
| All params above | wired end-to-end through `applyFilters()` in `lib/listings/client.ts` |
| `q` free text | parsed + filtered, **no UI input** on `/vans` |
| `condition` | filter works; only reachable via `/vans/new`, `/vans/used` redirects — no UI control |
| `ulez` filter | works in data layer; only `/vans/ulez` category page uses it — no `/vans` control |
| Radius | requires server geocode via `DEALSKI_MARKETPLACE_KEY`; **without the key `geocodePostcodeServer` returns null and the radius silently does nothing** |
| Private adverts | have `location.lat/lng = null` → **excluded from any radius search** |
| `getFacets()` | called with no scope on `/vans`, so facet pill visibility reflects the whole catalogue |
| Make gate | `/vans` with no `make` shows **no vans at all** (make chooser only) — `q`/other filters alone return nothing |

**Make/model pages**: `/vans/[make]` has **no filters** (first 24 only, no pagination). `/vans/[make]/[model]` uses the sidebar `FilterRail` (price, year, body, wheelbase, fuel) — a different, smaller filter set than `/vans`, and `FilterRail` only offers fixed price/year steps.

Sort (`/vans` modal): newest, price ↑, price ↓, mileage ↑, nearest (only offered when a postcode ≥3 chars). Model page: sort parsed from URL, **no sort UI** there.

---

## 4. Van card (`listing-card.tsx`)

Shown today:
- Photo (4:3, `<img>`, lazy except first 6); "Photo coming soon" placeholder; "Stock image" pill if `image_source` ≠ photo; **Sold** overlay.
- Top-left badges: Featured / Private seller / Dealer, New, Reserved, non-diesel fuel pill. Top-right: **ULEZ ✓**.
- Seller line: dealer name (linked if in `lib/dealers/config.ts`) or supplier code or "Private seller"; stock ref (dealers); town; distance (if postcode search).
- Title (make model), derivative, **price** (+ VAT qualifier), "≈ £x/mo HP" (48 mo, 9.9% APR, default £3k deposit — shown on every card with a price), plate badge.
- Spec strip: fuel, gearbox, wheelbase (SWB/MWB/LWB), mileage.
- "Enquire" CTA → detail page `?enquire=1#enquire`.

Not on the card (data exists on `Listing` in some form): roof height, payload, body style, engine/Euro, colour, features, HPI checked, MOT expiry, vehicle condition (excellent/good…), V5 present, warranty, previous owners, service history, video/YouTube presence, photo count, VAT status text, year (only via plate badge).

Data caveat for private adverts: the **list** endpoint (`ApiCard`) gives only title/make/model/variant/year/mileage/price/fuel/transmission/body/colour/image/has_video. Everything richer (`details`, `extras`, HPI, MOT, ULEZ, condition, V5) is only mapped from the **detail** endpoint (`ApiDetail`), so cards for private adverts cannot show those without the backend adding them to the list payload (or a per-advert detail fetch). `ulez_compliant` is read off the card only if the list endpoint happens to send it.

*(Historical: the caveats below described the removed Dealski adapters.)* Dealer-feed caveats (`dealski.ts`, `dealski-marketplace.ts`): `features: []` is hard-coded in all three dealer mappers; `euro_status: null`; **`ulez` is a heuristic** (`year === 0 ? true : year >= 2016`, and "optimistic true" on list rows) — so the green ULEZ ✓ on dealer cards is an estimate, not a fact.

---

## 5. Detail page (`/listing/[slug]`)

Layout: breadcrumb → header (body-style eyebrow, H1, plate badge, year · town · colour, price, status + badges) → gallery → video(s) → 4-up readout → private-seller spec table → warranty → extras → MOT → description → dealer features list → full spec table; sticky right column = `EnquiryPanel` (+ dealer CTAs). JSON-LD `Vehicle` + `Product`.

| Element | Dealer listings | Private (vansales-backend) |
|---|---|---|
| Gallery | yes (primary photo only from marketplace list; full set via per-tenant detail fetch) | all `listing_images` (cleaned variant preferred) |
| Spec readout (mileage/gearbox/fuel/wheelbase) | yes | yes (wheelbase from details) |
| Full spec table (`SpecTable`) | yes, but many rows "—"/hidden (no Euro, drivetrain, roof, load length from feed) | partial |
| "Specification" rows from `detailRows()` (body, wheelbase, roof, rear doors, side door, seats, payload, GVW, service history, engine, Euro, previous owners) | n/a | **yes — shows only rows the seller filled** |
| Features | `features[]` list in a 2-col checklist — **always empty** (mappers return `[]`) | "Features & extras" chips from `extras` |
| Badges | – | VAT status, **HPI checked**, ULEZ compliant / Not ULEZ compliant / ULEZ ready, condition, **V5 present**, No VAT |
| Warranty line | – | yes (`warrantyText`) |
| MOT block (expiry, last MOT mileage/date, "From DVLA and DVSA records") | – | yes |
| Generated video (16:9 + download 9:16) | – | yes (`video_url`) |
| Seller's own walk-around video (`<video>`) | – | yes, takes priority over generated |
| YouTube embed (nocookie, lazy) | – | yes (`youtube_embed_url`) |
| HPI | – | **badge only**. Findings are deliberately never public |
| Enquiry | `EnquiryPanel` → `/api/enquiry` → Dealski tenant; call/WhatsApp CTAs for config dealers | `PrivateEnquiryForm` → vansales API `/enquire` (never a dealer inbox; `/api/enquiry` refuses `private-`/`vansales-private:`) |

Not shown anywhere on detail: a dedicated HPI/vehicle-history card, price history, finance calculator (component exists but unused), similar vans, save/share, seller/dealer rating, previous-owners/service-history for dealer vans, payload/roof for dealer vans.

`generateMetadata` and the page each call `getListingBySlug` (React `cache()`-memoised per request).

---

## 6. Dealer pages

**`/dealer/[slug]`** — resolves from the hard-coded `lib/dealers/config.ts` (only `swiss-vans` and the demo `acme-road-runner-vans`), else falls back to a Prisma `Dealer` row. Shows: hero with stat tiles (in-stock count etc.), About, "What we offer", Find us (address, hours, Leaflet map via geocoded town), CTA buttons (call/WhatsApp/finance), "Current stock" (first 12 `ListingCard`s + "See all N vans"). Stock is matched **by seller name string** against the catalogue, merged with that dealer's native DB listings. ISR 3600 s.

**Dealer directory** — `/directory` is *not* one; it is a make/model A–Z index. There is no `/dealers` route and no list of dealers anywhere.

**`/advertise`** — exists and is substantial (462 lines): hero, seller types, 4 plans — Private ("pay as you go"), £39/mo, £89/mo, £199/mo (+VAT, 14-day trial), comparison/"why us" copy. All paid CTAs go to `/dealer portal/login`; the private CTA goes to `/sell`. **No checkout or plan selection** — plans are marketing copy only (`lib/garage/api.ts` calls a `/api/wallet/topup` endpoint on the wallet/garage side; no plan checkout is wired to `/advertise`).

`/dealer portal/*` exists but the dashboard runs on mock data; `add-van` is an 813-line form.

---

## 7. Seller pages (private vs dealer)

Private adverts are a separate source (`ListingSource = "vansales"`):
- Fetched from `vansales-backend` public API (`GET /api/public/listings?seller_type=private`, detail `GET /api/public/listings/{slug}`), mapped by `lib/listings/sources/vansales.ts`.
- Slug prefix `private-` guarantees no collision with other sources' numeric ids.
- Seller shown as "Private seller" (name/email never exposed); no location (`town: "UK"`, no coords), no stock ref, no dealer link/CTAs.
- Own enquiry form (§5); `/api/enquiry` blocks them server-side.
- Only `active` adverts exist upstream.
- Merged into the catalogue by `loadExtras()`; dealer adverts sort ahead of private ones (`sourceRank`).
- No private-seller profile page; no "other adverts from this seller".
- Private sellers' own flow: `/sell` (landing), `/sign-up/private-seller`, `/garage` (mock-driven).

---

## 8. Data sources

`lib/listings/client.ts` is the only module screens import. `LISTINGS_SOURCE` env selects: `mock` (default) | `native` (fixtures) | anything else (`marketplace`, `dealski`, `live`) = **live stock from vansales-backend only**. *Update 2026-11-05: the direct Dealski feeds (`sources/dealski.ts`, `sources/dealski-marketplace.ts`) were removed; Dealski dealers' stock is imported into vansales-backend by `vansales:sync-dealski` and arrives as dealer adverts, so a synced van is no longer shown twice.*

| Source | File | Auth | Cache |
|---|---|---|---|
| **Native DB** (Prisma/Postgres, portal-added) | `sources/db.ts` | `DATABASE_URL` | part of `loadExtras` |
| **vansales-backend** dealer + private adverts (all dealer stock, incl. Swiss Vans) | `sources/vansales.ts` | none (public API), `VANSALES_API_URL` default `https://api.vansales.com` | fetch `revalidate: 60`, tags `vansales-private` / `vansales-dealer`, 8 s timeout, up to 20 pages |
| Mock + ACME demo | `sources/mock.ts`, `acme-demo.ts` | – | static |

How a page gets listings: `loadAll()` (per-request memoised via `cache()`) = **`loadExtras()` (native + private + dealer adverts from vansales-backend, parallel, 2.5 s / 5 s budgets, 60 s cache even on failure) + ACME demo listings if `SHOW_DEMO_LISTINGS`**. Live mode never falls back to mock. Everything is then filtered/sorted/paginated **in memory** on every render of a given ISR page.

Notes:
- **ACME demo listings are always merged into the live catalogue**, in every mode (`client.ts` `getAcmeDemoListings()`), including production. (Inferred impact: demo vans can appear in live search, counts, sitemap.)
- Postcode geocode: server → Dealski `/api/marketplace/geocode` (still needs `DEALSKI_MARKETPLACE_KEY`; this and the maps key are its only remaining uses), 24 h cache.
- Freshness mismatch: `/vans`, make, model and dealer pages are ISR **3600 s**, but private adverts refresh every **60 s** — a new private advert can take up to an hour to appear in listings while its detail page (60 s) resolves immediately. `/api/revalidate` exists to purge tags.
- Single-listing detail resolves: `private-` / `dealer-` prefix → vansales API detail; native DB (cuid only); mock only in mock/native mode. Old numeric Dealski-style URLs now 404 in live mode.
- Env vars referenced include `LISTINGS_SOURCE`, `DEALSKI_API_URL`, `DEALSKI_MARKETPLACE_URL/KEY`, `VANSALES_API_URL`, `DATABASE_URL`, `COMING_SOON`, Supabase + NextAuth + maps keys.
- `proxy.ts` preview key is committed in source (see §1).

---

## 9. Styling

- **Tailwind CSS v4** (`@tailwindcss/postcss`, `@import "tailwindcss"`), no component library; hand-rolled primitives in `components/ui.tsx`.
- **Design tokens** in `app/styles/tokens.css` ("Ink Navy + Signal Orange" v3, 2026): colour scales (`ink-*`, `surface-*`, `brand-*` navy, orange accent, success/warning), semantic aliases, type scale (`--text-2xs`…`--text-3xl`), radii, shadows, motion, gradients. Components use arbitrary-value classes like `rounded-[var(--radius-xl)]`, `text-[length:var(--text-sm)]`.
- **Fonts**: Geist (sans) + Geist Mono (labels/figures) via `next/font/google` (`app/fonts.ts`); `--font-display` is mapped to `--font-jakarta` in `globals.css`, but **no Plus Jakarta Sans is loaded** (`fonts.ts` only loads Geist), so headings fall back to a locally-installed Jakarta or the system sans stack (verify in a browser).
- Brand orange `#f47c1e → #d96410` used inline on card hover; dark navy bands with `.hero-grid` dot texture.
- **Responsive**: mobile-first Tailwind breakpoints (`sm/md/lg/xl`); card grid 1/2/3 columns; filter is a bottom-sheet-style modal; `FilterRail` collapses to `<details>` on mobile; separate `mobile-nav.tsx`.
- Plain `<img>` is used for card/gallery images (with an eslint-disable) instead of `next/image`.
- Leaflet CSS is loaded from unpkg at runtime in `list-map-toggle.tsx`.

---

## 10. Gap list

| # | Feature | Status | Evidence / what's missing |
|---|---|---|---|
| 1 | TUI chip multi-select search | **partial** | Multi-model chip multi-select with drag-reorder exists on `/vans` (within one make). No cross-make multi-select, no type-ahead "chip" search box, no free-text `q` UI. |
| 2 | Cash / finance toggle | **partial** | "Payment" monthly-budget slider + deposit exists (mutually exclusive with price range) and every card shows "≈ £/mo HP". No explicit Cash⇄Finance toggle that switches the whole results view/prices; finance calculator component is unused. |
| 3 | Map view | **exists** | `ListMapToggle` + Leaflet `MapView` on `/vans`. Plots the current page (24) only; private adverts have no coords so never appear. |
| 4 | Filters sidebar with chips | **partial** | Active chips exist (`/vans`). Filtering is a modal, not a sidebar; a true sidebar (`FilterRail`) exists only on model pages, without chips and with a smaller filter set. |
| 5 | HPI check card on detail | **partial** | "HPI checked" badge (private adverts, clear checks only). No card, no dates/items, nothing for dealer vans. Findings intentionally not public. |
| 6 | Features grid on detail | **partial** | Grid renders for dealer `features[]` but the feed mappers always return `[]` (never shows); private adverts show `extras` as chips, not a grid, with no grouping/icons. |
| 7 | YouTube embed | **exists** | Detail page, private adverts only (privacy-enhanced embed, lazy). |
| 8 | Seller video player | **exists** | Native `<video>` of seller walk-around (priority) or generated video; 9:16 download link. Private adverts only. |
| 9 | ULEZ / condition / V5 badges | **partial** | All three on the detail header for private adverts. Cards show only a ULEZ ✓ (heuristic for dealer vans: year ≥ 2016); condition and V5 not on cards; no ULEZ/condition/V5 filters on `/vans`. |
| 10 | Dealer advertising packages page | **partial** | `/advertise` exists with 4 priced plans and copy. No checkout/plan selection — CTAs go to the portal login. |
| 11 | Dealer directory | **missing** | No `/dealers` route. `/directory` is a make/model index. Only 2 dealers are in `lib/dealers/config.ts` (one is the ACME demo). |
| 12 | Location / radius search | **partial** | Postcode + radius (10–100 mi/Nationwide) + "nearest" sort + distance on cards work for dealer stock. Depends on `DEALSKI_MARKETPLACE_KEY` (silently no-ops without), excludes all private adverts (no coords), no "use my location", no town/outcode autocomplete, none on make/model pages. |
| 13 | Sort options | **partial** | `/vans`: newest, price ↑↓, mileage ↑, nearest. Missing: year, "relevance", distance-less location, discount; no sort UI on make/model/category pages. |

### Other findings worth a ticket
1. `/vans` shows **no results until a make is chosen**; filters/`q` alone return an empty make-gate page.
2. Dealer `features[]` and `euro_status` are never populated; dealer ULEZ is a year heuristic.
3. ACME demo listings are merged into the live catalogue in all modes.
4. `/saved` is linked in `header.tsx` but no `/saved` route exists (`SavedVan`/`SavedSearch` exist in Prisma only) → 404.
5. `/garage`, `/dealer portal` dashboard run on mock data.
6. Private-advert freshness: 60 s source cache vs 3600 s ISR on listing pages.
7. `--font-display` points at `--font-jakarta`, which isn't loaded.
8. Preview-gate key is committed in `proxy.ts`.
9. Dead components: `category-strip`, `finance-calculator`.
10. `/vans/[make]` shows only the first 24 vans with no pagination or filters.
11. All filtering runs in memory over the full catalogue per ISR render — fine at ~1.1k rows, a scaling limit beyond ~10k.

### Branch hygiene
There are ~60 remote branches. Merge status was checked by ancestry only (`feat/stripe-topup-garage` and `feat/distance-search` are ancestors of `main`; `feat/private-seller-listings` and `feat/van-details-public` are not, which for the latter is expected because PRs were squash-merged — #82/#83 are on `main`). Review before deleting any.
