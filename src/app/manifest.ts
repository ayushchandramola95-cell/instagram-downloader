import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GramSave - Free Instagram Downloader (1080p)",
    short_name: "GramSave",
    description:
      "Save Instagram Reels, Videos, Stories, and Photos in 1080p Full HD MP4 and 320kbps MP3 without login.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0c10",
    theme_color: "#ec4899",
    orientation: "portrait",
    categories: ["multimedia", "utilities", "entertainment"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
