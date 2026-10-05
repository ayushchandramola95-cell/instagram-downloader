import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gramsave.site";
  const now = new Date();

  const mainPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/reels-downloader", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/story-saver", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/photo-downloader", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/profile-downloader", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/dp-viewer", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/audio-downloader", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/carousel-downloader", priority: 0.9, changeFrequency: "daily" as const },
  ];

  const legalPages = [
    { path: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.3, changeFrequency: "monthly" as const },
  ];

  const guidePages = [
    { path: "/guides", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/guides/instagram-downloader-not-working-fixes", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guides/how-to-save-instagram-reels-to-camera-roll", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guides/how-to-download-instagram-audio-mp3", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const mainEntries: MetadataRoute.Sitemap = mainPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const guideEntries: MetadataRoute.Sitemap = guidePages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const legalEntries: MetadataRoute.Sitemap = legalPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return [...mainEntries, ...guideEntries, ...legalEntries];
}
