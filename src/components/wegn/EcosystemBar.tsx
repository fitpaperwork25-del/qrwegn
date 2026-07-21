import { Link } from "react-router-dom";

const ECO_ITEMS = [
  { to: "/products/wegn-store", name: "Wegn Store", purpose: "Retail operations" },
  { to: "/products/qrwegn", name: "QRWegn", purpose: "Hospitality experiences" },
  { to: "/products/qrbooker", name: "QRBooker", purpose: "Appointments and scheduling" },
];

export default function EcosystemBar() {
  return (
    <div className="ecosystem-bar">
      <div className="wrap ecosystem">
        <Link className="eco-intro" to="/products">
          <strong>The WEGN ecosystem</strong>
          <span>One brand. Focused solutions for different business needs.</span>
        </Link>
        {ECO_ITEMS.map((item) => (
          <Link key={item.to} className="eco-item" to={item.to}>
            <strong>{item.name}</strong>
            <span>{item.purpose}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
