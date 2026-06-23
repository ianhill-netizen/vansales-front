"use client";

import { APIProvider, Map, Marker, useApiLoadingStatus } from "@vis.gl/react-google-maps";

const CARDIFF = { lat: 51.4816, lng: -3.1791 } as const;

function MapView() {
  const status = useApiLoadingStatus();

  if (status === "FAILED") {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="max-w-sm text-center text-red-600">
          Map failed to load — check API key, billing, or domain restrictions.
        </p>
      </div>
    );
  }

  if (status !== "LOADED") {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading map…</p>
      </div>
    );
  }

  return (
    <Map
      defaultCenter={CARDIFF}
      defaultZoom={12}
      style={{ width: "100%", height: "100%" }}
    >
      <Marker position={CARDIFF} title="Cardiff Test Location" />
    </Map>
  );
}

export default function MapsTestPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Google Maps API key is not configured.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <APIProvider
        apiKey={apiKey}
        onError={(e) => console.error("[Maps POC] Google Maps failed to load:", e)}
      >
        <MapView />
      </APIProvider>
    </div>
  );
}
