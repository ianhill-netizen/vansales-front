# URL tree audit: `/vans` vs `/used-vans` (2026-11-13)

Scope: audit only. No redirects or canonicals were changed in this PR.

## Data sources and what is NOT known
- Code: `app/(main)/vans/**`, `app/(main)/used-vans/**`, `lib/sitemap/build.ts`, `lib/redirects/*`, `components/seo/category-page.tsx`.
- Live sitemap `https://vansales.com/sitemap.xml` (fetched 2026-11-13, 338 URLs).
- Inbound internal links: `grep` over `app components lib content` (file counts, not link counts).
- **Google Search Console: not checked.** There is no `gcloud`/GSC CLI on this Mac and no GSC/Google credential variable in `~/repos/vansales-front/.env`. The GSC coverage feed that Agent 19 uses lives in Dealski, not here. So **no impression/click/ranking data went into this audit**; the recommendation below rests on structure, sitemap and link evidence only. Pull the GSC "Pages" report filtered on `/vans/` and `/used-vans/` to confirm before acting.

## Tree A: `/vans`
| Route | Generated | Canonical | Sitemap (live) | Notes |
|---|---|---|---|---|
| `/vans` | ISR 300s, dynamic (search params) | `/vans` | yes | Search/filter listing. Not a content page. |
| `/vans/{panel-van,luton,tipper,dropside,crew-van,pickup,minibus,chassis-cab,ulez}` | static pages (`category-page.tsx`), ISR 300s | self (`/vans/{slug}`) | yes (9) | Stock-driven, copy from `lib/seo/categories.ts`. |
| `/vans/used`, `/vans/new` | static, ISR | self | no | Thin stock views. |
| `/vans/electric` | n/a | n/a | no | 301 to `/electric-vans`. |
| `/vans/{make}-vans-for-sale` | `generateStaticParams` over every make in `ALL_MAKES`, ISR 300s | self | **3 only** (volkswagen, ford, land-rover) | `noindex,follow` when the make has no stock. Old `/vans/{make}` 301s here. |
| `/vans/{make}/{model}` | `generateStaticParams` over the 35 `MODEL_CONTENT` models, ISR 300s | self, page-only (`cleanPageUrl`) | **3 only** (vw transporter, transporter-kombi, ford transit-custom) | `noindex,follow` when the model has no stock (except `mercedes-benz/citan`). |

Backend dependency: none for existence (static allowlists); content comes from stock. Indexability therefore **follows live stock**, which is why only 6 of the make/model URLs are in the sitemap today.

## Tree B: `/used-vans`
| Route | Generated | Canonical | Sitemap (live) | Notes |
|---|---|---|---|---|
| `/used-vans` | ISR 300s | self, absolute title | yes | Index of makes, models, body types. |
| `/used-vans/{make}` | `generateStaticParams` over allowlisted makes, `dynamicParams` on, ISR 300s | self | 18 | 404 unless allowlisted make or a backend `make_hub` page is published. |
| `/used-vans/{make}/{model}-for-sale` | `generateStaticParams` returns `[]` (all on demand, ISR 300s) | self | 74 | 62 allowlisted models; **404 unless the backend `make_model` page is published**. Old `/{model}` 301s here. |
| `/used-vans/body-type/{slug}-for-sale` | `generateStaticParams` returns `[]`, ISR 300s | self | 12 | 12 allowlisted body types; 404 unless backend `body_type_pages` row is published. Old URL 301s here. |

Backend dependency: editorial copy and images are written by the content agent in vansales-backend; indexability does **not** depend on stock.

## Overlap (same search intent, two URLs)
| Intent | Tree A | Tree B |
|---|---|---|
| Luton / dropside / tipper / crew cab vans | `/vans/luton` `/vans/dropside` `/vans/tipper` `/vans/crew-van` | `/used-vans/body-type/{luton,dropside,tipper,crew-van}-for-sale` |
| A make | `/vans/{make}-vans-for-sale` | `/used-vans/{make}` |
| A model | `/vans/{make}/{model}` | `/used-vans/{make}/{model}-for-sale` |
| No twin | panel-van, pickup, minibus, chassis-cab, ulez, `/vans` | curtain-side, refrigerated, high-roof, long-wheelbase, 4x4, tail-lift, low-mileage, wheelchair-accessible |

Neither tree canonicals to the other; each is self-canonical. The code comments call them "different pages", but they target the same queries, so they compete.

## Inbound links (files referencing the route, internal)
- Tree A is what **site chrome** links to: header "By body type", mobile nav and footer "Browse stock"/"Popular models" all point at `/vans/{body}` and `/vans/{make}/{model}`; the make-page model list and `makeVansPath` are used in 14 files.
- Tree B is linked from the homepage SEO copy (this week), `/used-vans` index, landing-page `related` lists, body-type/model cross-links, `usedVanPath` (12 files), `bodyTypePath` (7 files), and the sitemap.
- **External backlinks land in Tree B**: `lib/redirects/backlinks.ts` sends the recovered legacy backlinks (Sprinter, Transporter, VW, Hilux, `/van_makes/*`) to `/used-vans/...`, and `/detail/:id` 308s to `/used-vans`.
- Rankings: unknown (no GSC access, see above).

## Recommendation
**Make `/used-vans` the canonical tree for make, model and body-type "money" pages; keep `/vans` as the search tool and for categories that have no twin.**

Why, from the evidence available:
1. Tree B pages are editorial, keyword-in-URL (`-for-sale`), stable, and independent of stock. Tree A pages flip to `noindex` when stock runs out and only 6 make/model URLs are indexable now, so Tree A cannot carry rankings reliably.
2. Tree B already holds 104 sitemap URLs vs 12 for Tree A make/model/category, plus the recovered external backlinks.
3. Tree A's remaining job is live inventory: `/vans` (filters, map), and categories with no Tree B equivalent (panel-van, pickup, minibus, chassis-cab, ulez).

Suggested follow-up (separate PR, once GSC is checked):
- 301 the twins: `/vans/{luton,dropside,tipper,crew-van}` to the body-type pages, `/vans/{make}-vans-for-sale` to `/used-vans/{make}` where the make has a Tree B page, `/vans/{make}/{model}` to `/used-vans/{make}/{model}-for-sale` where it is published. Where Tree B has no page, keep Tree A.
- Re-point header, mobile nav and footer at Tree B for the twinned links (the anchor-text change in this PR keeps hrefs as they were).
- **Caveat:** if GSC shows a Tree A URL with real clicks and a Tree B twin with none, keep that Tree A URL and redirect the other direction. Decide per twin, not globally.
