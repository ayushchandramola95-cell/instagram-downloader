"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";
import { useTranslation } from "@/lib/i18n";

const HOME_FAQS: FaqItem[] = [
  {
    q: "How do I save downloaded Instagram videos directly to my iPhone Camera Roll?",
    a: "When using Safari on iOS, paste the link and tap Download. Safari will prompt you to download the MP4 file (look for the blue downward arrow in Safari's address bar). Tap the downloaded video, tap the iOS Share button (the square with an arrow pointing up), and select 'Save Video'. The clip will immediately appear in your Apple Photos camera roll.",
  },
  {
    q: "Is GramSave really 100% free with no daily download limits?",
    a: "Yes. GramSave is completely free and supported by non-intrusive advertisements. There are no daily download limits, no premium tiers, no watermarks, and no registration or credit card requirements.",
  },
  {
    q: "Do I need to log in or share my Instagram password?",
    a: "Never. We operate on a strict privacy-first model. We will never ask for your Instagram password, authentication tokens, or personal email. Our server communicates exclusively with Instagram's public CDN streams anonymously.",
  },
  {
    q: "What is the maximum resolution and format available for download?",
    a: "We extract videos in their highest source resolution as uploaded by creators—typically 1080p Full HD (1080x1920 at up to 60fps) encoded in universal H.264 MP4 with AAC stereo audio. For photos, we provide original uncompressed JPGs up to 1080x1350 resolution.",
  },
  {
    q: "Why do some Instagram Reels have no sound or missing audio?",
    a: "Instagram occasionally mutes audio tracks if the creator used copyrighted commercial music that is restricted in certain countries, or if the original video was uploaded without sound. If the track is available, our 'Audio MP3' tab allows you to isolate and download the clean 320kbps background soundtrack independently.",
  },
  {
    q: "Can I download multi-slide carousel albums and swipeable posts?",
    a: "Yes! While standard downloaders fail on multi-slide posts, GramSave parses the complete Instagram sidecar album tree. You can inspect thumbnails of every photo and video slide, choose individual quality settings, or batch-download all slides together.",
  },
  {
    q: "Can I use downloaded audio and music clips in my own video editor?",
    a: "Yes. Our Audio Downloader extracts clean MP3/M4A audio files that you can import directly into editing software like CapCut, Premiere Pro, Final Cut, InShot, or VN Video Editor for your creative b-roll projects.",
  },
  {
    q: "Can I download private Instagram posts or stories?",
    a: "No. GramSave strictly honors privacy standards and platform policies. We only extract media from public Instagram profiles and posts. Private accounts require authentication that we do not access.",
  },
];

const SILO_TOOLS = [
  {
    title: "Reels Downloader",
    tag: "1080p Full HD",
    desc: "Download viral Instagram Reels with audio and zero watermarks in high-speed MP4 format.",
    href: "/reels-downloader",
    icon: "🎬",
    color: "#ec4899",
  },
  {
    title: "Story Saver",
    tag: "100% Anonymous",
    desc: "Save ephemeral 24-hour Instagram stories and user highlights anonymously before they disappear.",
    href: "/story-saver",
    icon: "⚡",
    color: "#a855f7",
  },
  {
    title: "Audio & MP3 Converter",
    tag: "320kbps Audio",
    desc: "Extract background music, sound bites, and voiceovers from Instagram videos into standalone MP3s.",
    href: "/audio-downloader",
    icon: "🎵",
    color: "#f97316",
  },
  {
    title: "Photo Downloader",
    tag: "Original Quality",
    desc: "Download high-resolution Instagram photography without lossy screenshot compression.",
    href: "/photo-downloader",
    icon: "📸",
    color: "#06b6d4",
  },
  {
    title: "Profile DP Downloader",
    tag: "Full HD 1080p",
    desc: "View and download uncropped original 1080p Instagram profile pictures (DP) from any account in 1 click.",
    href: "/profile-downloader",
    icon: "👤",
    color: "#e11d48",
  },
  {
    title: "Carousel Album Saver",
    tag: "Multi-Slide",
    desc: "Extract every photo and video slide from swipeable Instagram carousel albums in 1 click.",
    href: "/carousel-downloader",
    icon: "📂",
    color: "#10b981",
  },
];

export default function Home() {
  const { t } = useTranslation();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />

      <main id="main-content">
        <DownloaderSection defaultTab="all" />

        {/* Specialized Downloader Silo Hub */}
        <section className="container" style={{ padding: "40px 20px 20px" }}>
          <div className="section-header">
            <div className="section-tag">Dedicated Downloader Tools</div>
            <h2 className="section-title">Save Any Type of Instagram Content</h2>
            <p className="section-desc">
              Choose the specialized downloader tailored for your specific media type for faster processing and maximum quality.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {SILO_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="silo-tool-card"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "28px" }}>{tool.icon}</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: tool.color,
                        background: `${tool.color}15`,
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        border: `1px solid ${tool.color}35`,
                      }}
                    >
                      {tool.tag}
                    </span>
                  </div>
                  <h3 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
                    {tool.title}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {tool.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "20px",
                    color: tool.color,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Launch Tool</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="features-section container" id="features">
          <div className="section-header">
            <div className="section-tag">{t("features_badge", "Why Creators Choose GramSave")}</div>
            <h2 className="section-title">{t("features_title", "Built for Speed, Quality & Privacy")}</h2>
            <p className="section-desc">
              {t("features_subtitle", "Engineered for maximum speed, crystal-clear 1080p resolution, and complete anonymity across all modern devices.")}
            </p>
          </div>

          <div className="feature-cards-grid">
            <article className="feature-card" id="feature-card-speed">
              <div className="feature-icon-box purple">⚡</div>
              <h3 className="feature-card-title">{t("feature_speed_title", "Lightning Fast Speeds")}</h3>
              <p className="feature-card-desc">
                {t("feature_speed_desc", "High-bandwidth edge infrastructure fetches direct CDN video links within milliseconds with zero throttling.")}
              </p>
            </article>

            <article className="feature-card" id="feature-card-quality">
              <div className="feature-icon-box pink">💎</div>
              <h3 className="feature-card-title">{t("feature_quality_title", "Full HD 1080p & 60 FPS")}</h3>
              <p className="feature-card-desc">
                {t("feature_quality_desc", "Never settle for pixelated videos. Download the highest source resolution uploaded by creators without compression.")}
              </p>
            </article>

            <article className="feature-card" id="feature-card-privacy">
              <div className="feature-icon-box orange">🛡️</div>
              <h3 className="feature-card-title">{t("feature_privacy_title", "100% Anonymous & Safe")}</h3>
              <p className="feature-card-desc">
                {t("feature_privacy_desc", "No login, password, or account linking required. We do not track your downloads or retain any personal logs.")}
              </p>
            </article>

            <article className="feature-card" id="feature-card-devices">
              <div className="feature-icon-box cyan">📱</div>
              <h3 className="feature-card-title">{t("feature_devices_title", "All Devices Supported")}</h3>
              <p className="feature-card-desc">
                {t("feature_devices_desc", "Fully responsive and compatible with iOS (iPhone/iPad), Android, Mac, Windows, Linux, and all modern web browsers.")}
              </p>
            </article>
          </div>
        </section>

        {/* How It Works (HowTo SEO) */}
        <section className="steps-section" id="how-it-works">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">{t("steps_badge", "Simple 3-Step Process")}</div>
              <h2 className="section-title">{t("steps_title", "How to Download Instagram Videos")}</h2>
              <p className="section-desc">
                {t("steps_subtitle", "It takes just three simple clicks to save any Instagram video directly to your photo album or download folder.")}
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card" id="step-1">
                <span className="step-number">01</span>
                <span className="step-badge">Step 1</span>
                <h3 className="step-title">{t("step_1_title", "Copy the Instagram Link")}</h3>
                <p className="step-text">
                  {t("step_1_desc", "Open the Instagram app or website, find the Reel, Video, or Story, tap the Share icon, and tap 'Copy Link'.")}
                </p>
              </div>

              <div className="step-card" id="step-2">
                <span className="step-number">02</span>
                <span className="step-badge">Step 2</span>
                <h3 className="step-title">{t("step_2_title", "Paste the URL")}</h3>
                <p className="step-text">
                  {t("step_2_desc", "Paste the copied link into the input box above and click the 'Download' button to fetch the video data.")}
                </p>
              </div>

              <div className="step-card" id="step-3">
                <span className="step-number">03</span>
                <span className="step-badge">Step 3</span>
                <h3 className="step-title">{t("step_3_title", "Save to Your Device")}</h3>
                <p className="step-text">
                  {t("step_3_desc", "Select your preferred video format (1080p, 720p, or MP3 Audio) and click to save the file instantly to your device.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Device Compatibility & Saving Guide (Human E-E-A-T) */}
        <section className="container device-guide-section" id="device-guide">
          <div className="section-header">
            <div className="section-tag">Device Instructions</div>
            <h2 className="section-title">How to Save Media on Any Device</h2>
            <p className="section-desc">
              Follow these simple platform-specific instructions to save downloaded videos directly into your native photo gallery or files.
            </p>
          </div>

          <div className="device-guide-grid">
            <div className="device-guide-card">
              <div className="device-badge">🍎 Apple iOS (iPhone & iPad)</div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Save Directly to Camera Roll
              </h3>
              <ul className="device-step-list">
                <li className="device-step-item">
                  <span className="device-step-dot">1</span>
                  <span>Open Safari, paste the link into GramSave, and tap <strong>Download</strong>.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">2</span>
                  <span>Safari will prompt to download the MP4 video. Look for the blue download arrow in the address bar.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">3</span>
                  <span>Tap the downloaded file, select the iOS <strong>Share</strong> icon, and tap <strong>&quot;Save Video&quot;</strong>.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">4</span>
                  <span>Your video will immediately appear in your native Apple Photos library.</span>
                </li>
              </ul>
            </div>

            <div className="device-guide-card">
              <div className="device-badge">🤖 Android Phones & Tablets</div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Save Directly to Gallery
              </h3>
              <ul className="device-step-list">
                <li className="device-step-item">
                  <span className="device-step-dot">1</span>
                  <span>Copy the Instagram link from the app and paste it into Chrome or Samsung Internet.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">2</span>
                  <span>Tap <strong>Download</strong> and select your desired 1080p or MP3 format.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">3</span>
                  <span>The file is automatically saved into your device&apos;s <strong>Downloads</strong> folder.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">4</span>
                  <span>Open <strong>Google Photos</strong>, <strong>Samsung Gallery</strong>, or your preferred video player to view offline.</span>
                </li>
              </ul>
            </div>

            <div className="device-guide-card">
              <div className="device-badge">💻 Windows, Mac & Linux</div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Desktop Browser Downloads
              </h3>
              <ul className="device-step-list">
                <li className="device-step-item">
                  <span className="device-step-dot">1</span>
                  <span>Copy the URL from your desktop browser address bar or Instagram post menu.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">2</span>
                  <span>Paste the link into GramSave and hit Enter or click <strong>Download</strong>.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">3</span>
                  <span>Click your quality preference. The raw, pristine file saves to your default Downloads folder.</span>
                </li>
                <li className="device-step-item">
                  <span className="device-step-dot">4</span>
                  <span>Ready to edit in Premiere, Final Cut, DaVinci Resolve, or CapCut with zero watermark.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Comparison Matrix (GramSave vs Screen Recording) */}
        <section className="container comparison-section" id="comparison">
          <div className="section-header">
            <div className="section-tag">Quality Comparison</div>
            <h2 className="section-title">GramSave vs. Screen Recording &amp; App Save</h2>
            <p className="section-desc">
              Discover why content creators and editors prefer direct stream extraction over lossy screen recording.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature / Benefit</th>
                  <th className="highlight-col">GramSave (Recommended)</th>
                  <th>Screen Recording</th>
                  <th>Instagram App &quot;Save&quot;</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Video Resolution</strong></td>
                  <td className="highlight-col">Original Source 1080p Full HD</td>
                  <td>Compressed Screen Resolution (720p or less)</td>
                  <td>Locked in App Cache</td>
                </tr>
                <tr>
                  <td><strong>Audio Quality</strong></td>
                  <td className="highlight-col">Original 320kbps Digital Stereo</td>
                  <td>Internal Mic / Lossy System Audio</td>
                  <td>In-App Playback Only</td>
                </tr>
                <tr>
                  <td><strong>Watermarks &amp; UI Clutter</strong></td>
                  <td className="highlight-col">Zero Watermarks, Zero Overlays</td>
                  <td>Captures Battery, Volume, UI Buttons</td>
                  <td>N/A (Not an exported file)</td>
                </tr>
                <tr>
                  <td><strong>External Video Editors</strong></td>
                  <td className="highlight-col">Compatible with CapCut, Premiere, InShot</td>
                  <td>Requires Trimming &amp; Cropping</td>
                  <td>Cannot Export or Edit</td>
                </tr>
                <tr>
                  <td><strong>Offline Availability</strong></td>
                  <td className="highlight-col">Permanent Offline MP4 / JPG File</td>
                  <td>Saved in Camera Roll</td>
                  <td>Lost if Creator Deletes Post</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Accordion */}
        <FaqAccordion
          items={HOME_FAQS}
          title={t("faq_title", "Frequently Asked Questions")}
          subtitle={t("faq_subtitle", "Clear, honest answers about saving Instagram media with GramSave.")}
        />
      </main>

      <Footer />
    </div>
  );
}
