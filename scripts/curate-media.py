#!/usr/bin/env python3
"""
Curate van images from ~/vansales-seed, background-remove, convert to WebP.
Outputs to public/media/[make-slug]/ and writes scripts/model-images-manifest.json.
"""
import json, os, re, shutil, sys
from pathlib import Path

SEED_DIR   = Path.home() / "vansales-seed" / "images"
MANIFEST   = Path.home() / "vansales-seed" / "manifest.json"
OUT_DIR    = Path("public/media")
MANIFEST_OUT = Path("scripts/model-images-manifest.json")

# Max images per make; prefer bg-removed; only rembg if < MIN_BG available
MAX_PER_MAKE = 6
MIN_BG       = 3   # if we have >= MIN_BG already bg-removed, skip rembg for that make

# Search terms per catalogue make → (slug, [keywords])
MAKES = [
    ("ford",          ["ford", "transit", "ranger", "tourneo", "e-transit"]),
    ("volkswagen",    ["vw", "volkswagen", "crafter", "transporter", "caddy", "amarok"]),
    ("citroen",       ["citroen", "berlingo", "dispatch", "relay"]),
    ("renault",       ["renault", "master", "trafic", "kangoo"]),
    ("toyota",        ["toyota", "hilux", "proace"]),
    ("mercedes-benz", ["mercedes", "sprinter", "vito", "citan"]),
    ("vauxhall",      ["vauxhall", "vivaro", "movano"]),
    ("peugeot",       ["peugeot", "boxer", "expert", "partner", "traveller"]),
    ("fiat",          ["fiat", "ducato", "doblo", "scudo"]),
    ("nissan",        ["nissan", "interstar", "primastar", "townstar"]),
    ("iveco",         ["iveco", "daily"]),
]

SKIP_PATTERNS = [
    "logo", "icon", "placeholder", "banner", "woocommerce",
    "info-box", "badge", "avatar", "social", "arrow", "tick",
    "check", "star", "rating", "flag", "map", "chart", "graph",
    "thumbnail-", "-thumb", "getPngImage",  # generic utility images
]
SKIP_SIZE_RX = re.compile(r"-(\d{2,3})x(\d{2,3})\.")   # e.g. -100x100.
MIN_BYTES    = 25_000

def is_junk(img):
    fn = img["filename"].lower()
    if any(p in fn for p in SKIP_PATTERNS):
        return True
    m = SKIP_SIZE_RX.search(img["filename"])
    if m:
        w, h = int(m.group(1)), int(m.group(2))
        if w <= 300 and h <= 300:
            return True
    if img.get("bytes", 0) < MIN_BYTES:
        return True
    return False

def match_make(img, keywords):
    haystack = (
        img.get("filename", "").lower()
        + " " + img.get("alt_text", "").lower()
        + " " + img.get("title", "").lower()
    )
    return any(kw.lower() in haystack for kw in keywords)

def score(img):
    s = img.get("bytes", 0) // 1000
    if "Background-Removed" in img["filename"]:
        s += 10_000  # strongly prefer pre-removed
    return s

def to_webp(src: Path, dst: Path):
    """Convert src image to dst WebP (lossless when RGBA, lossy q=90 otherwise)."""
    from PIL import Image
    with Image.open(src) as im:
        if im.mode in ("RGBA", "LA", "PA"):
            im.save(dst, "WEBP", lossless=True, quality=100)
        else:
            # Convert to RGBA first so rembg result always has alpha
            im.convert("RGBA").save(dst, "WEBP", lossless=True, quality=100)

def rembg_to_webp(src: Path, dst: Path):
    """Background-remove src then save as lossless RGBA WebP."""
    from rembg import remove
    from PIL import Image
    with open(src, "rb") as f:
        raw = f.read()
    result = remove(raw)  # returns PNG bytes with alpha
    from io import BytesIO
    with Image.open(BytesIO(result)) as im:
        im.save(dst, "WEBP", lossless=True, quality=100)

def main():
    with open(MANIFEST) as f:
        data = json.load(f)
    all_imgs = data["images"]

    print(f"Manifest: {len(all_imgs)} images")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output_map = {}   # make_slug → list of public paths
    total_processed = 0
    total_rembg = 0

    for (slug, keywords) in MAKES:
        print(f"\n── {slug} ──")
        make_dir = OUT_DIR / slug
        make_dir.mkdir(exist_ok=True)

        # Find all candidate images for this make
        candidates = [
            img for img in all_imgs
            if img.get("downloaded") and match_make(img, keywords) and not is_junk(img)
        ]
        candidates.sort(key=score, reverse=True)
        print(f"  Candidates: {len(candidates)}")

        bg_removed  = [i for i in candidates if "Background-Removed" in i["filename"]]
        raw_images  = [i for i in candidates if "Background-Removed" not in i["filename"]]
        print(f"  Pre-bg-removed: {len(bg_removed)}  raw: {len(raw_images)}")

        # Decide what to process
        selected_bg  = bg_removed[:MAX_PER_MAKE]
        need_rembg   = max(0, MAX_PER_MAKE - len(selected_bg))
        if len(selected_bg) >= MIN_BG:
            # Already have enough clean cut-outs — don't burn time on rembg
            selected_raw = []
        else:
            selected_raw = raw_images[:need_rembg]

        selected = selected_bg + selected_raw
        if not selected:
            print("  SKIP — no usable images found; will use orange fallback")
            output_map[slug] = []
            continue

        paths = []
        for idx, img in enumerate(selected[:MAX_PER_MAKE], start=1):
            src_path = SEED_DIR / img["filename"]
            if not src_path.exists():
                print(f"  MISSING: {img['filename']}")
                continue

            dst_path = make_dir / f"{idx:02d}.webp"
            is_bg = "Background-Removed" in img["filename"]

            if dst_path.exists():
                print(f"  {idx:02d}.webp already exists — skipping")
            elif is_bg:
                # Already cut-out: convert/copy to WebP
                ext = src_path.suffix.lower()
                if ext == ".webp":
                    shutil.copy2(src_path, dst_path)
                else:  # PNG with alpha
                    to_webp(src_path, dst_path)
                size_kb = dst_path.stat().st_size // 1024
                print(f"  {idx:02d}.webp  ← {img['filename'][:50]}  [{size_kb}KB] (copy/convert)")
            else:
                # Need background removal
                print(f"  {idx:02d}.webp  ← rembg({img['filename'][:45]})  [{img['bytes']//1024}KB raw]")
                try:
                    rembg_to_webp(src_path, dst_path)
                    size_kb = dst_path.stat().st_size // 1024
                    print(f"           → {size_kb}KB  ✓")
                    total_rembg += 1
                except Exception as e:
                    print(f"           → FAILED: {e}")
                    continue

            paths.append(f"/media/{slug}/{idx:02d}.webp")
            total_processed += 1

        output_map[slug] = paths
        print(f"  → {len(paths)} images: {paths}")

    # Write the manifest JSON
    with open(MANIFEST_OUT, "w") as f:
        json.dump(output_map, f, indent=2)
    print(f"\n✓ Done. {total_processed} images ({total_rembg} rembg runs)")
    print(f"✓ Manifest → {MANIFEST_OUT}")

    # Print size summary
    total_bytes = sum(
        p.stat().st_size
        for p in OUT_DIR.rglob("*.webp")
    )
    print(f"✓ Total public/media size: {total_bytes / 1_048_576:.1f} MB")

if __name__ == "__main__":
    main()
