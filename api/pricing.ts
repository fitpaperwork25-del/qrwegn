import type { VercelRequest, VercelResponse } from "@vercel/node";

// TEMPORARY ADAPTER — this is not a second pricing authority.
//
// The long-term source of truth for published pricing is the WEGN
// Platform Admin / WSMS system (see src/lib/wsms/, supabase/functions/
// check-subscription, and docs/WSMS_PRODUCT_INTEGRATION_PATTERN.md for
// the existing WSMS integration pattern used for entitlements). WSMS
// does not yet expose a public "published pricing" endpoint — only
// per-business entitlement checks (check-subscription) and trial
// registration (register-with-wsms).
//
// Until that endpoint exists, this file is the ENTIRE implementation of
// GET /api/pricing: a stateless function keyed by country. Nothing here
// is persisted to a database — there is no new pricing table, no new
// row of record. That's deliberate: a DB table would itself become a
// second authority that could drift from WSMS. A hardcoded response in
// one file is trivially deleted.
//
// Data below mirrors the approved reference's embedded pricingData
// object (wegn-shell-pricing-ai-v3.html) — same countries, same plans,
// same "coming soon" markets — reproduced faithfully, not invented.
//
// To replace this adapter with the real thing later: swap the body of
// getPricing() below for a fetch() to WSMS's pricing endpoint (same
// productKey/secret pattern as check-subscription's WSMS_URL /
// WSMS_PRODUCT_SECRET), following exactly the same shape (PricingResponse,
// mirrored in src/lib/pricing/types.ts). No caller of fetchPricing() or
// any page needs to change.

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  featured: boolean;
}

interface PricingResponse {
  country: string;
  market: string;
  currency: string;
  status: "available" | "coming_soon";
  plans: PricingPlan[];
  source: string;
  generatedAt: string;
}

type CountryData = Pick<PricingResponse, "market" | "currency" | "status" | "plans">;

const COUNTRIES: Record<string, CountryData> = {
  ET: {
    market: "Ethiopia",
    currency: "ETB",
    status: "available",
    plans: [
      {
        id: "starter",
        name: "Starter",
        price: "1,500 Br",
        period: "per month",
        features: ["Core product access", "Single business location", "Standard support"],
        ctaLabel: "Start with Starter",
        featured: false,
      },
      {
        id: "business",
        name: "Business",
        price: "3,000 Br",
        period: "per month",
        features: ["Expanded operations", "More staff access", "Priority support"],
        ctaLabel: "Choose Business",
        featured: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Contact us",
        period: "custom commercial plan",
        features: ["Multiple locations", "Implementation support", "Custom operational needs"],
        ctaLabel: "Contact Sales",
        featured: false,
      },
    ],
  },
  UG: { market: "Uganda", currency: "UGX", status: "coming_soon", plans: [] },
  KE: { market: "Kenya", currency: "KES", status: "coming_soon", plans: [] },
  OTHER: { market: "Other countries", currency: "Local or USD", status: "coming_soon", plans: [] },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const country = typeof req.query.country === "string" ? req.query.country.toUpperCase() : "ET";
  const data = COUNTRIES[country];
  if (!data) {
    return res.status(404).json({ error: `Unknown country "${country}"` });
  }

  const body: PricingResponse = {
    country,
    market: data.market,
    currency: data.currency,
    status: data.status,
    plans: data.plans,
    source: "temporary-adapter",
    generatedAt: new Date().toISOString(),
  };

  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  return res.status(200).json(body);
}
