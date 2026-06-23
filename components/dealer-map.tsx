"use client";

import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

/* Inline SVG pin — avoids webpack's inability to resolve Leaflet's default
   marker image paths. Tinted with the site accent colour (#f47c1e). */
const PIN = divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40" aria-hidden="true">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.73 14 26 14 26S28 24.73 28 14C28 6.268 21.732 0 14 0z" fill="#f47c1e"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`,
  className: "",
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -42],
});

interface Props {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export function DealerMap({ lat, lng, name, address }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: 340, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]} icon={PIN}>
        <Popup>
          <strong>{name}</strong>
          {address && <><br />{address}</>}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
