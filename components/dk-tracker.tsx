"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId } from "@/lib/dk-visitor";

/**
 * Call from an enquiry/contact form submit handler after a successful submit.
 * Fire-and-forget — never awaited, never throws.
 *
 * @example
 *   import { trackEnquiry } from "@/components/dk-tracker";
 *   // inside handleSubmit, after data.ok:
 *   trackEnquiry({ name: fd.get("name"), email: fd.get("email"), mobile: fd.get("phone") });
 */
export function trackEnquiry(identity: {
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
}): void {
  if (typeof window === "undefined") return;

  fetch("/api/dk-track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitor_id: getVisitorId() || undefined,
      event_type: "enquiry",
      url: window.location.href,
      page_title: document.title,
      identity: {
        name: identity.name ?? undefined,
        email: identity.email ?? undefined,
        mobile: identity.mobile ?? undefined,
      },
    }),
  }).catch(() => {
    // Intentionally swallowed — tracking must never break the page.
  });
}

/**
 * Mounts invisibly in the root layout.
 * Fires a page_view event to /api/dk-track on every App Router navigation.
 * Parses utm_*, fbclid, gclid from the current URL and includes them.
 */
export default function DkTracker(): null {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Skip if the pathname hasn't actually changed (strict-mode double-invoke guard).
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    const visitorId = getVisitorId();
    const url = window.location.href;
    const referrer = document.referrer || undefined;

    // Extract campaign / ad-click identifiers from the current URL.
    const sp = new URLSearchParams(window.location.search);
    const campaign: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid"] as const) {
      const val = sp.get(key);
      if (val) campaign[key] = val;
    }

    fetch("/api/dk-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor_id: visitorId || undefined,
        event_type: "page_view",
        url,
        page_title: document.title,
        referrer,
        ...campaign,
      }),
    }).catch(() => {
      // Intentionally swallowed — tracking must never break the page.
    });
  }, [pathname]);

  return null;
}
