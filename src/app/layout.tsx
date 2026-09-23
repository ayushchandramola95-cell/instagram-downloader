import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0c10",
};

export const metadata: Metadata = {
  title: "GramSave - Free Instagram Video, Reels & Story Downloader (1080p HD)",
  description:
    "Fast, free and anonymous online Instagram video downloader. Save Instagram Reels, Stories, Photos, and Audio in high quality 1080p MP4. No app or login required.",
  keywords: [
    "Instagram video downloader",
    "download Instagram reels",
    "Instagram story saver",
    "download IG video 1080p",
    "Instagram to MP4",
    "Instagram audio downloader",
    "save Instagram post",
  ],
  authors: [{ name: "GramSave Team" }],
  creator: "GramSave",
  publisher: "GramSave",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gramsave.site",
    title: "GramSave - Free Instagram Video, Reels & Story Downloader (1080p)",
    description:
      "Instant high-quality Instagram video & reels downloader. 100% free, safe and works on iPhone, Android, and PC.",
    siteName: "GramSave",
  },
  twitter: {
    card: "summary_large_image",
    title: "GramSave - Free Instagram Video Downloader",
    description:
      "Download Instagram Reels, Stories, and Videos in Full HD 1080p. Fast, free, no login needed.",
  },
  alternates: {
    canonical: "https://gramsave.site",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://gramsave.site/#webapp",
        name: "GramSave Instagram Video Downloader",
        url: "https://gramsave.site",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        description:
          "Online tool to download Instagram Videos, Reels, Stories and Photos in Full HD.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "18450",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "HowTo",
        name: "How to Download Instagram Videos & Reels",
        description:
          "Step-by-step guide to download any Instagram video, reel, or story for free.",
        step: [
          {
            "@type": "HowToStep",
            name: "Step 1: Copy Link",
            text: "Open the Instagram app or website, find the Reel or Video, tap the Share icon, and select 'Copy Link'.",
            position: 1,
          },
          {
            "@type": "HowToStep",
            name: "Step 2: Paste Link",
            text: "Paste the copied Instagram URL into the input field at GramSave.",
            position: 2,
          },
          {
            "@type": "HowToStep",
            name: "Step 3: Download Media",
            text: "Click 'Download', select your desired resolution (1080p, 720p, or MP3), and save the file to your device.",
            position: 3,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://gramsave.site/#organization",
        name: "GramSave",
        url: "https://gramsave.site",
        logo: "https://gramsave.site/favicon.ico",
      },
      {
        "@type": "WebSite",
        "@id": "https://gramsave.site/#website",
        url: "https://gramsave.site",
        name: "GramSave",
        publisher: { "@id": "https://gramsave.site/#organization" },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('gramsave-theme') || localStorage.getItem('instasnap-theme');
                  var initial = saved || 'dark';
                  document.documentElement.setAttribute('data-theme', initial);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
