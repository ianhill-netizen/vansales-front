import { SellPage, sellMetadata } from "@/components/sell/sell-page";

export const revalidate = 300;
export const metadata = sellMetadata("sell-my-van-online");

export default function Page() {
  return <SellPage slug="sell-my-van-online" />;
}
