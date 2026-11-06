import { SellPage, sellMetadata } from "@/components/sell/sell-page";

export const revalidate = 300;
export const metadata = sellMetadata("van-valuation");

export default function Page() {
  return <SellPage slug="van-valuation" />;
}
