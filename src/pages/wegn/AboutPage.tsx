import WegnLayout from "../../components/wegn/WegnLayout";

const ITEMS = [
  { title: "Clear", sub: "Easy to understand at a glance." },
  { title: "Practical", sub: "Designed around daily operations." },
  { title: "Connected", sub: "Brings businesses and customers together." },
  { title: "Ready to grow", sub: "Supports new products and markets." },
];

export default function AboutPage() {
  return (
    <WegnLayout>
      <section id="why">
        <div className="wrap">
          <div className="why">
            <h2>Built for the way businesses actually work.</h2>
            <div className="why-grid">
              {ITEMS.map((item) => (
                <div key={item.title} className="why-item">
                  <strong>{item.title}</strong>
                  <span>{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
