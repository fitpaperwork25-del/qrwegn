import LegalPageLayout from "./LegalPageLayout";

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Acceptable Use Policy"
      intro="This Acceptable Use Policy sets out the standards that apply to anyone using QRWegn, Wegn Store, QRBooker, or any other WEGN product."
      sections={[
        {
          heading: "Purpose",
          body: [
            "This policy exists to keep WEGN products safe, reliable, and trustworthy for operators and their customers.",
          ],
        },
        {
          heading: "Prohibited Conduct",
          body: [
            "When using WEGN products, you agree not to:",
            [
              "Use the service for unlawful, fraudulent, or deceptive activity.",
              "Attempt to gain unauthorized access to another account, business, or system.",
              "Interfere with or disrupt the performance or security of WEGN products.",
              "Upload content that is abusive, discriminatory, or infringes on others’ rights.",
              "Use automated tools to scrape, overload, or misuse WEGN products.",
            ],
          ],
        },
        {
          heading: "Content Standards",
          body: [
            "Menus, product listings, booking descriptions, and other business content must be accurate and lawful, and must not misrepresent products, pricing, or availability to customers.",
          ],
        },
        {
          heading: "Security & Abuse",
          body: [
            "You are responsible for keeping your account credentials secure and for promptly reporting any suspected unauthorized access or security issue to WEGN.",
          ],
        },
        {
          heading: "Enforcement",
          body: [
            "Violations of this policy may result in warnings, suspension, or termination of access to WEGN products, depending on severity.",
          ],
        },
        {
          heading: "Reporting Violations",
          body: [
            "If you believe someone is violating this policy, please contact WEGN so we can review the report.",
          ],
        },
      ]}
    />
  );
}
