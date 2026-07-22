import LegalPageLayout from "./LegalPageLayout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Cookie Policy"
      intro="This Cookie Policy explains how WEGN uses cookies and similar technologies across our website and products."
      sections={[
        {
          heading: "What Are Cookies",
          body: [
            "Cookies are small text files stored on your device that help websites and apps remember information about your visit, such as your session or preferences.",
          ],
        },
        {
          heading: "How We Use Cookies",
          body: [
            "We use cookies to keep you signed in, remember your preferences (such as a selected market on the Pricing page), and understand how WEGN products are used so we can improve them.",
          ],
        },
        {
          heading: "Types of Cookies We Use",
          body: [
            [
              "Essential cookies: required for core functionality such as staying signed in.",
              "Preference cookies: remember choices like language or market selection.",
              "Analytics cookies: help us understand product usage in aggregate.",
            ],
          ],
        },
        {
          heading: "Managing Your Preferences",
          body: [
            "Most browsers let you block or delete cookies through their settings. Blocking essential cookies may affect the functionality of WEGN products, such as staying signed in.",
          ],
        },
        {
          heading: "Third-Party Cookies",
          body: [
            "Some cookies may be set by trusted service providers who help us operate WEGN, such as analytics or payment providers. These providers are bound by their own privacy and cookie practices.",
          ],
        },
        {
          heading: "Changes to This Policy",
          body: [
            "We may update this policy as our use of cookies evolves. The finalized version will be published here before public launch.",
          ],
        },
      ]}
    />
  );
}
