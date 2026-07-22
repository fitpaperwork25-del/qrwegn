import LegalPageLayout from "./LegalPageLayout";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro="These Terms of Service govern your access to and use of WEGN Restaurants, WEGN Store, WEGN Appointments, and related WEGN products."
      sections={[
        {
          heading: "Acceptance of Terms",
          body: [
            "By creating an account or using any WEGN product, you agree to be bound by these Terms. If you are using WEGN on behalf of a business, you confirm you have authority to accept these Terms for that business.",
          ],
        },
        {
          heading: "Description of Service",
          body: [
            "WEGN provides software products for ordering, retail, and booking, including WEGN Restaurants (menu and ordering), WEGN Store (retail commerce), and WEGN Appointments (appointments). Features and availability may vary by market.",
          ],
        },
        {
          heading: "Accounts & Eligibility",
          body: [
            "You must provide accurate account information and keep your login credentials secure. You are responsible for activity that occurs under your account.",
          ],
        },
        {
          heading: "Acceptable Use",
          body: [
            "You agree to use WEGN products only for lawful purposes and in line with our Acceptable Use Policy. We may suspend or terminate access for use that violates these Terms.",
          ],
        },
        {
          heading: "Subscriptions & Payment",
          body: [
            "Paid plans are billed on the cycle shown at checkout or on your Pricing page selection. Updating a published price does not retroactively change the contracted price of an existing subscription unless you are notified otherwise.",
          ],
        },
        {
          heading: "Intellectual Property",
          body: [
            "WEGN and its products, including all associated branding and software, are owned by WEGN or its licensors. You retain ownership of the business content you upload, such as menus, product catalogs, and booking details.",
          ],
        },
        {
          heading: "Termination",
          body: [
            "You may stop using WEGN products at any time. We may suspend or terminate access for breach of these Terms, non-payment, or where required by law.",
          ],
        },
        {
          heading: "Disclaimers & Limitation of Liability",
          body: [
            "WEGN products are provided “as is.” To the extent permitted by law, WEGN is not liable for indirect, incidental, or consequential damages arising from use of the products.",
          ],
        },
        {
          heading: "Governing Law",
          body: [
            "The governing law and jurisdiction for these Terms will be specified in the finalized version of this page prior to public launch.",
          ],
        },
        {
          heading: "Changes to These Terms",
          body: [
            "We may update these Terms from time to time. Continued use of WEGN products after changes take effect constitutes acceptance of the revised Terms.",
          ],
        },
      ]}
    />
  );
}
