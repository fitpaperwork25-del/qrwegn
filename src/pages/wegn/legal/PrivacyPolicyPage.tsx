import LegalPageLayout from "./LegalPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This Privacy Policy explains how WEGN collects, uses, shares, and protects information across QRWegn, Wegn Store, and QRBooker."
      sections={[
        {
          heading: "Overview",
          body: [
            "WEGN (“WEGN,” “we,” “us”) provides software for ordering, retail, and booking to operators and their customers. This policy describes the categories of information we collect, why we collect it, and the choices available to you.",
          ],
        },
        {
          heading: "Information We Collect",
          body: [
            "We collect information you provide directly, information generated through your use of WEGN products, and limited information from the devices you use to access them.",
            [
              "Account information: name, email address, phone number, business details.",
              "Transaction information: orders, bookings, payments, and related records.",
              "Usage information: pages visited, features used, and general interaction data.",
              "Device information: browser type, IP address, and approximate location.",
            ],
          ],
        },
        {
          heading: "How We Use Information",
          body: [
            "We use collected information to operate and improve WEGN products, process orders and bookings, provide customer support, communicate service updates, and meet legal and security obligations.",
          ],
        },
        {
          heading: "How We Share Information",
          body: [
            "We share information with the business you are ordering from or booking with, with service providers who help us operate WEGN (such as payment processors and hosting providers), and where required by law. We do not sell personal information.",
          ],
        },
        {
          heading: "Data Retention & Security",
          body: [
            "We retain information for as long as needed to provide WEGN products and to meet legal, accounting, or reporting requirements. We use industry-standard technical and organizational measures to protect information, though no system is completely secure.",
          ],
        },
        {
          heading: "Your Rights",
          body: [
            "Depending on where you live, you may have rights to access, correct, export, or delete your personal information. You can exercise these rights by contacting us using the details below.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "WEGN products use cookies and similar technologies to keep you signed in and to understand how our products are used. See our Cookie Policy for details.",
          ],
        },
        {
          heading: "Changes to This Policy",
          body: [
            "We may update this policy from time to time. Material changes will be reflected here with an updated status once this page moves out of draft.",
          ],
        },
      ]}
    />
  );
}
