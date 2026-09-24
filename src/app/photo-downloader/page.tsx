import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram Photo Downloader - Save HD Photos | GramSave",
  description:
    "Download original, uncompressed high-resolution photos and profile pictures from Instagram. 100% free, fast, and anonymous online photo saver.",
  keywords: [
    "Instagram photo downloader",
    "download Instagram pictures",
    "save Instagram photos full resolution",
    "Instagram profile picture downloader",
    "download IG photo HD",
    "Instagram image downloader online",
  ],
  alternates: {
    canonical: "https://gramsave.site/photo-downloader",
  },
  openGraph: {
    title: "Instagram Photo Downloader - Save HD Photos | GramSave",
    description:
      "Save uncompressed Instagram photos in their original clarity. Works seamlessly on iPhone, Android, and PC.",
    url: "https://gramsave.site/photo-downloader",
    siteName: "GramSave",
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "Instagram Photo Downloader - GramSave",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Photo Downloader - Save HD Photos | GramSave",
    description:
      "Download original uncompressed high-resolution photos from Instagram in 1 click.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
};

const PHOTO_FAQS: FaqItem[] = [
  {
    q: "Why is downloading with GramSave superior to taking a screenshot?",
    a: "Screenshots inherit your phone screen's physical pixel grid, often resulting in blurry artifacts, color shift, and ugly UI overlays like battery icons and timestamps. GramSave connects directly to Instagram's content delivery servers to retrieve the original, uncompressed master JPG file at maximum pixel dimensions.",
  },
  {
    q: "What are Instagram's standard photo dimensions and aspect ratios?",
    a: "Instagram accepts three standard dimensions: Square (1:1 at 1080 × 1080 px), Portrait (4:5 at 1080 × 1350 px), and Landscape (1.91:1 at 1080 × 566 px). GramSave preserves the exact uploaded aspect ratio without forced cropping.",
  },
  {
    q: "Can I download all photos from a multi-picture post?",
    a: "Yes! When an Instagram post contains multiple slides (carousel album), GramSave identifies every individual photo in the sequence so you can download the complete set in full resolution.",
  },
  {
    q: "In what file format are the images downloaded?",
    a: "Images are saved as standard JPG or high-efficiency WebP files, ensuring universal compatibility with Photoshop, Lightroom, Canva, Apple Photos, and Google Photos.",
  },
  {
    q: "Can I download full-size Instagram profile pictures (DP)?",
    a: "Yes. You can paste the link to any post or profile to extract the high-resolution profile picture file without cropping.",
  },
];

export default function PhotoDownloaderPage() {
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
            name: "Instagram Photo Downloader",
            item: "https://gramsave.site/photo-downloader",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: PHOTO_FAQS.map((faq) => ({
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
      <Header activeTab="photos" />

      <main id="main-content">
        <DownloaderSection defaultTab="photos" />

        {/* SEO Content Section */}
        <section className="container" style={{ padding: "50px 20px 70px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", textAlign: "left" }}>
            {/* Breadcrumbs */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Instagram Photo Downloader</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Original Master Resolution Instagram Photo Downloader
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Instagram is the premier visual portfolio for world-class photographers, digital artists, architects, and visual designers. When you see an awe-inspiring photograph or reference artwork, taking a screen capture degrades the color depth and introduces compression blur. <strong>GramSave Photo Downloader</strong> retrieves the original master image file uploaded by the creator, giving you pristine clarity up to 1080x1350 resolution.
            </p>

            {/* Features Grid */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3 className="feature-title">Original Master Quality</h3>
                <p className="feature-desc">
                  Preserve rich color balance, high dynamic range, and edge sharpness without lossy compression or screen pixelation.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🖼️</div>
                <h3 className="feature-title">All Aspect Ratios</h3>
                <p className="feature-desc">
                  Supports Square (1:1), Portrait (4:5), and Landscape (1.91:1) photo posts with 100% dimension preservation.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Zero UI Overlays</h3>
                <p className="feature-desc">
                  Get clean images without heart icons, comments overlays, or phone status bars. Ready for desktop wallpaper or mood boards.
                </p>
              </div>
            </div>

            {/* Steps */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              How to Save Instagram Photos in Original Quality
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Download original high-resolution images in 3 quick steps:
            </p>

            <div className="steps-grid" style={{ marginBottom: "50px" }}>
              <div className="step-card">
                <span className="step-number">01</span>
                <span className="step-badge" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }}>Step 1</span>
                <h3 className="step-title">Copy Photo URL</h3>
                <p className="step-text">
                  Tap the three dots (•••) or Share button on the Instagram photo post and select <strong>&quot;Copy Link&quot;</strong>.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">02</span>
                <span className="step-badge" style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.3)" }}>Step 2</span>
                <h3 className="step-title">Paste into GramSave</h3>
                <p className="step-text">
                  Paste the URL in the search box above and click the <strong>Download</strong> button.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">03</span>
                <span className="step-badge" style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.15)", borderColor: "rgba(249, 115, 22, 0.3)" }}>Step 3</span>
                <h3 className="step-title">Save Master JPG</h3>
                <p className="step-text">
                  Click <strong>Download High Quality JPG</strong> to save the uncompressed image directly to your gallery or camera roll.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqAccordion
          items={PHOTO_FAQS}
          title="Frequently Asked Questions about Photo Downloads"
          subtitle="Clear technical answers on saving Instagram photography in pristine clarity."
        />
      </main>

      <Footer />
    </div>
  );
}
