import { Link } from "react-router-dom";
import WegnLayout from "../../components/wegn/WegnLayout";

const INDUSTRIES = [
  { name: "Retail", to: "/products/wegn-store" },
  { name: "Grocery", to: "/products/wegn-store" },
  { name: "Restaurants", to: "/products/qrwegn" },
  { name: "Coffee Shops", to: "/products/qrwegn" },
  { name: "Hotels", to: "/products/qrwegn" },
  { name: "Professional Services", to: "/products/qrbooker" },
];

export default function IndustriesPage() {
  return (
    <WegnLayout>
      <section id="industries">
        <div className="wrap">
          <div className="section-head">
            <h2>Built around real industries</h2>
            <p>Visitors can immediately identify the product that fits their business.</p>
          </div>
          <div className="industries">
            {INDUSTRIES.map((i) => (
              <Link key={i.name} to={i.to} className="industry">
                {i.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
