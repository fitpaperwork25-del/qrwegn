import WegnLayout from "../../components/wegn/WegnLayout";

const INDUSTRIES = ["Retail", "Grocery", "Restaurants", "Coffee Shops", "Hotels", "Professional Services"];

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
              <div key={i} className="industry">
                {i}
              </div>
            ))}
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
