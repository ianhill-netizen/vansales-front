# Vansales — front end

A modern UK van marketplace (AutoTrader-style), built **design-system-first**. No
backend lives here: the app consumes a listings API behind a swappable adapter.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · `next/font`.

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
| `dealski` | Live Swiss Vans stock feed (`sources/dealski.ts`), **auto-falls back to mock** if unreachable |
| `native` | This repo's own fixtures, badged as first-party |

Every result reports which source served it (`servedBy`, `live`).

### Live feed notes

The Dealski adapter targets the verified public endpoints behind
`swissvans.dealski.co.uk/stock`:

- `GET /api/public/stock?make=&page=&per_page=` — list
- `GET /api/public/stock/{id}` — detail
- `GET /api/public/stock/vehicles/facets` — facets

At time of writing the live feed serves rich make/model/spec data but **no photos
and no prices**, so mapped listings come through as POA with the SVG van renderer.
VW Transporters are coded `T28/T30/T32/T34` upstream and are normalised to model
`Transporter` in the adapter. The preview defaults to `mock` for visual fidelity;
set `LISTINGS_SOURCE=dealski` to serve live stock.

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
