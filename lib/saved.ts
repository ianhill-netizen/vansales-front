"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Saved vans for a visitor who is not signed in: the advert ids, kept in localStorage. They are mirrored into a cookie on the parent domain (vs_saved=1,2,3) so the portal on
 * sell.vansales.com, which is another origin and cannot read this localStorage, can send them to POST /api/private/saved/sync when the person signs in.
 */
const KEY = "vansales:saved";
const COOKIE = "vs_saved";
const MAX = 100;

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string" && /^\d+$/.test(x)).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  try {
    const host = location.hostname.split(".").slice(-2).join(".");
    const domain = /^[a-z0-9-]+\.[a-z]+$/i.test(host) && host.includes(".") && location.hostname !== "localhost" ? `; domain=.${host}` : "";
    document.cookie = `${COOKIE}=${ids.join(",")}; path=/; max-age=31536000; samesite=lax${domain}`;
  } catch {}
  window.dispatchEvent(new Event("vansales:saved"));
}

/** The saved ids and a toggle. `ready` is false until the first read (server render and first paint show every heart empty, so there is no mismatch). */
export function useSaved() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => setIds(read());
    // First read after hydration (localStorage does not exist on the server): the render before it shows every heart empty, so nothing mismatches.
    sync();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    window.addEventListener("vansales:saved", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("vansales:saved", sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = useCallback((id: string) => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur].slice(0, MAX));
  }, []);
  return { ids, ready, has: (id: string) => ids.includes(id), toggle };
}
