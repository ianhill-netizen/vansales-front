<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Geography pages (/vans-for-sale/{key})

`lib/geo/config.ts` holds the radius and the index rule for town and city pages. `indexMinListings` is 6 for now (decision 2026-11-13): raise it as stock grows so thin pages stay noindex. Nation and region pages always index. Place data is GeoNames (CC BY 4.0); keep the attribution on town pages. Rebuild `lib/geo/places.json` with `scripts/build-places.py`.
