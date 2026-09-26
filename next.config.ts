import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable x-powered-by header for security and footprint reduction
  poweredByHeader: false,

  // Enable Gzip/Brotli compression for all text-based assets
  compress: true,

  // React Strict Mode for robust component lifecycle
  reactStrictMode: true,

  // Automatically trace dependencies and produce a minimal standalone build for Docker
  output: "standalone",

  // HTTP Security and Caching Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
