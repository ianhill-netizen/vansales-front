"use client";

import dynamic from "next/dynamic";

const GoogleDealerMapWrapperInner = dynamic(
  () => import("./google-dealer-map").then((m) => m.GoogleDealerMapWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full animate-pulse bg-surface-2" />
    ),
  },
);

interface Props {
  lat: number | null;
  lng: number | null;
  name: string;
  address: string;
}

export function DealerMapClient(props: Props) {
  return <GoogleDealerMapWrapperInner {...props} />;
}
