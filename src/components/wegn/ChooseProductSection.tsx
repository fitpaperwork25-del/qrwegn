import { Link } from "react-router-dom";

const PRODUCTS = [
  {
    to: "/products/wegn-store",
    icon: "🏪",
    name: "Wegn Store",
    purpose: "Retail operations platform",
    chips: ["POS", "Inventory", "Purchasing", "Customers", "Staff", "Reporting"],
    cta: "View Wegn Store",
  },
  {
    to: "/products/qrwegn",
    icon: "🍽️",
    name: "QRWegn",
    purpose: "Hospitality platform",
    chips: ["Restaurants", "Cafés", "Hotels", "Digital menus", "QR ordering", "Guest engagement"],
    cta: "View QRWegn",
  },
  {
    to: "/products/qrbooker",
    icon: "📅",
    name: "QRBooker",
    purpose: "Appointment platform",
    chips: ["Salons", "Clinics", "Spas", "Consultants", "Scheduling", "Customer booking"],
    cta: "View QRBooker",
  },
];

// Helps visitors identify the right WEGN product — not a plan comparison.
// No pricing appears here; each CTA goes to that product's own page.
export default function ChooseProductSection() {
  return (
    <section id="choose-product">
      <div className="wrap">
        <div className="section-head">
          <h2>Choose your product</h2>
          <p>Three focused platforms, each built around a clear business type. Pick the one that matches yours.</p>
        </div>

        <div className="cards">
          {PRODUCTS.map((p) => (
            <article key={p.to} className="card">
              <div>
                <div className="icon">{p.icon}</div>
                <h3>{p.name}</h3>
                <p className="purpose">{p.purpose}</p>
                <div className="for">Best for</div>
                <div className="chips">
                  {p.chips.map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <Link className="btn primary" to={p.to} style={{ marginTop: 25, width: "100%" }}>
                {p.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
