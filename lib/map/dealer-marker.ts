import type { DivIcon } from "leaflet";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/**
 * The dealer map marker, shared by the dealer page map and the /dealers directory map: a flat dark pill with the dealer's name and a downward caret.
 * The element's bottom edge (the caret tip) sits on the coordinate. The name is HTML-escaped because it is dealer-supplied.
 * Leaflet is loaded dynamically by the map, so the loaded module is passed in rather than imported here.
 */
export function createDealerMarker(L: typeof import("leaflet"), name: string): DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div style="transform:translate(-50%,-100%);display:inline-block;cursor:pointer"><div style="background:#1a1a1a;color:#fff;font:500 12px/1.2 var(--font-geist,system-ui);padding:6px 12px;border-radius:6px;white-space:nowrap;text-align:center">${escapeHtml(name)}</div><div style="width:0;height:0;margin:0 auto;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #1a1a1a"></div></div>`,
  });
}
