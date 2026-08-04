import { Link } from "react-router-dom";
import WegnLayout from "../../components/wegn/WegnLayout";
import EcosystemBar from "../../components/wegn/EcosystemBar";
import ChooseProductSection from "../../components/wegn/ChooseProductSection";
import AiShowcaseSection from "../../components/wegn/AiShowcaseSection";

export default function HomePage() {
  return (
    <WegnLayout>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">One ecosystem. Three focused products.</div>
            <h1>Run Your Business with the Devices You Already Own.</h1>
            <p className="hero-copy">
              WEGN runs on your laptop, desktop, tablet, or smartphone.
              <br />
              Add a barcode scanner and receipt printer when you need them.
              <br />
              No proprietary hardware required.
            </p>
            <div className="actions">
              {/*
                This is the ecosystem homepage, not a single product's page -
                it must never commit a visitor to one product before they've
                chosen one. Previously "Start Free 30-Day Trial" linked
                straight to /register, WEGN Restaurants' own signup route -
                every visitor's trial silently started as a WEGN Restaurants
                signup regardless of which product they actually wanted.
                One button now, since a second button to the same
                destination added nothing: it goes to /products (the
                existing product-selection page - ChooseProductSection
                just below, and ProductsPage.tsx's own cards), where each
                product's own page has its own real "Start Free Trial" CTA
                (see WegnStoreProductPage.tsx / WegnRestaurantsProductPage.tsx /
                WegnAppointmentsProductPage.tsx).
              */}
              <Link className="btn primary" to="/products">
                Start Free Trial
              </Link>
            </div>
            <div className="hero-note">No credit card required</div>
            <div className="hero-note">WEGN Store · WEGN Restaurants · WEGN Appointments</div>
          </div>

          <div className="hero-visual">
            <img src="/hero.png" alt="A laptop, tablet, smartphone, barcode scanner, receipt printer, and QR table stand — the everyday devices WEGN runs on" />
            <div className="hero-overlay" />
            <div className="hero-badge">
              Built to connect growing businesses
              <span>Across Africa and beyond</span>
            </div>
          </div>
        </div>
      </section>

      <EcosystemBar />
      <ChooseProductSection />
      <AiShowcaseSection />
    </WegnLayout>
  );
}
