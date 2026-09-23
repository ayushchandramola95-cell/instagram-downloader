import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0c10",
};

export const metadata: Metadata = {
  title: "InstaSnap - Free Instagram Video, Reels & Story Downloader (1080p HD)",
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
  authors: [{ name: "InstaSnap Team" }],
  creator: "InstaSnap",
  publisher: "InstaSnap",
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
    url: "https://instasnap.app",
    title: "InstaSnap - Free Instagram Video, Reels & Story Downloader (1080p)",
    description:
      "Instant high-quality Instagram video & reels downloader. 100% free, safe and works on iPhone, Android, and PC.",
    siteName: "InstaSnap",
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaSnap - Free Instagram Video Downloader",
    description:
      "Download Instagram Reels, Stories, and Videos in Full HD 1080p. Fast, free, no login needed.",
  },
  alternates: {
    canonical: "https://instasnap.app",
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
        "@id": "https://instasnap.app/#webapp",
        name: "InstaSnap Instagram Video Downloader",
        url: "https://instasnap.app",
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
            text: "Paste the copied Instagram URL into the input field at InstaSnap.",
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
        "@id": "https://instasnap.app/#organization",
        name: "InstaSnap",
        url: "https://instasnap.app",
        logo: "https://instasnap.app/favicon.ico",
      },
      {
        "@type": "WebSite",
        "@id": "https://instasnap.app/#website",
        url: "https://instasnap.app",
        name: "InstaSnap",
        publisher: { "@id": "https://instasnap.app/#organization" },
      },
    ],
  };

  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('instasnap-theme');
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
