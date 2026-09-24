import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram Carousel Downloader - Save Albums | GramSave",
  description:
    "Download entire Instagram Carousel posts with multiple slides. Save all photos, videos, and mixed media albums in 1080p HD. Free, fast, and anonymous.",
  keywords: [
    "Instagram carousel downloader",
    "download Instagram album",
    "save Instagram carousel slides",
    "Instagram multi photo downloader",
    "download mixed media Instagram post",
    "Instagram slideshow saver",
  ],
  alternates: {
    canonical: "https://gramsave.site/carousel-downloader",
  },
  openGraph: {
    title: "Instagram Carousel Downloader - Save Albums | GramSave",
    description:
      "Save all photos and videos from Instagram carousel albums in full resolution with one click.",
    url: "https://gramsave.site/carousel-downloader",
    siteName: "GramSave",
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "Instagram Carousel Downloader - GramSave",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Carousel Downloader - Save Albums | GramSave",
    description:
      "Download entire multi-slide carousel posts and albums in full resolution.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
};

const CAROUSEL_FAQS: FaqItem[] = [
  {
    q: "How many slides can I download from an Instagram carousel album?",
    a: "Instagram permits creators to post up to 20 photos and video clips within a single swipeable carousel album. GramSave automatically scans and unpacks the entire sidecar tree, allowing you to preview and download all slides individually or together.",
  },
  {
    q: "Does it work for mixed-media carousels containing both videos and photos?",
    a: "Yes! GramSave detects whether each individual slide is a video or a photo. Video slides are delivered as 1080p MP4 files with sound, while photo slides are delivered as full-resolution JPG images.",
  },
  {
    q: "Can I download only a specific slide without downloading the whole album?",
    a: "Absolutely! After analyzing the URL, GramSave renders a numbered preview gallery of every slide with its own dedicated format and download buttons so you only save the exact photos or clips you need.",
  },
  {
    q: "Can I download all slides in one batch?",
    a: "Yes! We provide a 'Download All Slides' button that sequentially triggers direct downloads for every slide in the post without needing to click each one individually.",
  },
  {
    q: "How do I save carousel videos and photos on iPhone?",
    a: "Open Safari, paste the carousel link, and tap Download. You can tap Download beneath any individual slide or use Batch Download. Once files appear in your Safari Downloads, tap Share > 'Save Video' or 'Save Image' to transfer them directly into your Apple Photos library.",
  },
];

export default function CarouselDownloaderPage() {
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
            name: "Instagram Carousel Downloader",
            item: "https://gramsave.site/carousel-downloader",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: CAROUSEL_FAQS.map((faq) => ({
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
      <Header activeTab="carousel" />

      <main id="main-content">
        <DownloaderSection defaultTab="carousel" />

        {/* SEO Content Section */}
        <section className="container" style={{ padding: "50px 20px 70px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", textAlign: "left" }}>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Instagram Carousel Downloader</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Unpack &amp; Download Every Slide from Instagram Carousel Albums
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Carousel posts (swipeable albums) are one of the most engaging storytelling formats on Instagram, allowing creators to pack up to 20 high-res photos and video clips into a single post. Most ordinary downloaders only grab the very first image and fail on the rest. <strong>GramSave Carousel Downloader</strong> parses the full sidecar album tree and unlocks every individual slide for instant download.
            </p>

            {/* Features Grid */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">🗂️</div>
                <h3 className="feature-title">All Slides Extracted</h3>
                <p className="feature-desc">
                  Never lose the 2nd, 3rd, or 10th slide again. Every photo and video in the swipe sequence is parsed automatically.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎬</div>
                <h3 className="feature-title">Mixed-Media Ready</h3>
                <p className="feature-desc">
                  Seamlessly handles carousels containing both video clips (with sound) and high-res photography.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3 className="feature-title">Visual Slide Preview</h3>
                <p className="feature-desc">
                  See a numbered thumbnail grid of every slide before downloading so you pick only what you need.
                </p>
              </div>
            </div>

            {/* How to Guide */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              How to Save Instagram Carousel Slides
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Unpack swipeable albums and download any slide in 3 simple steps:
            </p>

            <div className="steps-grid" style={{ marginBottom: "50px" }}>
              <div className="step-card">
                <span className="step-number">01</span>
                <span className="step-badge" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }}>Step 1</span>
                <h3 className="step-title">Copy Carousel Link</h3>
                <p className="step-text">
                  On the multi-slide Instagram post, tap the Share icon and select <strong>&quot;Copy Link&quot;</strong>.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">02</span>
                <span className="step-badge" style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.3)" }}>Step 2</span>
                <h3 className="step-title">Paste into GramSave</h3>
                <p className="step-text">
                  Paste the album link into the downloader search box and click <strong>Download</strong>.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">03</span>
                <span className="step-badge" style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.15)", borderColor: "rgba(249, 115, 22, 0.3)" }}>Step 3</span>
                <h3 className="step-title">Download Any Slide</h3>
                <p className="step-text">
                  Browse through the visual carousel grid and click the download button beneath each slide, or tap <strong>Download All Slides</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqAccordion
          items={CAROUSEL_FAQS}
          title="Frequently Asked Questions about Carousel Downloads"
          subtitle="Clear guidance on saving multi-slide Instagram posts and albums."
        />
      </main>

      <Footer />
    </div>
  );
}
