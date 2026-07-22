import { Link } from "react-router-dom";
import WegnLayout from "../../../components/wegn/WegnLayout";

export default function WegnStoreProductPage() {
  return (
    <WegnLayout>
      <section className="hero">
        <div className="wrap" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
          <span
            className="price-badge"
            style={{ position: "static", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}
          >
            <span className="status-dot" style={{ width: 6, height: 6, boxShadow: "none" }} />
            Live product
          </span>
          <div className="eyebrow" style={{ textAlign: "center" }}>
            WEGN Store
          </div>
          <h1>Commerce for operators who sell more than a service.</h1>
          <p className="hero-copy" style={{ margin: "0 auto 20px" }}>
            WEGN Store is a product catalog and checkout built on the same WEGN foundation as WEGN Restaurants and
            WEGN Appointments, for operators who need retail alongside ordering or booking.
          </p>

          <div className="for" style={{ textAlign: "center" }}>
            Built for
          </div>
          <div className="chips" style={{ justifyContent: "center", marginBottom: 20 }}>
            {["Grocery stores", "Mini markets", "Retail shops", "Pharmacies", "Hardware stores", "Wholesalers"].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>

          <div className="for" style={{ textAlign: "center" }}>
            Key features
          </div>
          <div className="chips" style={{ justifyContent: "center", marginBottom: 32 }}>
            {["POS", "Inventory", "Purchasing", "Customers", "Staff", "Reporting"].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>

          <div className="actions" style={{ justifyContent: "center" }}>
            <Link className="btn primary" to="/contact">
              Get Started with WEGN Store →
            </Link>
            <Link className="btn" to="/products">
              See all products
            </Link>
          </div>
          <div className="hero-note">30-day free trial · No credit card required</div>
        </div>
      </section>
    </WegnLayout>
  );
}
