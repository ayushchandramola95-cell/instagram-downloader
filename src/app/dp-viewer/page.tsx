import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram DP Viewer - Full Size 1080p HD | GramSave",
  description:
    "Free Instagram DP Viewer online. View and download full size 1080p Instagram profile pictures (DP) in high definition without login. Works for public and private accounts.",
  keywords: [
    "Instagram DP viewer",
    "insta dp viewer full size",
    "view instagram dp online",
    "instagram profile picture viewer hd",
    "full size dp viewer",
    "insta dp zoom online",
    "private insta dp viewer",
    "gramsave dp viewer",
  ],
  alternates: {
    canonical: "https://gramsave.site/dp-viewer",
  },
  openGraph: {
    title: "Instagram DP Viewer - Full Size 1080p HD | GramSave",
    description:
      "Zoom and view full-size Instagram profile pictures (DP) anonymously without login. High definition 1080p original avatar viewer.",
    url: "https://gramsave.site/dp-viewer",
    siteName: "GramSave",
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "Instagram DP Viewer - GramSave",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram DP Viewer - Full Size 1080p HD | GramSave",
    description: "Zoom and inspect full-size Instagram profile pictures in 1 click.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
};

const DP_FAQS: FaqItem[] = [
  {
    q: "What is an Instagram DP Viewer?",
    a: "An Instagram DP Viewer is an online tool that extracts and displays the uncompressed full-size display picture (avatar) uploaded by an Instagram user. While Instagram only displays low-resolution cropped circle thumbnails in the app, GramSave DP Viewer retrieves the full 1080 × 1080 pixel original file.",
  },
  {
    q: "Can I view full size DP of a private Instagram account?",
    a: "Yes. Every Instagram account's profile avatar is stored publicly on Meta CDN servers regardless of whether the profile is public or private. GramSave retrieves the authentic full-size avatar safely and anonymously.",
  },
  {
    q: "Does the user know if I view their DP using GramSave?",
    a: "No. GramSave is completely anonymous. Instagram has no mechanism to notify users when someone views their display picture, and we never ask for your account credentials.",
  },
  {
    q: "How can I zoom into an Instagram profile photo?",
    a: "Simply enter the username or profile link in the search bar above, click 'Download', and click on the avatar preview or 'Zoom HD' button to open the full-resolution interactive zoom modal.",
  },
];

export default function DpViewerPage() {
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
            name: "Instagram DP Viewer",
            item: "https://gramsave.site/dp-viewer",
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: "GramSave Instagram DP Viewer",
        url: "https://gramsave.site/dp-viewer",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Free online Instagram DP Viewer to inspect and download full-size 1080p profile pictures in high definition.",
      },
      {
        "@type": "FAQPage",
        mainEntity: DP_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header activeTab="profile" />

      <main id="main-content">
        <DownloaderSection defaultTab="profile" />

        {/* SEO Content Section */}
        <section className="container" style={{ padding: "50px 20px 70px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", textAlign: "left" }}>
            {/* Breadcrumbs */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Instagram DP Viewer</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Full Size Instagram DP Viewer &amp; Profile Picture Zoom
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Ever wanted to zoom into an Instagram profile photo to see someone’s picture clearly? GramSave DP Viewer is the fastest, free online tool to view and save any Instagram display picture (DP) in full 1080p HD resolution without opening an app or logging in.
            </p>

            {/* Features Grid */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3 className="feature-title">Interactive Zoom Modal</h3>
                <p className="feature-desc">
                  Tap any profile avatar to zoom into crisp 1080p master quality with zero pixelation or compression artifacts.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔓</div>
                <h3 className="feature-title">Private Profiles Supported</h3>
                <p className="feature-desc">
                  View display photos from both public and private profiles. Master avatar images remain publicly accessible on CDN servers.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3 className="feature-title">100% Anonymous</h3>
                <p className="feature-desc">
                  Browse and inspect profile photos completely anonymously. No login required and profile owners receive zero alerts.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Frequently Asked Questions (FAQ)
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Common questions about using our Instagram DP Viewer:
            </p>

            <FaqAccordion items={DP_FAQS} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
