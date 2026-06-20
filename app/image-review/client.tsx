"use client";

import { useState, useEffect, useCallback } from "react";
import rawData from "@/lib/image-review/data.json";

type ImageEntry = {
  filename: string;
  alt: string;
  make: string;
  model: string;
  variant: string;
  slug: string;
};

type Edits = Record<string, { slug: string; excluded: boolean }>;

const IMAGES = rawData as ImageEntry[];
const LS_KEY = "vansales_image_review_edits";

function buildCsv(edits: Edits): string {
  const header = "filename,current_make,current_model,current_variant,correct_model_slug,excluded";
  const rows = IMAGES.map((img) => {
    const edit = edits[img.filename];
    const slug = edit?.slug ?? img.slug;
    const excluded = edit?.excluded ? "true" : "false";
    const cols = [img.filename, img.make, img.model, img.variant, slug, excluded];
    return cols.map((c) => (c.includes(",") || c.includes('"') ? `"${c.replace(/"/g, '""')}"` : c)).join(",");
  });
  return [header, ...rows].join("\n");
}

function groupByMake(images: ImageEntry[]): Record<string, ImageEntry[]> {
  const groups: Record<string, ImageEntry[]> = {};
  for (const img of images) {
    const key = img.make || "Unknown make";
    (groups[key] ??= []).push(img);
  }
  return groups;
}

export function ImageReviewClient() {
  const [ready, setReady] = useState(false);
  const [edits, setEdits] = useState<Edits>({});
  const [filter, setFilter] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setEdits(JSON.parse(saved) as Edits);
    } catch {
      // ignore corrupt localStorage
    }
    setReady(true);
  }, []);

  const saveEdits = useCallback((next: Edits) => {
    setEdits(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  function setSlug(filename: string, slug: string) {
    const next = { ...edits, [filename]: { ...(edits[filename] ?? {}), slug, excluded: edits[filename]?.excluded ?? false } };
    saveEdits(next);
  }

  function toggleExclude(filename: string) {
    const cur = edits[filename];
    const excluded = !(cur?.excluded ?? false);
    const slug = excluded ? "" : (cur?.slug ?? IMAGES.find((i) => i.filename === filename)?.slug ?? "");
    const next = { ...edits, [filename]: { slug, excluded } };
    saveEdits(next);
  }

  function handleCopy() {
    const csv = buildCsv(edits);
    navigator.clipboard.writeText(csv).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    }).catch(() => {
      // Fallback: select textarea
      const el = document.createElement("textarea");
      el.value = csv;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }

  function handleDownload() {
    const csv = buildCsv(edits);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image-map.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = filter.trim()
    ? IMAGES.filter((img) => {
        const q = filter.toLowerCase();
        return img.filename.toLowerCase().includes(q) || img.alt.toLowerCase().includes(q) || img.slug.toLowerCase().includes(q);
      })
    : IMAGES;

  const groups = groupByMake(filtered);
  const doneCount = IMAGES.filter((img) => {
    const e = edits[img.filename];
    return e?.excluded || (e?.slug && e.slug !== img.slug) || img.slug;
  }).length;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-32 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <h1 className="text-sm font-bold text-white">Image review</h1>
              <p className="text-xs text-white/40">{doneCount}/{IMAGES.length} assigned</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              style={{ background: copyDone ? "#16a34a" : "#1b5aa8" }}
            >
              {copyDone ? "Copied!" : "Copy CSV"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Download CSV
            </button>
          </div>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by filename, alt text, or slug…"
            className="mt-2 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30 focus:bg-white/8"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="mx-auto max-w-5xl px-4 pt-6 space-y-10">
        {Object.entries(groups).sort(([a], [b]) => (a === "Unknown make" ? 1 : b === "Unknown make" ? -1 : a.localeCompare(b))).map(([make, imgs]) => (
          <section key={make}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">{make} — {imgs.length}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {imgs.map((img) => {
                const edit = edits[img.filename];
                const excluded = edit?.excluded ?? false;
                const currentSlug = edit?.slug ?? img.slug;
                return (
                  <div
                    key={img.filename}
                    className={`relative rounded-lg border bg-white/5 p-2 transition-opacity ${excluded ? "opacity-30 border-white/5" : "border-white/10"}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-white/5">
                      {/* checkerboard bg to show transparency */}
                      <div className="absolute inset-0" style={{ backgroundImage: "repeating-conic-gradient(#444 0% 25%, #333 0% 50%)", backgroundSize: "20px 20px" }} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/image-review/${img.filename}`}
                        alt={img.alt}
                        className="absolute inset-0 h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    {/* Metadata */}
                    <p className="mt-2 break-all text-[10px] leading-tight text-white/30">{img.filename.slice(0, 50)}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-white/50">{img.alt.slice(0, 60)}</p>

                    {/* Slug input */}
                    <input
                      type="text"
                      value={currentSlug}
                      onChange={(e) => setSlug(img.filename, e.target.value)}
                      placeholder="make/model"
                      disabled={excluded}
                      className="mt-2 w-full rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
                    />

                    {/* Exclude toggle */}
                    <label className="mt-2 flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={excluded}
                        onChange={() => toggleExclude(img.filename)}
                        className="h-3.5 w-3.5 accent-red-500"
                      />
                      <span className="text-[11px] font-semibold text-white/40">Exclude</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-white/30">No images match your filter.</p>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <p className="text-xs text-white/40">
            {IMAGES.filter((i) => edits[i.filename]?.excluded).length} excluded ·{" "}
            {IMAGES.filter((i) => !edits[i.filename]?.excluded && edits[i.filename]?.slug).length} manually assigned
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded px-4 py-2 text-sm font-bold text-white"
              style={{ background: copyDone ? "#16a34a" : "#1b5aa8" }}
            >
              {copyDone ? "Copied!" : "Copy CSV"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
