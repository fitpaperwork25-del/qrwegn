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
              <Link className="btn primary" to="/register">
                Start Free 30-Day Trial
              </Link>
              <Link className="btn" to="/products">
                Explore Products
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
