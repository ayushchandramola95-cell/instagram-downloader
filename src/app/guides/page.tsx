import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Instagram Guides, Tutorials & Troubleshooting Fixes | GramSave",
  description:
    "Free step-by-step guides, troubleshooting solutions, and tips for downloading Instagram Reels, Stories, Photos, and Audio MP3 in 1080p Full HD without watermark.",
  keywords: [
    "Instagram downloader guides",
    "Instagram video download tutorial",
    "save Instagram reels to camera roll",
    "Instagram downloader not working",
    "extract audio from Instagram reels",
    "download Instagram stories anonymously",
    "GramSave guides",
  ],
  alternates: {
    canonical: "https://gramsave.site/guides",
  },
  openGraph: {
    title: "Instagram Guides, Tutorials & Troubleshooting Fixes | GramSave",
    description:
      "Comprehensive, free step-by-step guides and troubleshooting tips for downloading Instagram media in high quality.",
    url: "https://gramsave.site/guides",
    siteName: "GramSave",
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "GramSave Guides and Tutorials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instagram Guides & Troubleshooting | GramSave",
    description:
      "Actionable tutorials and solutions for downloading Instagram Reels, Stories, Photos, and Audio.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
};

const GUIDES = [
  {
    slug: "instagram-downloader-not-working-fixes",
    title: "Instagram Downloader Not Working? 7 Proven Fixes That Actually Work",
    excerpt:
      "Is your Instagram video or reel download failing? Discover the 7 most common causes (cookie blocks, private accounts, expired story tokens) and how to resolve them instantly.",
    tag: "Fixes & Solutions",
    tagClass: "guide-tag-fix",
    readTime: "6 min read",
    icon: "🔧",
    updatedDate: "October 2026",
  },
  {
    slug: "how-to-save-instagram-reels-to-camera-roll",
    title: "How to Save Instagram Reels to Camera Roll (iPhone & Android) Without Watermark",
    excerpt:
      "Step-by-step guide to saving high-resolution 1080p Instagram Reels directly to your Apple Photos camera roll or Android gallery with crystal-clear audio and zero watermarks.",
    tag: "Device Guide",
    tagClass: "guide-tag-device",
    readTime: "5 min read",
    icon: "📱",
    updatedDate: "October 2026",
  },
  {
    slug: "how-to-download-instagram-audio-mp3",
    title: "How to Download Audio from Instagram Reels as MP3 (320kbps High Quality)",
    excerpt:
      "Learn how to extract trending songs, viral background sounds, and audio tracks from Instagram Reels into studio-grade 320kbps MP3 files for ringtones and video editing.",
    tag: "Audio & Music",
    tagClass: "guide-tag-audio",
    readTime: "4 min read",
    icon: "🎵",
    updatedDate: "October 2026",
  },
];

export default function GuidesHubPage() {
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
            name: "Guides & Tutorials",
            item: "https://gramsave.site/guides",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": "https://gramsave.site/guides#collection",
        name: "GramSave Guides and Troubleshooting Tutorials",
        url: "https://gramsave.site/guides",
        description:
          "Educational tutorials and troubleshooting walkthroughs for downloading Instagram media.",
        hasPart: GUIDES.map((g, idx) => ({
          "@type": "Article",
          position: idx + 1,
          name: g.title,
          headline: g.title,
          url: `https://gramsave.site/guides/${g.slug}`,
          description: g.excerpt,
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
      <Header />

      <main id="main-content">
        <section className="guides-hero container">
          {/* Breadcrumb */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ justifyContent: "center", marginBottom: "20px" }}>
            <Link href="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Guides & Tutorials</span>
          </nav>

          <div className="guides-badge">📚 Expert Guides & Tips</div>
          <h1 className="guides-title">
            Master <span>Instagram Downloads</span>
          </h1>
          <p className="guides-subtitle">
            Reliable tutorials, troubleshooting walkthroughs, and step-by-step guides to help you save and enjoy Instagram Reels, Stories, Photos, and Audio without watermarks or app installations.
          </p>

          <div className="guides-grid">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="guide-card"
              >
                <div>
                  <div className="guide-card-meta">
                    <span className={`guide-tag ${guide.tagClass}`}>{guide.tag}</span>
                    <span className="guide-read-time">⏱️ {guide.readTime}</span>
                  </div>
                  <h2 className="guide-card-title">{guide.title}</h2>
                  <p className="guide-card-desc">{guide.excerpt}</p>
                </div>
                <div className="guide-card-footer">
                  <span>Read Full Tutorial</span>
                  <span className="guide-card-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Downloader Banner */}
          <div className="article-tool-cta" style={{ maxWidth: "860px", margin: "0 auto" }}>
            <h3>Ready to Download Instagram Media Right Now?</h3>
            <p>
              Jump directly to our free, instant online tool. No login, no watermarks, and full 1080p HD support.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/reels-downloader" className="article-cta-btn">
                🎬 Download Reels
              </Link>
              <Link href="/story-saver" className="article-cta-btn" style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid var(--border-subtle)" }}>
                ⚡ Save Stories
              </Link>
              <Link href="/audio-downloader" className="article-cta-btn" style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid var(--border-subtle)" }}>
                🎵 Extract MP3
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
