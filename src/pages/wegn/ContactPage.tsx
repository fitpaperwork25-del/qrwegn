import WegnLayout from "../../components/wegn/WegnLayout";

export default function ContactPage() {
  return (
    <WegnLayout>
      <section id="contact">
        <div className="wrap">
          <div className="contact">
            <div>
              <div className="eyebrow">Contact WEGN</div>
              <h2>Talk to us directly.</h2>
              <p>Reach us by email, phone, or WhatsApp.</p>
            </div>
            <div className="contact-list">
              <a className="contact-item" href="mailto:info@qrwegn.com">
                <span>Email</span>
                <span>info@qrwegn.com</span>
              </a>
              <a className="contact-item" href="tel:+16122830200">
                <span>Phone</span>
                <span>+1 (612) 283-0200</span>
              </a>
              <a className="contact-item" href="https://wa.me/16122830200">
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
