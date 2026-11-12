# Vansales — front end

A modern UK van marketplace (AutoTrader-style), built **design-system-first**. No
backend lives here: the app consumes a listings API behind a swappable adapter.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · `next/font/local` (self-hosted woff2 in app/fonts, OFL).

---

## Design system (single source of truth)

The entire look is driven by **`app/styles/tokens.css`** — colour, type, radii,
shadows, spacing as CSS variables. Tailwind v4 maps to those tokens in
`app/globals.css` via `@theme inline`, so **editing `tokens.css` alone reskins the
whole product** (drop in a Claude Design palette and you're done).

**Direction — "Forecourt / Highway":** dark ink chrome, sodium-amber energy for
price + actions, a quiet teal secondary, and the signature: an authentic **UK
number-plate** badge plus an **instrument-cluster spec readout** on every card.

- **Display:** Bricolage Grotesque · **UI/body:** Hanken Grotesk · **Data:** Geist Mono
- **Primitives** (`components/`): `Container`, `Header`, `Footer`, `Button`, `Badge`,
  `ListingCard`, `Gallery`, `SpecTable`, plus `PlateBadge`, `Price`, `SpecReadout`,
  `VanPhoto` (on-brand SVG van imagery — no remote image hosts needed).

## Data layer (swappable)

`lib/listings/client.ts` exposes `getListings(filters)` and `getListingBySlug(slug)`,
both returning the canonical `Listing` type (`lib/listings/types.ts`). The active
source is chosen by env **`LISTINGS_SOURCE`**:

| Value | Behaviour |
|---|---|
| `mock` *(default)* | 12 bundled fixtures incl. several VW Transporters (`sources/mock.ts`) |
| `native` | This repo's own fixtures, badged as first-party |
| anything else (`marketplace`, `dealski`, `live`) | **Live stock from vansales-backend only** (`sources/vansales.ts`). No fixtures, no direct Dealski feed |

Every result reports which source served it (`servedBy`, `live`).

### Private sellers' adverts

Whatever `LISTINGS_SOURCE` is, active adverts from private sellers are merged in from the vansales-backend public feed
(`sources/vansales.ts`: `GET {VANSALES_API_URL}/api/public/listings?seller_type=private`, detail by slug). They appear in the
normal lists and facets with the **Private seller** badge, show the seller's cleaned photos and, when the seller made one, a
**video player** on the detail page. Their front-end slug is `private-<backend slug>` so it can never collide with another
source's numeric id. Buyers message a private seller with the form in `components/private-enquiry-form.tsx`, which posts
**straight from the browser** to `{NEXT_PUBLIC_VANSALES_API_URL}/api/public/listings/{id}/enquire` (so the API rate-limits the
buyer's own IP; the API emails the seller with Reply-To = the buyer and tells the buyer nothing about the seller). `/api/enquiry`
refuses their adverts (409) so a private seller's enquiry can never be forwarded to a dealer's inbox. `VANSALES_API_URL`
(server) and `NEXT_PUBLIC_VANSALES_API_URL` (browser) both default to `https://api.vansales.com`.

### Dealer stock

Dealski dealers' stock (Swiss Vans included) is imported into vansales-backend by `vansales:sync-dealski` (used vans only
for now) and reaches this site as dealer adverts via `/api/public/listings?seller_type=dealer`. The front end no longer
calls the Dealski stock feed. `DEALSKI_MARKETPLACE_KEY` is still used, but only for postcode geocoding and the maps key.

## Slugs

`make-model-derivative-town-{source_id}` (lowercased/hyphenated). `getListingBySlug`
resolves via the trailing `source_id` (`lib/listings/slug.ts`).

## Routes

- `/` — marketplace home: search hero, category strip, featured cards, seller band
- `/vans/[make]/[model]` — programmatic SEO page (e.g. `/vans/volkswagen/transporter`,
  H1 "Volkswagen Transporter for sale"): filter rail, responsive card grid, result
  count, SEO intro copy (from `~/vansales-seed` / `./seed` if present, else generated)
- `/listing/[slug]` — detail: gallery, price + VAT status, full spec table, seller
  block, stub enquiry CTA

## SEO

Per-route `generateMetadata` (title, description, canonical, OpenGraph); JSON-LD
`ItemList` on the model page and `Vehicle` + `Product`/`Offer` on detail;
`app/sitemap.ts` (from `getListings()`) and `app/robots.ts`; exactly one `<h1>` per page.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
```

Set `NEXT_PUBLIC_SITE_URL` for correct canonical/OG URLs in production (derived
automatically from `VERCEL_URL` on Vercel).
