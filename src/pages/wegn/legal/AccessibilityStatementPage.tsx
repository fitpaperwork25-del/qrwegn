import LegalPageLayout from "./LegalPageLayout";

export default function AccessibilityStatementPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Accessibility Statement"
      intro="WEGN is committed to making QRWegn, Wegn Store, QRBooker, and our public website usable by as many people as possible, including people with disabilities."
      sections={[
        {
          heading: "Our Commitment",
          body: [
            "We aim to design and build WEGN products so they can be used by people with a wide range of abilities, including those who rely on assistive technology such as screen readers or keyboard navigation.",
          ],
        },
        {
          heading: "Conformance Target",
          body: [
            "We are working toward conformance with the Web Content Accessibility Guidelines (WCAG) 2.1, level AA, across our public website and products.",
          ],
        },
        {
          heading: "Measures We Take",
          body: [
            [
              "Structuring pages with semantic headings and landmarks.",
              "Maintaining readable color contrast in line with our design system.",
              "Supporting keyboard navigation for interactive elements.",
              "Reviewing new features for accessibility as they are built.",
            ],
          ],
        },
        {
          heading: "Known Limitations",
          body: [
            "As WEGN products are actively developed, some areas may not yet fully meet our accessibility target. We are working to address gaps as they are identified.",
          ],
        },
        {
          heading: "Feedback & Contact",
          body: [
            "If you experience any difficulty accessing WEGN products, please contact us so we can address the issue and improve accessibility going forward.",
          ],
        },
      ]}
    />
  );
}
