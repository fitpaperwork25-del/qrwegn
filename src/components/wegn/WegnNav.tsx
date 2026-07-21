import { Link } from "react-router-dom";
import WegnLogo from "./WegnLogo";

const LINKS = [
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/pricing", label: "Pricing" },
  { to: "/partners", label: "Partners" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function WegnNav() {
  return (
    <header>
      <div className="wrap nav">
        <Link className="brand" to="/" aria-label="WEGN home">
          <WegnLogo />
        </Link>
        <nav className="links" aria-label="Main navigation">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
          <Link className="btn primary" to="/products">
            Explore WEGN
          </Link>
        </nav>
      </div>
    </header>
  );
}
