import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram Reels Downloader - 1080p Full HD | GramSave",
  description:
    "Download Instagram Reels in high-quality 1080p Full HD MP4 with audio. Free, fast, no watermark, and no login required. Works on iPhone, Android, and PC.",
  keywords: [
    "Instagram Reels downloader",
    "download IG reels 1080p",
    "save Instagram reels with audio",
    "reels to MP4",
    "download reels without watermark",
    "Instagram reels saver online",
  ],
  alternates: {
    canonical: "https://gramsave.site/reels-downloader",
  },
  openGraph: {
    title: "Instagram Reels Downloader - 1080p Full HD | GramSave",
    description:
      "Save high-definition Instagram Reels in 1080p MP4 with sound directly to your device. 100% free and anonymous.",
    url: "https://gramsave.site/reels-downloader",
    siteName: "GramSave",
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "Instagram Reels Downloader - GramSave",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Reels Downloader - 1080p Full HD | GramSave",
    description:
      "Save Instagram Reels in high quality 1080p MP4 with audio. Free, fast, and no login required.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
};

const REELS_FAQS: FaqItem[] = [
  {
    q: "How do I save downloaded Reels directly to my iPhone Camera Roll?",
    a: "Open Safari on your iPhone or iPad, paste the Reel link into GramSave, and tap Download. Safari will prompt you to confirm the download. Once complete, tap the blue download arrow in the address bar, open the video, tap the iOS Share icon (square with arrow pointing up), and tap 'Save Video'. It will instantly appear in your Apple Photos app.",
  },
  {
    q: "Do downloaded Reels have a watermark or username overlay?",
    a: "No! Unlike the native Instagram app's 'Save' feature which overlays a moving watermark and creator handle, GramSave extracts the raw, original MP4 file streamed from Instagram servers without any watermarks or overlays.",
  },
  {
    q: "What is the native resolution of Instagram Reels?",
    a: "Instagram encodes Reels in vertical 9:16 aspect ratio at 1080 × 1920 pixels at up to 60 frames per second using standard H.264 video compression. GramSave extracts this maximum available source bitrate without downsampling.",
  },
  {
    q: "Does the downloaded Reel include full audio and background music?",
    a: "Yes. Every Reel downloaded through GramSave includes the full original soundtrack in high-fidelity stereo audio. If you only want the music, you can toggle our MP3 audio extractor to download a standalone 320kbps audio file.",
  },
  {
    q: "Can I import downloaded Reels into editing apps like CapCut or Premiere?",
    a: "Yes! Because the files are downloaded as universal H.264 MP4 videos, they can be imported directly into CapCut, Adobe Premiere, Final Cut Pro, DaVinci Resolve, InShot, or VN Video Editor for your personal b-roll archives.",
  },
  {
    q: "Can the creator see that I viewed or downloaded their Reel?",
    a: "No. GramSave operates anonymously through independent server requests. The creator will never receive any notification or see your profile in their viewers list.",
  },
];

export default function ReelsDownloaderPage() {
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
            name: "Instagram Reels Downloader",
            item: "https://gramsave.site/reels-downloader",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: REELS_FAQS.map((faq) => ({
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
      <Header activeTab="reels" />

      <main id="main-content">
        <DownloaderSection defaultTab="reels" />

        {/* SEO Content Section */}
        <section className="container" style={{ padding: "50px 20px 70px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", textAlign: "left" }}>
            {/* Visual Breadcrumbs */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Instagram Reels Downloader</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              High-Speed Instagram Reels Downloader in 1080p Full HD
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Instagram Reels showcase the most engaging short-form vertical video content on the web—from creative tutorials and viral dances to motivational speeches and comedy sketches. While the native Instagram app allows you to bookmark reels within collections, it does not provide an offline MP4 file that you can store on your phone or use in creative editing projects. <strong>GramSave Reels Downloader</strong> resolves this by delivering raw, uncompressed 1080p MP4 videos with crystal-clear audio and zero watermarks.
            </p>

            {/* Feature Highlights Grid */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3 className="feature-title">Zero Watermarks</h3>
                <p className="feature-desc">
                  Download clean MP4 files without intrusive logos, floating handles, or username stamps. Perfect for creators archiving their own portfolio.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎥</div>
                <h3 className="feature-title">True 1080p Full HD</h3>
                <p className="feature-desc">
                  Extracts reels at their native 1080 × 1920 vertical canvas at up to 60 FPS, preserving crisp details and rich dynamic colors.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔊</div>
                <h3 className="feature-title">Pristine Audio Track</h3>
                <p className="feature-desc">
                  Retains full original audio fidelity, background tracks, and voiceovers. Option to download as standalone 320kbps MP3 audio.
                </p>
              </div>
            </div>

            {/* How to Steps */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              How to Save Instagram Reels in 3 Simple Steps
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Follow these simple steps to download any public Instagram Reel directly to your gallery or camera roll:
            </p>

            <div className="steps-grid" style={{ marginBottom: "50px" }}>
              <div className="step-card">
                <span className="step-number">01</span>
                <span className="step-badge" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }}>Step 1</span>
                <h3 className="step-title">Copy Reel Link</h3>
                <p className="step-text">
                  Open Instagram, find the Reel you want to save, tap the <strong>Share icon</strong> (paper airplane or three dots), and select <strong>&quot;Copy Link&quot;</strong>.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">02</span>
                <span className="step-badge" style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.15)", borderColor: "rgba(168, 85, 247, 0.3)" }}>Step 2</span>
                <h3 className="step-title">Paste URL into GramSave</h3>
                <p className="step-text">
                  Paste the copied URL into the search box at the top of this page and click <strong>Download</strong>. Our system resolves the stream in milliseconds.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">03</span>
                <span className="step-badge" style={{ color: "#f97316", background: "rgba(249, 115, 22, 0.15)", borderColor: "rgba(249, 115, 22, 0.3)" }}>Step 3</span>
                <h3 className="step-title">Save 1080p MP4 File</h3>
                <p className="step-text">
                  Choose your preferred resolution (1080p Full HD, 720p, or MP3 Audio) and click to save the video immediately to your camera roll or downloads folder.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqAccordion
          items={REELS_FAQS}
          title="Frequently Asked Questions about Instagram Reels"
          subtitle="Real answers and technical guidance on downloading Instagram Reels in Full HD."
        />
      </main>

      <Footer />
    </div>
  );
}
