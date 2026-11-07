import { LandingPage, landingMetadata } from "@/components/landing/landing-page";
import { findLanding } from "@/lib/landing-pages";

export const revalidate = 300;

const def = findLanding("bad-credit-van-finance")!;
export const metadata = landingMetadata(def);

export default function Page() {
  return <LandingPage def={def} />;
}
