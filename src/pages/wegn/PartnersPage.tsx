import WegnLayout from "../../components/wegn/WegnLayout";

export default function PartnersPage() {
  return (
    <WegnLayout>
      <section id="partners">
        <div className="wrap">
          <div className="contact">
            <div>
              <div className="eyebrow">WEGN Partners</div>
              <h2>Grow with WEGN.</h2>
              <p>Help businesses discover, adopt, and succeed with WEGN products in their local markets.</p>
              <p style={{ marginTop: 16 }}>
                Sell WEGN Restaurants and earn the first month&rsquo;s value — no limit on earnings, paid 10 days
                after the business&rsquo;s first successful payment. WEGN Appointments and WEGN Store partner terms
                follow as each product opens for partner sales.
              </p>
            </div>
            <div className="actions">
              <a className="btn primary" href="https://tally.so/r/gDJWe4" target="_blank" rel="noopener noreferrer">
                Become a Partner
              </a>
            </div>
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
