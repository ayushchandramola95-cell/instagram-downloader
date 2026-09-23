import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - InstaSnap",
  description: "Learn about how InstaSnap respects user privacy with zero data logging and anonymous media downloading.",
  alternates: {
    canonical: "https://instasnap.app/privacy",
  },
};

export default function PrivacyPage() {
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
                Privacy & Data Security
              </div>
              <h1 className="hero-title" style={{ fontSize: "2.4rem", marginBottom: "12px", textAlign: "left" }}>
                Privacy <span className="gradient-text">Policy</span>
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Last updated: October 2026 • Strict Zero-Logging Standard
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">1</span> Zero Personal Data Collection
              </h2>
              <p className="legal-body-text">
                InstaSnap does not require you to register, log in, or provide any personal information, email addresses, phone numbers, or Instagram passwords. Your browsing and downloads remain 100% anonymous at all times.
              </p>
              <div className="legal-callout-box">
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>🛡️ Anonymity Guarantee</strong>
                <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                  We never request or store your Instagram password, authentication tokens, or personal profile data.
                </span>
              </div>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">2</span> Media Storage & Real-Time Streaming
              </h2>
              <p className="legal-body-text">
                We do not store, host, or archive any downloaded videos, photos, or audio files on our servers. When you request a download, the file is streamed in real-time directly between Instagram public servers and your device through an encrypted TLS pipeline.
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">3</span> Server Logs & Edge Telemetry
              </h2>
              <p className="legal-body-text">
                Like all modern web services, standard anonymous technical logs (such as request timestamps, IP address geolocation for DDoS mitigation, and HTTP status codes) may be temporarily processed by edge providers like Cloudflare to protect against abuse and bot attacks. These logs are automatically purged on a regular basis.
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">4</span> Cookies & Local Preferences
              </h2>
              <p className="legal-body-text">
                InstaSnap may use minimal client-side local storage exclusively to save your UI preferences (such as dark mode theme or recent search formatting). We do not deploy third-party cross-site behavioral tracking cookies or advertising pixels.
              </p>
            </div>

            <div className="legal-section-item">
              <h2 className="legal-section-heading">
                <span className="legal-section-num">5</span> Contact Our Privacy Desk
              </h2>
              <p className="legal-body-text">
                If you have questions, feedback, or concerns regarding our privacy practices, please contact us directly via our{" "}
                <Link href="/contact" style={{ color: "#ec4899", fontWeight: 700, textDecoration: "none" }}>
                  Contact Page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
