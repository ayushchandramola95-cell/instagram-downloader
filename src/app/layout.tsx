import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-primary",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0c10",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gramsave.site"),
  title: "GramSave - Instagram Video & Reels Downloader (1080p Full HD)",
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
    "descargar reels instagram",
    "baixar videos do instagram",
    "telecharger video instagram",
    "download reels without watermark",
    "instagram video download 1080p full hd",
  ],
  authors: [{ name: "GramSave Team" }],
  creator: "GramSave",
  publisher: "GramSave",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
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
    images: [
      {
        url: "https://gramsave.site/og-image.jpg",
        width: 1280,
        height: 720,
        alt: "GramSave - Free Instagram Video & Reels Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GramSave - Free Instagram Video Downloader (1080p Full HD)",
    description:
      "Download Instagram Reels, Stories, and Videos in Full HD 1080p. Fast, free, no login needed.",
    images: ["https://gramsave.site/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    title: "GramSave",
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: "C5UQ7HaQUxV7NEBuxeFfFJGSOQZHu8L0PNxRyLWYZvk",
    other: {
      "msvalidate.01": "2EA3528350FD8B03C8FEF1FA95AE624E",
    },
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
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": "https://gramsave.site/#webapp",
        name: "GramSave - Instagram Video & Reels Downloader",
        url: "https://gramsave.site",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All, Windows, macOS, Android, iOS, Linux",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        description:
          "Online tool to download Instagram Videos, Reels, Stories, Photos and DP in Full HD 1080p.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "18450",
          reviewCount: "18450",
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
        logo: "https://gramsave.site/icons/icon-512.png",
      },
      {
        "@type": "WebSite",
        "@id": "https://gramsave.site/#website",
        url: "https://gramsave.site",
        name: "GramSave",
        alternateName: [
          "GramSave",
          "GramSave Instagram Downloader",
          "GramSave.site",
        ],
        publisher: { "@id": "https://gramsave.site/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://gramsave.site/?url={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className={plusJakartaSans.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        {(() => {
          const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-T7K7C7RJV1";
          return gaId ? (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          ) : null;
        })()}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.setAttribute('data-theme', 'light');
                  localStorage.setItem('gramsave-theme', 'light');
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
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
