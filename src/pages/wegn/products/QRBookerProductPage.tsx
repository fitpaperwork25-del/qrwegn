import { Link } from "react-router-dom";
import WegnLayout from "../../../components/wegn/WegnLayout";

export default function QRBookerProductPage() {
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
            WEGN Appointments
          </div>
          <h1>Appointments and reservations, on the same WEGN foundation.</h1>
          <p className="hero-copy" style={{ margin: "0 auto 20px" }}>
            WEGN Appointments handles booking for service-based operators — clients reserve a slot, staff manage the
            schedule, and owners see the calendar fill up. It runs as its own product, built and operated
            independently alongside WEGN Restaurants and WEGN Store under WEGN.
          </p>
          <div className="for" style={{ textAlign: "center" }}>
            Built for
          </div>
          <div className="chips" style={{ justifyContent: "center", marginBottom: 32 }}>
            {["Salons", "Barbershops", "Clinics", "Spas", "Consultants", "Professionals"].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link className="btn primary" to="/contact?product=wegn-appointments&intent=setup">
              Request Setup
            </Link>
            <Link className="btn" to="/products">
              See all products
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { icon: "🗓️", label: "Client self-booking", sub: "No back-and-forth to grab a slot" },
              { icon: "👥", label: "Staff scheduling", sub: "One view of who's booked, and when" },
              { icon: "📈", label: "Owner visibility", sub: "See the calendar and demand at a glance" },
            ].map((f) => (
              <div key={f.label} className="card" style={{ minHeight: "auto", textAlign: "center" }}>
                <div>
                  <div className="icon" style={{ margin: "0 auto 18px" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 18 }}>{f.label}</h3>
                  <p className="purpose">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
