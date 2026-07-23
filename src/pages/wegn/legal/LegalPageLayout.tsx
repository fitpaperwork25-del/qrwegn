import { Link } from "react-router-dom";
import WegnLayout from "../../../components/wegn/WegnLayout";

export type LegalSectionBody = string | string[];

export interface LegalSection {
  heading: string;
  body: LegalSectionBody[];
}

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPageLayout({ eyebrow, title, intro, sections }: LegalPageLayoutProps) {
  return (
    <WegnLayout>
      <section className="legal-page">
        <div className="wrap">
          <div className="legal-header">
            <div className="eyebrow">{eyebrow}</div>
            <h1>{title}</h1>
            <p className="legal-meta">Status: Draft — not yet published</p>
            <p className="legal-intro">{intro}</p>
          </div>

          <div className="draft-notice">
            <div>
              <strong>Draft — for review only.</strong> This page contains placeholder legal content and has not
              been reviewed or approved by legal counsel. It does not yet reflect WEGN&rsquo;s finalized policy.
              A final, legally reviewed version of this page will be published before public launch.
            </div>
          </div>

          {sections.map((section) => (
            <div className="legal-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((block, i) =>
                Array.isArray(block) ? (
                  <ul key={i}>
                    {block.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{block}</p>
                )
              )}
            </div>
          ))}

          <div className="legal-footer-note">
            <p>
              Questions about this page? <Link to="/contact">Contact WEGN</Link>.
            </p>
          </div>
        </div>
      </section>
    </WegnLayout>
  );
}
