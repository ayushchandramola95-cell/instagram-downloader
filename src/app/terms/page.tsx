import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service & Usage Policy | GramSave",
  description:
    "Read the Terms of Service for using GramSave's online Instagram media downloading and archiving tool.",
  alternates: {
    canonical: "https://gramsave.site/terms",
  },
  openGraph: {
    title: "Terms of Service & Usage Policy | GramSave",
    description:
      "Read the Terms of Service for using GramSave's online Instagram media downloading and archiving tool.",
    url: "https://gramsave.site/terms",
    siteName: "GramSave",
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "GramSave Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service & Usage Policy | GramSave",
    description: "Read the Terms of Service and guidelines for using GramSave.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
};

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://gramsave.site",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Terms of Service",
            item: "https://gramsave.site/terms",
          },
        ],
      },
    ],
  };

  return (
    <div className="page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" className="container" style={{ padding: "60px 20px 100px" }}>
        <div className="legal-card-wrapper">
          <Link href="/" className="legal-back-nav" id="back-home-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Back to Home</span>
          </Link>

          <div className="legal-page-card">
            <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--card-border)", paddingBottom: "24px" }}>
              <div className="section-tag" style={{ display: "inline-block", marginBottom: "12px" }}>
                Legal & Governance
              </div>
              <h1 className="hero-title" style={{ fontSize: "2.4rem", marginBottom: "12px", textAlign: "left" }}>
                Terms of <span className="gradient-text">Service</span>
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Last updated: October 2026 • Applicable Worldwide
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">1</span> Acceptance of Terms
              </h2>
              <p className="legal-body-text">
                By accessing and using GramSave (&quot;the Service&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue using the service immediately.
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">2</span> Purpose and Fair Use
              </h2>
              <p className="legal-body-text">
                GramSave is provided exclusively as a technical utility for personal, non-commercial archiving, educational purposes, and fair use. Users are solely responsible for ensuring that their downloading and use of media conforms to applicable intellectual property and copyright laws in their respective jurisdictions.
              </p>
              <div className="legal-callout-box">
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>📌 Creator Fair Use Note</strong>
                <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  Always seek permission before reposting or republishing downloaded content to public social channels or commercial platforms.
                </span>
              </div>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">3</span> Intellectual Property Rights
              </h2>
              <p className="legal-body-text">
                All videos, photos, stories, and audio clips downloaded through this service remain the copyrighted intellectual property of their respective creators and copyright owners. GramSave does not claim ownership, licensing rights, or host rights over any third-party media.
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">4</span> Non-Affiliation Disclaimer
              </h2>
              <p className="legal-body-text">
                GramSave is an independent archiving utility and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms, Inc., or any of their subsidiaries or affiliates.
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">5</span> Limitation of Liability
              </h2>
              <p className="legal-body-text">
                The Service is provided &quot;as is&quot; without warranties of any kind, whether express or implied. In no event shall GramSave or its operators be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use this service.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
