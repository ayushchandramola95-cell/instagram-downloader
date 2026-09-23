import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact & DMCA Removal - InstaSnap",
  description: "Get in touch with the InstaSnap team or request DMCA content blocking and removal.",
  alternates: {
    canonical: "https://instasnap.app/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="page-wrapper">
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
                Support & Compliance
              </div>
              <h1 className="hero-title" style={{ fontSize: "2.4rem", marginBottom: "12px", textAlign: "left" }}>
                Contact & <span className="gradient-text">DMCA Takedown</span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.7 }}>
                InstaSnap respects intellectual property rights and adheres to the Digital Millennium Copyright Act (DMCA). If you are a copyright owner or authorized agent wishing to prevent specific URLs from being downloaded through our service, please reach out below.
              </p>
            </div>

            {/* Quick Contact Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "30px" }}>
              <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🛡️</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  DMCA Content Takedown
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Request permanent link blocking or removal for your copyrighted material.
                </p>
              </div>

              <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--card-border)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Technical Assistance
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Report bugs, download issues, or provide feedback to improve InstaSnap.
                </p>
              </div>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">1</span> Information Required for DMCA Notice
              </h2>
              <p className="legal-body-text" style={{ marginBottom: "14px" }}>
                Please provide the following details to ensure rapid processing by our legal compliance desk:
              </p>
              <ul style={{ color: "var(--text-secondary)", fontSize: "0.94rem", lineHeight: 1.8, marginLeft: "20px" }}>
                <li>The exact Instagram URL(s) of the copyrighted content.</li>
                <li>Proof of ownership or legal authorization to act on behalf of the copyright holder.</li>
                <li>Your contact information (full legal name, email address, phone number).</li>
                <li>A statement confirming your good-faith belief that the disputed use is unauthorized.</li>
              </ul>
            </div>

            {/* Email CTA Box */}
            <div
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginTop: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(236, 72, 153, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  ✉️
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 800 }}>
                    Official Legal Desk
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    support@instasnap.app
                  </div>
                </div>
              </div>

              <a
                href="mailto:support@instasnap.app?subject=DMCA%20Notice%20/%20InstaSnap%20Inquiry"
                style={{
                  background: "var(--insta-gradient)",
                  color: "#ffffff",
                  padding: "10px 22px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(253, 29, 29, 0.3)",
                }}
              >
                <span>Send Email</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.84rem", marginTop: "18px" }}>
              * We review and respond to valid DMCA requests within 24–48 business hours. URLs found to infringe will be blocked from retrieval immediately.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
