"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface Props {
  lat: number;
  lng: number;
  name: string;
  address: string;
  apiKey: string;
}

export function GoogleDealerMap({ lat, lng, name, address, apiKey }: Props) {
  const center = { lat, lng };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling="cooperative"
        disableDefaultUI
        mapId="dealer-map"
        style={{ height: 340, width: "100%" }}
      >
        <AdvancedMarker position={center} title={`${name}${address ? ` · ${address}` : ""}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="40"
            viewBox="0 0 28 40"
            aria-hidden="true"
          >
            <path
              d="M14 0C6.268 0 0 6.268 0 14c0 10.73 14 26 14 26S28 24.73 28 14C28 6.268 21.732 0 14 0z"
              fill="#f47c1e"
            />
            <circle cx="14" cy="14" r="5.5" fill="white" />
          </svg>
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}

interface WrapperProps {
  lat: number | null;
  lng: number | null;
  name: string;
  address: string;
}

export function GoogleDealerMapWrapper({ lat, lng, name, address }: WrapperProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) return;
    fetch("/api/maps-key")
      .then((r) => r.json())
      .then((d: { key?: string }) => {
        if (d.key) setApiKey(d.key);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [lat, lng]);

  if (lat == null || lng == null || failed) {
    return (
      <div className="flex h-[340px] items-center justify-center bg-surface-2 text-[var(--text-sm)] text-ink-500">
        {address || name}
      </div>
    );
  }

  if (!apiKey) {
    return <div className="h-[340px] w-full animate-pulse bg-surface-2" />;
  }

  return <GoogleDealerMap lat={lat} lng={lng} name={name} address={address} apiKey={apiKey} />;
}
