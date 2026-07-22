import { Link } from "react-router-dom";
import WegnLayout from "../../components/wegn/WegnLayout";

const PRODUCTS = [
  {
    to: "/products/wegn-store",
    icon: "🏪",
    name: "WEGN Store",
    purpose: "Manage sales, inventory, purchasing, customers, staff, and reporting in one place.",
    chips: ["Grocery stores", "Mini markets", "Retail shops", "Pharmacies", "Hardware stores", "Wholesalers"],
  },
  {
    to: "/products/qrwegn",
    icon: "🍽️",
    name: "WEGN Restaurants",
    purpose: "Create digital menus, ordering experiences, and guest engagement for hospitality businesses.",
    chips: ["Restaurants", "Coffee shops", "Hotels", "Cafés", "Lounges", "Resorts"],
  },
  {
    to: "/products/qrbooker",
    icon: "📅",
    name: "WEGN Appointments",
    purpose: "Manage appointments, schedules, customer bookings, and service availability.",
    chips: ["Salons", "Barbershops", "Clinics", "Spas", "Consultants", "Professionals"],
  },
];

export default function ProductsPage() {
  return (
    <WegnLayout>
      <section id="products">
        <div className="wrap">
          <div className="section-head">
            <h2>Choose the right WEGN product</h2>
            <p>Each platform is designed around a clear business type and a specific operational need.</p>
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
                <Link className="card-link" to={p.to}>
                  Explore {p.name} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
