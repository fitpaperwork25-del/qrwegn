export interface PricingPlan {
  id: string;
  name: string;
  /** Display string, not cents — matches the approved reference (some
   *  tiers show "Contact us" rather than a fixed number). */
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  featured: boolean;
}

export type PricingStatus = "available" | "coming_soon";

export interface PricingResponse {
  country: string;
  market: string;
  currency: string;
  status: PricingStatus;
  plans: PricingPlan[];
  /** Where this payload came from — "temporary-adapter" until a real
   *  WSMS/Platform Admin pricing endpoint exists. UI must not branch on
   *  this; it's for debugging/observability only. */
  source: string;
  generatedAt: string;
}
