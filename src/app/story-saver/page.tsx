import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram Story Saver - Download IG Stories & Highlights Anonymously",
  description:
    "Save and download Instagram Stories and Highlights in original HD quality before they disappear after 24 hours. 100% anonymous, free, and no login required.",
  keywords: [
    "Instagram story saver",
    "download Instagram stories",
    "anonymous IG story viewer",
    "save Instagram story video",
    "Instagram highlights downloader",
    "story saver online free",
  ],
  alternates: {
    canonical: "https://gramsave.site/story-saver",
  },
  openGraph: {
    title: "Instagram Story Saver - Save Stories & Highlights Online",
    description:
      "Download Instagram Stories and Highlights anonymously before they expire. Fast, free, and secure.",
    url: "https://gramsave.site/story-saver",
  },
};

const STORY_FAQS: FaqItem[] = [
  {
    q: "Can the account owner see that I viewed or saved their Instagram Story?",
    a: "No! When you use GramSave Story Saver, your viewing and downloading are completely anonymous. You do not log into your Instagram account, so your handle will never appear in their 'Seen By' viewer list.",
  },
  {
    q: "Can I download an Instagram Story after the 24-hour window?",
    a: "Stories disappear from Instagram's public CDN after 24 hours unless the creator pins them to their profile as a 'Highlight'. If a Story was saved to a Highlight, you can download it at any time without expiry restrictions.",
  },
  {
    q: "How do I save Instagram Story Highlights?",
    a: "Open the Instagram profile, open the Highlight collection, tap the Share icon, and select 'Copy Link'. Paste that link into GramSave to extract the individual video clips and high-resolution stills from that Highlight.",
  },
  {
    q: "In what format are video stories and photo stories saved?",
    a: "Video stories are saved as universal 1080p MP4 files with stereo sound, while photo stories are saved in full-resolution JPG/WebP format with no screenshot compression.",
  },
  {
    q: "How do I save downloaded Stories on iPhone?",
    a: "In Safari on your iPhone, paste the story link and tap Download. Tap the blue arrow in the address bar when the download finishes, tap the video file, tap the Share icon, and choose 'Save Video' to add it to your Photos library.",
  },
];

export default function StorySaverPage() {
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
            name: "Instagram Story Saver",
            item: "https://gramsave.site/story-saver",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: STORY_FAQS.map((faq) => ({
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
      <Header activeTab="stories" />

      <main id="main-content">
        <DownloaderSection defaultTab="stories" />

        {/* SEO Content Section */}
        <section className="container" style={{ padding: "50px 20px 70px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", textAlign: "left" }}>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Instagram Story Saver</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Save Instagram Stories &amp; Highlights Anonymously
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Instagram Stories capture spontaneous moments, travel recommendations, workout routines, and breaking announcements. Because Stories automatically self-destruct after 24 hours, valuable information can be lost permanently. <strong>GramSave Story Saver</strong> gives you a fast, 100% anonymous way to preserve any public Story or Highlight clip directly to your device in original master quality.
            </p>

            {/* Privacy & Highlights Grid */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">🕶️</div>
                <h3 className="feature-title">100% Anonymous Viewing</h3>
                <p className="feature-desc">
                  Browse and download stories without leaving a footprint. The account owner will never know you viewed their content.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⏳</div>
                <h3 className="feature-title">Save Before Expiration</h3>
                <p className="feature-desc">
                  Preserve ephemeral 24-hour videos, photos, and polls permanently to your local drive or cloud storage.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⭐</div>
                <h3 className="feature-title">Permanent Highlights Support</h3>
                <p className="feature-desc">
                  Download entire profile highlight collections organized into chronological clips and full-resolution stills.
                </p>
              </div>
            </div>

            {/* How to Guide */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              How to Save Instagram Stories in 3 Quick Steps
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Follow these simple steps to save any public Instagram Story or Highlight directly to your device:
            </p>

            <div className="steps-grid" style={{ marginBottom: "50px" }}>
              <div className="step-card">
                <span className="step-number">01</span>
                <span className="step-badge" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }}>Step 1</span>
                <h3 className="step-title">Copy Story Link</h3>
                <p className="step-text">
                  Open the Story or Highlight on Instagram. Tap the three dots (•••) or the Share button and select <strong>&quot;Copy Link&quot;</strong>.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">02</span>
                <span className="step-badge" style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.3)" }}>Step 2</span>
                <h3 className="step-title">Paste into Story Saver</h3>
                <p className="step-text">
                  Paste the copied link into the input box at the top of this page and click <strong>Download</strong>.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">03</span>
                <span className="step-badge" style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.15)", borderColor: "rgba(249, 115, 22, 0.3)" }}>Step 3</span>
                <h3 className="step-title">Save Video or Photo</h3>
                <p className="step-text">
                  Click the <strong>Download</strong> button to save the media immediately in original resolution without compression.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqAccordion
          items={STORY_FAQS}
          title="Frequently Asked Questions about Story Saver"
          subtitle="Honest answers on anonymous viewing and saving ephemeral Instagram stories."
        />
      </main>

      <Footer />
    </div>
  );
}
