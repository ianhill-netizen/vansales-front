import type { GarageData } from "./types";
import { MOCK_GARAGE } from "./mock";

// TODO: replace with fetch("/api/garage/me") when endpoint ships
export async function fetchGarage(): Promise<GarageData> {
  return structuredClone(MOCK_GARAGE);
}
