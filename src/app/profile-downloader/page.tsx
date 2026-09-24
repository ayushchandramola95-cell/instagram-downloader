import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloaderSection from "@/components/DownloaderSection";
import FaqAccordion, { FaqItem } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Instagram Profile Picture Downloader - View & Download Insta DP in Full HD (1080p)",
  description:
    "View and download full-size Instagram profile pictures (DP) in 1080p Full HD original quality. 100% free, anonymous online Insta DP viewer for public and private accounts.",
  keywords: [
    "Instagram profile picture downloader",
    "Instagram DP viewer",
    "download insta dp full size",
    "view instagram profile picture 1080p",
    "insta dp downloader hd",
    "instagram avatar downloader",
    "view private instagram profile picture full size",
    "save instagram dp online",
    "gramsave profile downloader",
  ],
  alternates: {
    canonical: "https://gramsave.site/profile-downloader",
  },
  openGraph: {
    title: "Instagram Profile Picture Downloader - Full Size 1080p HD DP Viewer",
    description:
      "Save uncropped 1080p Instagram profile pictures anonymously without login. Zoom and download original avatars on iPhone, Android, and PC.",
    url: "https://gramsave.site/profile-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Profile Picture Downloader - 1080p Full HD DP",
    description: "Zoom and download full-size Instagram profile pictures in 1 click.",
  },
};

const PROFILE_FAQS: FaqItem[] = [
  {
    q: "Why does the official Instagram app prevent zooming into profile pictures?",
    a: "Unlike WhatsApp or Facebook, Instagram's mobile app and website restrict profile avatars to a fixed circular container (typically rendered at just 150 × 150 or 56 × 56 pixels) without any native tap-to-zoom feature. However, when users upload their display picture, Instagram generates and stores a master uncompressed 1080 × 1080 pixel JPG file on Meta CDN servers. GramSave bypasses client-side restrictions to deliver the authentic full-resolution file.",
  },
  {
    q: "Can I view and download profile pictures from private Instagram accounts?",
    a: "Yes. Under Instagram's platform architecture, profile pictures (avatars), usernames, and bios are always hosted publicly on Meta CDN edge servers, even if the user's posts, reels, and stories are set to private. GramSave retrieves the public master display picture for both public and private profiles with 100% reliability.",
  },
  {
    q: "Will the profile owner know that I viewed or downloaded their profile picture?",
    a: "No, never. GramSave operates with total anonymity. Instagram does not notify creators when their profile picture is inspected or saved, and we do not request or log your Instagram credentials.",
  },
  {
    q: "Can I enter just the @username instead of pasting a full URL?",
    a: "Yes! You can enter either the complete URL (e.g., https://www.instagram.com/cristiano/) or simply the username handle with or without the @ symbol (e.g., @cristiano or cristiano). Our system automatically resolves the account.",
  },
  {
    q: "What is the resolution and file format of the downloaded DP?",
    a: "Profile pictures are saved as high-clarity 1080 × 1080 pixel JPG images (or the highest resolution master image uploaded by the creator). It is uncropped, meaning you receive the entire square image before Instagram applied its circular mask.",
  },
  {
    q: "How do I save an Instagram profile picture on iPhone or Android?",
    a: "On iPhone (iOS Safari), enter the username, tap 'Download Full HD Profile Picture', open the downloaded file from Safari's download manager, tap Share, and select 'Save Image'. On Android (Chrome), tap 'Download Full HD Profile Picture' and the JPG will instantly save directly to your Downloads folder and Google Photos gallery.",
  },
];

export default function ProfileDownloaderPage() {
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
            name: "Instagram Profile Picture Downloader",
            item: "https://gramsave.site/profile-downloader",
          },
        ],
      },
      {
        "@type": "WebApplication",
        name: "GramSave Instagram Profile Picture Downloader",
        url: "https://gramsave.site/profile-downloader",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Free online utility to view and download full-size 1080p Instagram profile pictures (DP) anonymously without login.",
      },
      {
        "@type": "FAQPage",
        mainEntity: PROFILE_FAQS.map((faq) => ({
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
              <span className="breadcrumb-current">Instagram Profile Picture Downloader</span>
            </nav>

            <h2 className="section-title" style={{ textAlign: "left", marginBottom: "18px" }}>
              Instagram Full-Size HD Profile Picture &amp; DP Viewer Online
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "24px" }}>
              Have you ever wanted to see someone’s Instagram profile picture in full size, only to find that tapping on their avatar does nothing? The official Instagram app shrinks display photos into a tiny circular frame, making it impossible to see details, facial features, or artistic backgrounds. <strong>GramSave Instagram Profile Picture Downloader</strong> solves this by retrieving the <strong>uncropped, original 1080p master file</strong> directly from Meta CDN servers in full resolution.
            </p>

            {/* Features Grid */}
            <div className="features-grid" style={{ marginBottom: "50px" }}>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3 className="feature-title">Uncropped 1080p Full HD</h3>
                <p className="feature-desc">
                  View the full square original master image (1080 × 1080 px) uploaded by the creator before Instagram cropped it into a small circle.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3 className="feature-title">Public &amp; Private Accounts</h3>
                <p className="feature-desc">
                  Works seamlessly for both public profiles and private accounts. Instagram profile pictures are always public at the CDN level.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">100% Anonymous &amp; Free</h3>
                <p className="feature-desc">
                  No Instagram login, password, or third-party app installation required. The account owner is never notified that you viewed or saved their DP.
                </p>
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              How to Download Instagram Profile Pictures in Full HD
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Save any user’s high-resolution display photo in three easy steps:
            </p>

            <div className="steps-grid" style={{ marginBottom: "50px" }}>
              <div className="step-card">
                <div className="step-number">1</div>
                <h4 className="step-title">Enter Username or Link</h4>
                <p className="step-desc">
                  Type any Instagram username (e.g. <code>@cristiano</code> or <code>cristiano</code>) or paste their profile URL into the search box above.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h4 className="step-title">Click Download</h4>
                <p className="step-desc">
                  Our system communicates with Meta edge servers to locate the master uncropped 1080p JPG avatar file within milliseconds.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h4 className="step-title">Zoom &amp; Save</h4>
                <p className="step-desc">
                  Click the avatar to inspect it in fullscreen zoom, then tap <strong>Download Full HD (1080p JPG)</strong> to save it directly to your device.
                </p>
              </div>
            </div>

            {/* Why Users Love GramSave DP Downloader */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                marginBottom: "50px",
              }}
            >
              <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
                Why Download Original Instagram Avatars with GramSave?
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "16px" }}>
                Whether you lost your own original high-resolution avatar file and need to recover it, want to confirm the identity of a business account or private follower before accepting a request, or need a clean reference picture for graphic design and fan edits, GramSave provides instant, watermark-free access to master image files.
              </p>
              <ul style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.9, paddingLeft: "20px" }}>
                <li><strong>No Screenshot Quality Loss:</strong> Screenshots capture blurry 150px phone renders. GramSave extracts the authentic 1080x1080 JPG master.</li>
                <li><strong>Unmasked Square Canvas:</strong> Instagram forces a circular mask that clips corners. GramSave reveals the complete square original image.</li>
                <li><strong>Universal Device Compatibility:</strong> Works flawlessly on Apple iPhone, iPad, Android smartphones, Windows PC, Mac, and Chromebooks.</li>
              </ul>
            </div>

            {/* FAQ Section */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Frequently Asked Questions (FAQ)
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", marginBottom: "24px" }}>
              Everything you need to know about viewing and downloading Instagram profile pictures:
            </p>

            <FaqAccordion items={PROFILE_FAQS} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
