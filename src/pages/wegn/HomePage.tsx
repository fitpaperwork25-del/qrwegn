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
            <h1>
              Build smarter.
              <br />
              Grow with <span>WEGN.</span>
            </h1>
            <p className="hero-copy">
              Practical technology for retail, hospitality, and appointment-based businesses—built to simplify
              operations and strengthen customer connections.
            </p>
            <div className="actions">
              <Link className="btn primary" to="/products">
                Explore WEGN Products
              </Link>
              <Link className="btn" to="/contact">
                Request a Demo
              </Link>
            </div>
            <div className="hero-note">Wegn Store · QRWegn · QRBooker</div>
          </div>

          <div className="hero-visual">
            <img src="/herolandingpage.png" alt="Wegn Store, QRWegn, and QRBooker working together as one connected platform" />
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
