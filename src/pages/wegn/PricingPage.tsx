import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPricing } from "../../lib/pricing/fetchPricing";
import WegnLayout from "../../components/wegn/WegnLayout";

// WEGN Restaurants keeps its existing self-service /register path (out of
// scope for the assisted-onboarding transition — see docs/WEGN_CUSTOMER_ACQUISITION_PROVISIONING_DESIGN_FREEZE.md).
// WEGN Store and WEGN Appointments route to Contact with product context
// until each has a real deep-link into its own registration surface.
const ASSISTED_SETUP_PLAN_IDS = new Set(["wegn-store", "wegn-appointments"]);

function ctaDestination(planId: string): string {
  return ASSISTED_SETUP_PLAN_IDS.has(planId) ? `/contact?product=${planId}&intent=setup` : "/contact";
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
              Prices are displayed by country and currency. In production, this section reads published plans
              from the WEGN Platform Admin backend.
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
            <div className="backend-status">
              <span className="status-dot" />
              <div>
                <strong>Backend-managed pricing</strong>
                <small>Served from /api/pricing; production prices would come from Platform Admin.</small>
              </div>
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
                      <Link className={`btn${plan.featured ? " primary" : ""}`} to={ctaDestination(plan.id)}>
                        {plan.ctaLabel}
                      </Link>
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
