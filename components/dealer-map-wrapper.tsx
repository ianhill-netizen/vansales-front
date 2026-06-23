"use client";

/* Thin "use client" shell so the dynamic(ssr:false) import can live in a
   Client Component — Next.js App Router forbids ssr:false in Server Components. */

import dynamic from "next/dynamic";

const DealerMapInner = dynamic(
  () => import("./dealer-map").then((m) => m.DealerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full animate-pulse bg-surface-2" />
    ),
  },
);

interface Props {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export function DealerMapClient(props: Props) {
  return <DealerMapInner {...props} />;
}
