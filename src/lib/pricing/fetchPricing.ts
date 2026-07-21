import type { PricingResponse } from "./types";

/**
 * Single call site for published, country-based pricing. The frontend
 * never hard-codes plan names, prices, or features — everything here
 * comes from GET /api/pricing. Today that endpoint is a temporary
 * in-repo adapter; when WSMS/Platform Admin publishes a real pricing
 * endpoint, only api/pricing.ts needs to change — this contract
 * (PricingResponse) and every caller of fetchPricing() stay the same.
 */
export async function fetchPricing(country: string): Promise<PricingResponse> {
  const res = await fetch(`/api/pricing?country=${encodeURIComponent(country)}`);
  if (!res.ok) {
    throw new Error(`Failed to load pricing for "${country}" (${res.status})`);
  }
  return res.json();
}
