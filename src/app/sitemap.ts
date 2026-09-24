import type { MetadataRoute } from "next";

const SUPPORTED_LANGS = ["en", "es", "pt", "id", "hi", "fr", "ar", "de"];

function getLanguageAlternates(baseUrl: string, path: string): Record<string, string> {
  const alternates: Record<string, string> = {
    "x-default": `${baseUrl}${path}`,
  };
  for (const lang of SUPPORTED_LANGS) {
    alternates[lang] = `${baseUrl}${path}?lang=${lang}`;
  }
  return alternates;
}

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

  const mainEntries: MetadataRoute.Sitemap = mainPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: getLanguageAlternates(baseUrl, page.path),
    },
  }));

  const legalEntries: MetadataRoute.Sitemap = legalPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  return [...mainEntries, ...legalEntries];
}
