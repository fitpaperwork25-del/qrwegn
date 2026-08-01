import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPricing } from "../../lib/pricing/fetchPricing";
import WegnLayout from "../../components/wegn/WegnLayout";

// Unified product journey: all three products are self-service now. This
// was previously a two-tier map (WEGN Restaurants -> /register, WEGN Store
// and WEGN Appointments -> assisted Contact) which had a real bug besides -
// any plan id not in the assisted set (i.e. "wegn-restaurants") fell
// through to plain "/contact" instead of "/register", so the pricing
// card's own "Start WEGN Restaurants" button never actually started
// anything. Each product now gets its real self-service destination:
// WEGN Restaurants shares this deployment's own /register route; WEGN
// Store has no route of its own (no router in that app) so it gets an
// external link with the same ?intent=signup bootstrap
// AuthGate.tsx now reads; WEGN Appointments is a separate deployment with
// its own /register.
const SELF_SERVICE_DESTINATIONS: Record<string, string> = {
  "wegn-restaurants": "/register",
  "wegn-store": "https://wegn-store-app.vercel.app/?intent=signup",
  "wegn-appointments": "https://www.qrbooker.app/register",
};

function ctaDestination(planId: string): string {
  return SELF_SERVICE_DESTINATIONS[planId] ?? "/contact";
}

function isExternalDestination(destination: string): boolean {
  return destination.startsWith("http");
}

const COUNTRIES = [
  { code: "ET", label: "🇪🇹 Ethiopia" },
  { code: "UG", label: "🇺🇬 Uganda" },
  { code: "KE", label: "🇰🇪 Kenya" },
  { code: "OTHER", label: "🌍 Other countries" },
];

export default function PricingPage() {
  const [country, setCountry] = useState("ET");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pricing", country],
    queryFn: () => fetchPricing(country),
  });

  return (
    <WegnLayout>
      <section id="pricing">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Country-based pricing</div>
              <h2>Pricing that fits each market</h2>
            </div>
            <p>
              Prices are shown in your local currency where WEGN is available.
            </p>
          </div>

          <div className="pricing-toolbar">
            <div className="market-picker">
              <label htmlFor="countrySelect">Select your market</label>
              <select id="countrySelect" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && <div className="pricing-state">Loading pricing…</div>}
          {isError && <div className="pricing-state">Couldn&rsquo;t load pricing right now. Please try again shortly.</div>}
          {!isLoading && !isError && !data && (
            <div className="coming-soon">
              <h3>Pricing unavailable right now</h3>
              <p>We couldn&rsquo;t load pricing for this market. Please try again shortly, or contact us and we&rsquo;ll share pricing directly.</p>
              <Link className="btn primary" to="/contact">
                Contact WEGN
              </Link>
            </div>
          )}

          {data && (
            <>
              <div className="pricing-state">
                {data.market} · {data.currency} · {data.status === "available" ? "Published" : "Coming soon"}
              </div>

              <div className="pricing-cards">
                {data.status === "coming_soon" || data.plans.length === 0 ? (
                  <div className="coming-soon" style={{ gridColumn: "1/-1" }}>
                    <h3>Coming soon</h3>
                    <p>Country-specific pricing for {data.market} is not published yet.</p>
                    <Link className="btn primary" to="/contact">
                      Contact WEGN
                    </Link>
                  </div>
                ) : (
                  data.plans.map((plan) => (
                    <article key={plan.id} className={`price-card${plan.featured ? " featured" : ""}`}>
                      {plan.featured && <span className="price-badge">Most popular</span>}
                      <h3>{plan.name}</h3>
                      <div className="price">{plan.price}</div>
                      <div className="period">{plan.period}</div>
                      <ul>
                        {plan.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                      {isExternalDestination(ctaDestination(plan.id)) ? (
                        <a className={`btn${plan.featured ? " primary" : ""}`} href={ctaDestination(plan.id)}>
                          {plan.ctaLabel}
                        </a>
                      ) : (
                        <Link className={`btn${plan.featured ? " primary" : ""}`} to={ctaDestination(plan.id)}>
                          {plan.ctaLabel}
                        </Link>
                      )}
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          <div className="pricing-note">
            <strong>Important:</strong> Updating a public price does not automatically change the contracted
            price of an existing customer subscription.
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
