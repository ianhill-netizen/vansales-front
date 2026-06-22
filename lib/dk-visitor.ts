const VISITOR_KEY = "dk_visitor_id";

/**
 * Return the persistent first-party visitor ID for Dealski event tracking.
 * Generated once per browser, stored in localStorage, never regenerated.
 * Safe to call server-side — returns "" when window is not available.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}
