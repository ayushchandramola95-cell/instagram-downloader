import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram Audio Downloader - Convert Reels & Videos to MP3 (320kbps)",
  description:
    "Extract and download audio from Instagram Reels and Videos as high-quality 320kbps MP3 files. Free, fast, online audio converter with no software required.",
  keywords: [
    "Instagram audio downloader",
    "convert Instagram reel to MP3",
    "extract audio from Instagram",
    "Instagram sound downloader",
    "Instagram MP3 converter",
    "download Instagram audio 320kbps",
  ],
  alternates: {
    canonical: "https://gramsave.site/audio-downloader",
  },
  openGraph: {
    title: "Instagram Audio Downloader - Extract MP3 Audio Online",
    description:
      "Save audio tracks and trending songs from Instagram Reels directly in 320kbps MP3 format.",
    url: "https://gramsave.site/audio-downloader",
  },
};

const AUDIO_FAQS: FaqItem[] = [
  {
    q: "What audio bitrate does GramSave extract from Instagram Reels?",
    a: "We extract audio tracks at the highest bitrate provided by Instagram's source stream—typically 320kbps or 256kbps MP3/AAC at 44.1kHz stereo, ensuring punchy bass and crystal-clear voice clarity.",
  },
  {
    q: "Can I use downloaded MP3 clips in CapCut, InShot, or Premiere Pro?",
    a: "Yes! The downloaded MP3 files are universally compatible with all popular mobile and desktop video editing suites, including CapCut, VN Editor, Adobe Premiere, Final Cut Pro, and DaVinci Resolve.",
  },
  {
    q: "Can I set an extracted Instagram sound as a custom phone ringtone?",
    a: "Yes. On Android, you can move the downloaded MP3 to your 'Ringtones' folder in Settings. On iPhone, you can use Apple's free GarageBand app to turn any MP3 into a custom ringtone or alarm sound.",
  },
  {
    q: "Why do some Reels have no extractable audio?",
    a: "If a Reel was uploaded completely muted, or if Instagram muted the audio track due to geographic copyright restrictions in your area, the audio stream will be silent. If you can hear the track in your browser, GramSave will extract it cleanly.",
  },
  {
    q: "Do I need to install an audio conversion program?",
    a: "No! All audio demuxing and conversion from MP4 container to standalone MP3 is handled in real-time by our fast cloud servers. You receive an immediate direct download.",
  },
];

export default function AudioDownloaderPage() {
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
            name: "Instagram Audio Downloader",
            item: "https://gramsave.site/audio-downloader",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: AUDIO_FAQS.map((faq) => ({
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
      <Header activeTab="audio" />

      <main id="main-content">
        <DownloaderSection defaultTab="audio" />

        {/* SEO Content Section */}
        <section className="container" style={{ padding: "50px 20px 70px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto", textAlign: "left" }}>
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link href="/" className="breadcrumb-link">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Instagram Audio &amp; MP3 Converter</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Extract Background Music &amp; Voiceovers from Any Instagram Reel
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Many of today&apos;s most viral beats, acoustic covers, podcasts, and trending memes debut as background sound bites on Instagram Reels. If you heard an inspiring motivational speech, workout soundtrack, or unique remix and want just the audio without saving the heavy video file, <strong>GramSave Audio Downloader</strong> separates and exports the audio track into a pristine 320kbps MP3 file in seconds.
            </p>

            {/* Feature Highlights */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">🎧</div>
                <h3 className="feature-title">Studio Quality 320kbps</h3>
                <p className="feature-desc">
                  Extracts maximum dynamic range and stereo separation, optimized for high-end headphones, car speakers, and music playlists.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Lightweight File Sizes</h3>
                <p className="feature-desc">
                  MP3 audio files are up to 90% smaller than full HD video clips, saving storage space on your smartphone and laptop.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3 className="feature-title">Universal Compatibility</h3>
                <p className="feature-desc">
                  Compatible with Apple Music, Spotify local files, VLC, CapCut, InShot, and custom phone ringtone settings.
                </p>
              </div>
            </div>

            {/* How to Steps */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              How to Convert Instagram Reels to MP3 in 3 Steps
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Extract high-bitrate MP3 sound tracks in 3 simple steps:
            </p>

            <div className="steps-grid" style={{ marginBottom: "50px" }}>
              <div className="step-card">
                <span className="step-number">01</span>
                <span className="step-badge" style={{ color: "#ec4899", background: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }}>Step 1</span>
                <h3 className="step-title">Copy Reel Link</h3>
                <p className="step-text">
                  Find the Reel with the audio you wish to isolate. Tap the Share button and select <strong>&quot;Copy Link&quot;</strong>.
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
                <h3 className="step-title">Save MP3 Audio</h3>
                <p className="step-text">
                  Click the <strong>Download Audio MP3</strong> button to save the standalone soundtrack directly to your device.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqAccordion
          items={AUDIO_FAQS}
          title="Frequently Asked Questions about Instagram Audio"
          subtitle="Clear answers on extracting background music and sounds from Instagram."
        />
      </main>

      <Footer />
    </div>
  );
}
