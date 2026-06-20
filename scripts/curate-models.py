#!/usr/bin/env python3
"""
Build a model-level image map from ~/vansales-seed.
Primary signal: alt_text + filename → match to catalogue slug.

Algorithm (per-slug, not per-image):
  For each slug, collect all images where:
    1. Make matches (or make is ambiguous / undetectable)
    2. No HARD disqualifying derivative (tipper image → not a lease slug)
  Sort by quality, pick top MAX_PER_SLUG.

This means multiple slugs can share the same generic model image — correct
behaviour for `vivaro-lease` vs `vivaro-medium-van` vs `vivaro-prime`.

Outputs:
  public/media/models/[slug]/01.webp … 06.webp
  public/media/make/[make-slug]/01.webp … 06.webp
  scripts/model-images-manifest.json  -> {by_slug, by_make}
"""
import json, re, shutil
from pathlib import Path
from collections import defaultdict

SEED_DIR  = Path.home() / "vansales-seed" / "images"
MANIFEST  = Path.home() / "vansales-seed" / "manifest.json"
CATALOGUE = Path("content/new-vans/index.json")
OUT_MODELS = Path("public/media/models")
OUT_MAKE   = Path("public/media/make")
MANIFEST_OUT = Path("scripts/model-images-manifest.json")

MAX_PER_SLUG = 6
MIN_BYTES    = 25_000

# Junk filter
SKIP_FN_PARTS = [
    "logo","icon","placeholder","banner","info-box","badge",
    "woocommerce","arrow","tick","star","rating",
    "social","flag","map-","chart","graph",
]
SKIP_ALT_PHRASES = [
    "vans for sale","van for sale","van sales","new vans","used vans",
    "vansales","van marketplace","commercial vans","van deals",
    "finance","loan","insurance","business finance","vehicle finance",
    "google","review","testimonial","location","delivery",
    "builder","plumber","electrician","tradesman",
    "best alloy wheels","alloy wheels",
    "road trip","adventure",
]
RESIZE_RX = re.compile(r'-(\d{2,3})x(\d{2,3})\.')

def is_junk(img):
    fn  = img["filename"].lower()
    alt = (img.get("alt_text") or "").lower().strip()
    if any(p in fn for p in SKIP_FN_PARTS):
        return True
    m = RESIZE_RX.search(img["filename"])
    if m and int(m.group(1)) <= 300:
        return True
    if (img.get("bytes") or 0) < MIN_BYTES:
        return True
    if any(a in alt for a in SKIP_ALT_PHRASES):
        return True
    return False

# Make normalisation
CATALOGUE_MAKE_TO_SLUG = {
    "Citroen": "citroen", "Citroën": "citroen",
    "Fiat": "fiat", "Ford": "ford", "Iveco": "iveco",
    "Mercedes-Benz": "mercedes", "Nissan": "nissan",
    "Peugeot": "peugeot", "Renault": "renault",
    "Toyota": "toyota", "Van": None,
    "Vauxhall": "vauxhall", "Volkswagen": "vw",
}
SLUG_MAKE_OVERRIDE = {
    "new-renault-master":  "renault",
    "new-vauxhall-movano": "vauxhall",
}
MAKE_ALIASES = {
    "vw": "vw", "volkswagen": "vw",
    "citroen": "citroen", "citroën": "citroen",
    "mercedes": "mercedes", "mercedes-benz": "mercedes",
    "ford": "ford",
    "renault": "renault", "reenult": "renault",
    "vauxhall": "vauxhall", "peugeot": "peugeot",
    "fiat": "fiat", "toyota": "toyota",
    "nissan": "nissan", "iveco": "iveco",
}

def make_from_text(text):
    t = text.lower()
    for alias, slug in MAKE_ALIASES.items():
        if re.search(r'\b' + re.escape(alias) + r'\b', t):
            return slug
    return None

# Model name tokens — positive reward when found in both image text AND slug
MODEL_TOKENS = [
    "berlingo","dispatch","relay",
    "transit","ranger","connect","courier","tourneo",
    "ducato","doblo","scudo","boxer","expert","partner",
    "kangoo","master","trafic",
    "hilux","proace",
    "vivaro","movano",
    "crafter","caddy","amarok","transporter",
    "sprinter","vito","citan",
    "interstar","primastar","townstar",
    "daily",
]

# Hard disqualifiers: if pattern fires in image text AND slug_frag absent from slug → skip
HARD_DISQUALIFIERS = [
    (r"\btipper\b",      "tipper"),
    (r"\bluton\b",       "luton"),
    (r"\bcrew.?cab\b",   "crew"),
    (r"\bdouble.?cab\b", "double"),
    (r"\bminibus\b",     "minibus"),
    (r"\bkombi\b",       "kombi"),
    (r"\bcombi\b",       "combi"),
    (r"\blow.?loader\b", "low"),
]
# Soft penalties: pattern in image text but not in slug → subtract
SOFT_PENALTIES = [
    (r"\bsport\b",           "sport",     4),
    (r"\bphev\b",            "phev",      6),
    (r"\bdciv\b",            "dciv",      6),
    (r"\bautomatic\b",       "automatic", 4),
    (r"\be-transit\b|\be\.transit\b", "e-transit", 5),
]
# Positive bonuses: pattern in image text AND slug_frag in slug → add
POSITIVE_MATCHES = [
    (r"\bsport\b",      "sport",    8),
    (r"\btipper\b",     "tipper",  10),
    (r"\bluton\b",      "luton",   10),
    (r"\bcrew.?cab\b",  "crew",    10),
    (r"\bphev\b",       "phev",    10),
    (r"\bminibus\b",    "minibus", 10),
    (r"\bkombi\b",      "kombi",   10),
    (r"\bcombi\b",      "combi",   10),
    (r"\bdciv\b",       "dciv",    10),
    (r"\bautomatic\b",  "automatic",8),
    (r"\bdouble.?cab\b","double",  10),
    (r"\blow.?loader\b","low",     10),
    (r"\be-transit\b",  "e-transit",8),
    (r"\bcity\b",       "city",    6),
    (r"\bwildtrak\b|\braptor\b", "ranger", 5),
]

def image_text(img):
    fn = img["filename"]
    fn_clean = re.sub(
        r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '', fn)
    fn_clean = re.sub(r'[-_\.]', ' ', fn_clean)
    alt   = (img.get("alt_text") or "").strip()
    title = (img.get("title") or "").strip()
    return f"{alt} {title} {fn_clean}".lower()

def score_for_slug(txt, slug, make_slug):
    """Return int score or None (disqualified)."""
    img_make = make_from_text(txt)
    if img_make is not None:
        if img_make != make_slug:
            return None
        score = 10
    else:
        score = 2   # ambiguous make, lower weight

    for pattern, frag in HARD_DISQUALIFIERS:
        if re.search(pattern, txt, re.I) and frag not in slug:
            return None

    for pattern, frag, penalty in SOFT_PENALTIES:
        if re.search(pattern, txt, re.I) and frag not in slug:
            score -= penalty

    for pattern, frag, bonus in POSITIVE_MATCHES:
        if re.search(pattern, txt, re.I) and frag in slug:
            score += bonus

    for tok in MODEL_TOKENS:
        if tok in txt and tok in slug:
            score += 3

    return score

def img_quality(img):
    s = (img.get("bytes") or 0) // 1_000
    if "Background-Removed" in img["filename"]:
        s += 100_000
    if (img.get("alt_text") or "").strip():
        s += 500
    return s

def dedup(scored):
    seen, out = set(), []
    for s, img in scored:
        key = ((img.get("bytes") or 0) // 5_000, (img.get("alt_text") or "")[:40].strip())
        if key not in seen:
            seen.add(key)
            out.append((s, img))
    return out

def to_webp(src, dst):
    from PIL import Image
    with Image.open(src) as im:
        if im.mode not in ("RGBA", "LA"):
            im = im.convert("RGBA")
        im.save(dst, "WEBP", lossless=True, quality=100)

def rembg_to_webp(src, dst):
    from rembg import remove
    from PIL import Image
    from io import BytesIO
    with open(src, "rb") as f:
        raw = f.read()
    result = remove(raw)
    with Image.open(BytesIO(result)) as im:
        im.save(dst, "WEBP", lossless=True, quality=100)

def process_image(img, dst):
    if dst.exists():
        return True
    src = SEED_DIR / img["filename"]
    if not src.exists():
        print(f"    MISSING: {img['filename'][:50]}")
        return False
    is_bg = "Background-Removed" in img["filename"]
    try:
        if is_bg:
            to_webp(src, dst)
        else:
            rembg_to_webp(src, dst)
        return True
    except Exception as e:
        print(f"    FAIL {img['filename'][:40]}: {e}")
        return False

def main():
    with open(MANIFEST) as f:
        data = json.load(f)
    with open(CATALOGUE) as f:
        catalogue = json.load(f)

    all_imgs  = data["images"]
    good_imgs = [i for i in all_imgs if not is_junk(i)]
    print(f"Seed: {len(all_imgs)} total images, {len(good_imgs)} after junk filter")
    print(f"Catalogue: {len(catalogue)} slugs\n")

    # Build make slug per catalogue entry
    slug_make = {}
    for entry in catalogue:
        s  = entry["slug"]
        ms = SLUG_MAKE_OVERRIDE.get(s) or CATALOGUE_MAKE_TO_SLUG.get(entry["make"])
        if ms:
            slug_make[s] = ms

    # Pre-compute image text once
    img_texts = {img["filename"]: image_text(img) for img in good_imgs}

    OUT_MODELS.mkdir(parents=True, exist_ok=True)
    OUT_MAKE.mkdir(parents=True, exist_ok=True)

    slug_manifest = {}
    total_processed = 0
    total_rembg     = 0

    for entry in sorted(catalogue, key=lambda e: e["slug"]):
        slug      = entry["slug"]
        make_slug = slug_make.get(slug)
        if not make_slug:
            slug_manifest[slug] = []
            continue

        candidates = []
        for img in good_imgs:
            txt   = img_texts[img["filename"]]
            score = score_for_slug(txt, slug, make_slug)
            if score is not None and score >= 2:
                candidates.append((score, img))

        if not candidates:
            slug_manifest[slug] = []
            continue

        candidates.sort(key=lambda x: (x[0], img_quality(x[1])), reverse=True)
        candidates = dedup(candidates)[:MAX_PER_SLUG]

        slug_dir = OUT_MODELS / slug
        slug_dir.mkdir(exist_ok=True)
        paths = []

        bg_n    = sum(1 for _, i in candidates if "Background-Removed" in i["filename"])
        rembg_n = len(candidates) - bg_n
        print(f"── {slug} ({len(candidates)}  bg={bg_n}  rembg={rembg_n})")

        for idx, (score, img) in enumerate(candidates, start=1):
            dst   = slug_dir / f"{idx:02d}.webp"
            is_bg = "Background-Removed" in img["filename"]
            label = "copy" if is_bg else "rembg"
            alt_t = (img.get("alt_text") or "").strip()
            print(f"  {idx:02d} s={score:4d} ({label}) {img['filename'][:42]:42s} {alt_t[:35]}")
            if not is_bg:
                total_rembg += 1
            if process_image(img, dst):
                alt = alt_t or f"{slug.replace('-', ' ').title()} library image"
                paths.append({"path": f"/media/models/{slug}/{idx:02d}.webp", "alt": alt})
                total_processed += 1

        slug_manifest[slug] = paths

    # Make-level fallbacks
    make_buckets = defaultdict(list)
    for img in good_imgs:
        txt = img_texts[img["filename"]]
        ms  = make_from_text(txt)
        if ms:
            make_buckets[ms].append((img_quality(img), img))

    make_manifest = {}
    print(f"\n── Make fallbacks ──")
    for ms, items in sorted(make_buckets.items()):
        items.sort(key=lambda x: x[0], reverse=True)
        chosen = dedup(items)[:MAX_PER_SLUG]
        make_dir = OUT_MAKE / ms
        make_dir.mkdir(exist_ok=True)
        paths = []
        for idx, (_, img) in enumerate(chosen, start=1):
            dst = make_dir / f"{idx:02d}.webp"
            if process_image(img, dst):
                alt = (img.get("alt_text") or "").strip() or f"{ms.title()} van"
                paths.append({"path": f"/media/make/{ms}/{idx:02d}.webp", "alt": alt})
        make_manifest[ms] = paths
        print(f"  {ms:<15s}: {len(paths)}")

    with open(MANIFEST_OUT, "w") as f:
        json.dump({"by_slug": slug_manifest, "by_make": make_manifest}, f, indent=2)

    covered = sum(1 for v in slug_manifest.values() if v)
    empty   = sorted(k for k, v in slug_manifest.items() if not v)
    all_webp = list(OUT_MODELS.rglob("*.webp")) + list(OUT_MAKE.rglob("*.webp"))
    total_bytes = sum(p.stat().st_size for p in all_webp)

    print(f"\nSummary")
    print(f"  Images processed : {total_processed}  ({total_rembg} new rembg runs)")
    print(f"  Slugs covered    : {covered}/{len(catalogue)}")
    print(f"  Total WebP       : {total_bytes / 1_048_576:.1f} MB  ({len(all_webp)} files)")
    print(f"  Manifest         : {MANIFEST_OUT}")
    if empty:
        print(f"\nStill empty ({len(empty)}): {', '.join(empty)}")

if __name__ == "__main__":
    main()
