import { Link } from "react-router-dom";
import WegnLogo from "./WegnLogo";

export default function WegnFooter() {
  return (
    <footer>
      <div className="wrap footer-main">
        <div className="footer-brand">
          <WegnLogo />
          <p>Practical technology for businesses that want to operate clearly, connect with customers, and grow.</p>
        </div>
        <div className="footer-col">
          <h4>Products</h4>
          <Link to="/products/wegn-store">Wegn Store</Link>
          <Link to="/products/qrwegn">QRWegn</Link>
          <Link to="/products/qrbooker">QRBooker</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/industries">Industries</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/about">About</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
          <Link to="/acceptable-use">Acceptable Use</Link>
        </div>
      </div>
      <div className="wrap">
        <div className="footer-bottom">
          <span>© 2026 WEGN. All rights reserved.</span>
          <div className="legal-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
        </div>
        <p className="disclaimer">
          Disclaimer: Information on this website is provided for general informational purposes only. Product
          features, pricing, availability, and service terms may change without notice. All trademarks, logos,
          product names, and content belong to their respective owners. Unauthorized reproduction or distribution
          is prohibited.
        </p>
      </div>
    </footer>
  );
}
