import { useSearchParams } from "react-router-dom";
import WegnLayout from "../../components/wegn/WegnLayout";

const APPROVED_PRODUCTS: Record<string, { name: string; price: string }> = {
  "wegn-store": { name: "WEGN Store", price: "4,000 Br/month" },
  "wegn-restaurants": { name: "WEGN Restaurants", price: "3,000 Br/month" },
  "wegn-appointments": { name: "WEGN Appointments", price: "1,500 Br/month" },
};

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get("product");
  const intent = searchParams.get("intent");

  // Both must be present and recognized — anything else (missing, unknown
  // product, unknown intent) falls back to the plain generic contact page,
  // no partial/half-context state, no error.
  const product = productSlug && intent === "setup" ? APPROVED_PRODUCTS[productSlug] : undefined;

  const emailHref = product
    ? `mailto:info@qrwegn.com?subject=${encodeURIComponent(`WEGN Setup Request — ${product.name}`)}&body=${encodeURIComponent(
        `Hi WEGN team,\n\nI'd like to request setup for ${product.name} (${product.price}).\n\n`
      )}`
    : "mailto:info@qrwegn.com";

  const whatsappHref = product
    ? `https://wa.me/16122830200?text=${encodeURIComponent(
        `Hi WEGN, I'd like to request setup for ${product.name} (${product.price}).`
      )}`
    : "https://wa.me/16122830200";

  return (
    <WegnLayout>
      <section id="contact">
        <div className="wrap">
          {product && (
            <div className="contact-context">
              <div>
                <strong>You&rsquo;re requesting setup for {product.name}.</strong> {product.price} · Assisted
                setup · 30-day free trial, no credit card required. A member of the WEGN team will reach out to
                get you set up — this isn&rsquo;t a self-service signup yet for this product.
              </div>
            </div>
          )}

          <div className="contact">
            <div>
              <div className="eyebrow">Contact WEGN</div>
              <h2>Talk to us — or request a demo.</h2>
              <p>Reach us by email, phone, or WhatsApp. Tell us about your business and we'll set up a demo of the right WEGN product for you.</p>
            </div>
            <div className="contact-list">
              <a className="contact-item" href={emailHref}>
                <span>Email</span>
                <span>info@qrwegn.com</span>
              </a>
              <a className="contact-item" href="tel:+16122830200">
                <span>Phone</span>
                <span>+1 (612) 283-0200</span>
              </a>
              <a className="contact-item" href={whatsappHref}>
                <span>WhatsApp</span>
                <span>+1 (612) 283-0200</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
