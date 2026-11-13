import type { Metadata } from "next";
import { AccessoryPage, accessoryMetadata } from "@/components/accessories/accessory-page";
import { ACCESSORY_HUB } from "@/lib/accessories";

// Hub: copy is the backend row "van-accessories". ISR 5 minutes; a missing row is a 404, an unreachable API errors the render instead of caching a 404.
export const revalidate = 300;
export const metadata: Metadata = accessoryMetadata(ACCESSORY_HUB);

export default function Page() {
  return <AccessoryPage page={ACCESSORY_HUB} isHub />;
}
